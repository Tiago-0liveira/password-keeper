use std::cmp::PartialEq;
use std::os::windows::process::CommandExt;
use std::process::Stdio;
use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};
use crate::database::database::DatabaseModel;
use crate::database::steam_api_keys::{SteamApiKey, prepare_keys_for_frontend};
use crate::database::steam_users::SteamUser;
use windows::{
    core::PWSTR,
    Win32::Foundation::ERROR_SUCCESS,
    Win32::NetworkManagement::NetManagement::{
        NetApiBufferFree, NetUserEnum, NET_USER_ENUM_FILTER_FLAGS
    },
    Win32::System::Diagnostics::Debug::FORMAT_MESSAGE_FROM_SYSTEM,
    Win32::System::Diagnostics::Debug::FormatMessageW,
    core::PCWSTR,
};
use windows::Win32::NetworkManagement::NetManagement::USER_INFO_3;
/* Exactly equal to the one in the frontend, so it matches */
#[derive(Deserialize, PartialEq)]
pub enum SteamUserState {
    Running,
    Stopped,
    Launching
}

impl Serialize for SteamUserState {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        match self {
            SteamUserState::Running => serializer.serialize_i8(0),
            SteamUserState::Stopped => serializer.serialize_i8(1),
            SteamUserState::Launching => serializer.serialize_i8(2)
        }
    }
}

#[derive(Deserialize, Serialize)]
pub struct WindowsUser {
    name: String,
    in_use: bool
}

#[derive(Deserialize, Serialize)]
pub struct SteamProcess {
    win_username: String,
    state: SteamUserState
}

impl SteamProcess {
    fn get_status() -> SteamProcess {
        let cmd = r#"(Get-Process -Name steam | ForEach-Object {
                            (Get-WmiObject Win32_Process -Filter "ProcessId=$($_.Id)").GetOwner().User
                        })
        "#.trim();
        let output = std::process::Command::new("powershell")
            .arg("-Command")
            .arg(cmd)
            .stdout(Stdio::piped())  // Capture stdout
            .stderr(Stdio::null())   // Suppress stderr
            .creation_flags(0x08000000) // CREATE_NO_WINDOW flag
            .output()
            .expect("Failed to execute process");
        if output.status.success() {
            // Convert the output to a string and print it
            let stdout = String::from_utf8_lossy(&output.stdout);
            let name = stdout.strip_suffix("\r\n").unwrap_or_default();
            println!("Output:|{}|", name);
            SteamProcess { win_username: name.to_string(), state: SteamUserState::Running }
        } else {/* Steam not running */
            SteamProcess { win_username: String::default(), state: SteamUserState::Stopped }
        }
    }
    fn launch_as(user: &str) -> SteamProcess {
        let cmd = format!("runas.exe /user:{} /savecred {}", user, "\"C:\\Program Files (x86)\\Steam\\steam.exe\"");
        eprintln!("cmd: {}", cmd);
        let output = std::process::Command::new("powershell")
            .arg("-Command")
            .arg(cmd)
            .stdout(Stdio::piped())  // Capture stdout
            .stderr(Stdio::null())   // Suppress stderr
            .creation_flags(0x08000000) // CREATE_NO_WINDOW flag
            .output()
            .expect("Failed to execute process");
        eprintln!("output: {:?}", output);
        if output.status.success() {
            SteamProcess { win_username: user.to_string(), state: SteamUserState::Launching }
        } else {
            SteamProcess { win_username: String::default(), state: SteamUserState::Stopped }
        }
    }
}

