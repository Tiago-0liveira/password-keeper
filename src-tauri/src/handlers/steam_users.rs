use crate::database::{database::DatabaseModel, steam_users::SteamUser, utils::Either};
use crate::database::steam_api_keys::SteamApiKey;
use crate::database::steam_users;

#[tauri::command]
pub fn steam_users_get_all_rows() -> Vec<SteamUser> {
    SteamUser::get_all().unwrap_or_else(|err| {
        println!("get_steam_users_all_rows::error::{:?}", err);
        vec![]
    })
}

#[tauri::command]
pub fn steam_users_get_one(uuid: i32) -> Option<SteamUser> {
    match SteamUser::get_one(uuid) {
        Ok(user) => Some(user),
        Err(err) => {
            eprintln!("err: {}", err);
            None
        },
    }
}

#[tauri::command]
pub async fn steam_users_validate_and_insert(user: SteamUser) -> Result<SteamUser, steam_users::Error> {
    let mut mut_user = user.clone();
    let api_keys = SteamApiKey::get_all().unwrap_or_else(|err| {
        eprintln!("steam_users_validate_and_insert::error::{}", err);
        vec![]
    });
    let to_fetch_users = vec![&mut_user];
    let steam_user_details = SteamUser::fetch_multiple(&api_keys, &to_fetch_users).await;
    match steam_user_details {
        Ok(details) => {
            if details.len() > 0 {
                mut_user.set_new_detail(&details[0], true);
            }
        },
        Err(err) => {
            eprintln!("steam_users_validate_and_insert::error::{:?}", err);
            return Err(steam_users::Error::InvalidSteamId);
        }
    }
    match mut_user.force_save() {
        Ok(_) => Ok(mut_user),
        Err(error) => {
            match error {
                Either::Left(err) => {
                    eprintln!("{:?}", err);
                    Err(err)
                },
                Either::Right(err) => {
                    eprintln!("{}", err);
                    Err(steam_users::Error::ErrorMessage(err.to_string()))
                }
            }
        }
    }
}

#[tauri::command]
pub fn steam_users_delete(uuid: i32) -> Result<(), steam_users::Error> {
    SteamUser::delete_by_uuid(uuid)
}

#[tauri::command]
pub fn steam_users_update(user: SteamUser) -> Result<SteamUser, steam_users::Error> {
    match user.force_update() {
        Ok(_) => Ok(user),
        Err(error) => {
            match error {
                Either::Left(err) => {
                    eprintln!("{:?}", err);
                    Err(err)
                },
                Either::Right(err) => {
                    eprintln!("{}", err);
                    Err(steam_users::Error::ErrorMessage(err.to_string()))
                }
            }
        }
    }
}

