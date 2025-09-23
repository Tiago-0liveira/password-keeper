// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
mod database;
mod handlers;

use handlers::{
    password_vault::{
        password_vault_delete, password_vault_get_all_rows, password_vault_get_one,
        password_vault_update, password_vault_validate_and_insert,
    },
    steam::{steam_get_initial_load, steam_launch_as, steam_shutdown},
    steam_api_keys::{
        steam_api_keys_delete, steam_api_keys_get_all, steam_api_keys_get_one,
        steam_api_keys_validate_and_insert,
    },
    steam_users::{
        steam_users_delete, steam_users_get_all_rows, steam_users_get_one,
        steam_users_validate_and_insert,
    },
};
use tauri::Manager;

use database::database::DB_PATH;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Clone a handle that is safe to move into async
            let app_handle = app.handle().clone();

            // Run DB setup in background so it doesn't block window creation
            tauri::async_runtime::spawn(async move {
                if cfg!(debug_assertions) {
                    if let Err(err) = DB_PATH.set("test.db") {
                        eprintln!("Failed to set DB_PATH: {:?}", err);
                    }
                } else {
                    match app_handle.path().app_local_data_dir() {
                        Ok(path) => {
                            let app_data_path = path.join("db.db");
                            let path_str = app_data_path.to_str().unwrap().to_string();
                            eprintln!("App data path: {}", path_str);
                            let leaked: &'static str = Box::leak(path_str.into_boxed_str());
                            if let Err(err) = DB_PATH.set(leaked) {
                                eprintln!("Failed to set DB_PATH: {:?}", err);
                            }
                        }
                        Err(err) => {
                            eprintln!("Failed to get app data path: {:?}", err);
                        }
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            /* password_vault handlers */
            password_vault_get_all_rows,
            password_vault_get_one,
            password_vault_delete,
            password_vault_validate_and_insert,
            password_vault_update,
            /* steam */
            steam_get_initial_load,
            steam_launch_as,
            steam_shutdown,
            /* steam_users handlers */
            steam_users_get_all_rows,
            steam_users_get_one,
            steam_users_delete,
            steam_users_validate_and_insert,
            /* steam_api_keys handlers */
            steam_api_keys_get_all,
            steam_api_keys_get_one,
            steam_api_keys_delete,
            steam_api_keys_validate_and_insert
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