impl WindowsUser {
    fn default() -> WindowsUser {
        WindowsUser {
            name: String::new(),
            in_use: false
        }
    }
    fn get_all() -> Vec<WindowsUser> {
        let mut p_buffer: *const core::ffi::c_void = std::ptr::null_mut();
        let mut entries_read = 0;
        let mut total_entries = 0;
        let mut users: Vec<WindowsUser> = vec![];

        unsafe {
            let status = NetUserEnum(
                PCWSTR::null(),     // Server name
                3,                        // Level
                NET_USER_ENUM_FILTER_FLAGS(0),                        // Filter
                &mut p_buffer as *mut _ as *mut _,
                0xFFFFFFFF,
                &mut entries_read,
                &mut total_entries,
                Some(std::ptr::null_mut()),
            );

            if status == ERROR_SUCCESS.0 {
                let p_user_info = p_buffer as *mut USER_INFO_3;
                for i in 0..entries_read {
                    let user_info = *p_user_info.add(i as usize);
                    if user_info.usri3_user_id >= 1000 {
                        users.push(WindowsUser {
                            in_use: false,
                            name:  user_info.usri3_name.to_string().unwrap()
                        });
                    }
                }
            } else {
                let mut buf = [0u16; 512];
                let ret = FormatMessageW(
                    FORMAT_MESSAGE_FROM_SYSTEM,
                    Some(std::ptr::null()),
                    status,
                    0,
                    PWSTR(buf.as_mut_ptr()),
                    buf.len() as u32,
                    Some(std::ptr::null()),
                );
                if ret > 0 {
                    let message = String::from_utf16_lossy(&buf[..ret as usize]);
                    eprintln!("Error: {}", message);
                } else {
                    eprintln!("Error code: {}", status);
                }
            }

            NetApiBufferFree(Some(p_buffer));
        }
        users
    }
}

#[derive(Deserialize, Serialize)]
pub struct SteamInitialLoad {
    users: Vec<SteamUser>,
    active: SteamUser,
    windows_users: Vec<WindowsUser>,
    api_keys: Vec<SteamApiKey>
}

impl SteamInitialLoad {
    const FETCH_TIME: i64 = 24 * 60 * 60 * 1000;
    fn empty() -> SteamInitialLoad {
        SteamInitialLoad {
            users: vec![], active: SteamUser::default(),
            windows_users: vec![], api_keys: vec![]
        }
    }
}

#[tauri::command]
pub async fn steam_get_initial_load() -> SteamInitialLoad {
    let mut init_load = SteamInitialLoad::empty();
    let mut steam_users = SteamUser::get_all().unwrap_or_else(|err| {
        eprintln!("steam_get_initial_load::error::{}", err);
        vec![]
    });
    let mut api_keys = SteamApiKey::get_all().unwrap_or_else(|err| {
        eprintln!("steam_get_initial_load::error::{}", err);
        vec![]
    });
    let mut windows_users = WindowsUser::get_all();
    let to_fetch_users = steam_users.iter().filter(|user| {
        if user.last_fetch <= 0 { return true; };
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_millis() as i64;
        now.saturating_sub(user.last_fetch) >= SteamInitialLoad::FETCH_TIME
    }).collect::<Vec<&SteamUser>>();

    if to_fetch_users.len() != 0 {
        let steam_user_details = SteamUser::fetch_multiple(&api_keys, &to_fetch_users)
            .await
            .unwrap_or_else(|err| {
                eprintln!("steam_get_initial_load::error::{:?}", err);
                vec![]
            });

        for user_detail in &steam_user_details {
            eprintln!("user_detail::{:#?}", &user_detail);
            for user in &mut steam_users {
                if user.steam_id == user_detail.steamid {
                    user.set_new_detail(&user_detail, true);
                    break;
                }
            }
        }
    }

    let steam_process = SteamProcess::get_status();

    if steam_process.state == SteamUserState::Running {
        for user in &mut steam_users {
            if user.windows_name == steam_process.win_username {
                init_load.active = user.clone();
                break;
            }
        }
        'outer: for windows_user in &mut windows_users {
            if windows_user.name == steam_process.win_username {
                for steam_user in &steam_users {
                    if steam_user.windows_name == steam_process.win_username {
                        windows_user.in_use = true;
                        break 'outer;
                    }
                }
            }
        }
    }
    init_load.windows_users = windows_users;
    prepare_keys_for_frontend(&mut api_keys);
    init_load.api_keys = api_keys;
    init_load.users = steam_users;
    init_load
}

#[tauri::command]
pub fn steam_launch_as(user: &str) -> SteamProcess {
    SteamProcess::launch_as(user)
}

#[tauri::command]
pub fn steam_shutdown() {
	let cmd = r#"taskkill /IM steam.exe /F"#.trim();
	let _output = std::process::Command::new("cmd")
		.arg("/C")
		.arg(cmd)
		.stdout(Stdio::null())  // Capture stdout
		.stderr(Stdio::null())   // Suppress stderr
		.creation_flags(0x08000000) // CREATE_NO_WINDOW flag
		.output()
		.expect("Failed to execute process");

}