// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
mod database;
mod handlers;

use tauri::Manager;
use handlers::{
	password_vault::{
		password_vault_get_all_rows, password_vault_get_one,
		password_vault_delete, password_vault_validate_and_insert,
		password_vault_update
	},
	steam::{
		steam_get_initial_load,
		steam_launch_as,
		steam_shutdown
	},
	steam_users:: {
		steam_users_get_all_rows, steam_users_get_one,
		steam_users_delete, steam_users_validate_and_insert
	},
	steam_api_keys::{
		steam_api_keys_get_all,steam_api_keys_get_one,
		steam_api_keys_delete, steam_api_keys_validate_and_insert
	}
};

use database::database::DB_PATH;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
		.setup(|app| {
			if cfg!(debug_assertions) {
				match DB_PATH.set("test.db") {
					Ok(()) => return Ok(()),
					Err(err) => panic!("Failed to set DB_PATH: {:?}", err)
				}
			};
			let handle = app.handle();

			let app_data_path = match handle.path().app_local_data_dir() {
				Ok(path) => path.join("db.db").to_str().unwrap().to_string(),
				Err(err) => panic!("Failed to get app data path: {:?}", err)
			};
			eprintln!("App data path: {}", app_data_path);
			let path: &'static str = Box::leak(app_data_path.into_boxed_str());
			match DB_PATH.set(path) {
				Ok(()) => Ok(()),
				Err(err) => panic!("Failed to set DB_PATH: {:?}", err)
			}
		})
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
			/* password_vault handlers */
			password_vault_get_all_rows, password_vault_get_one, password_vault_delete,
			password_vault_validate_and_insert, password_vault_update,
			/* steam */
			steam_get_initial_load,
			steam_launch_as,
			steam_shutdown,
			/* steam_users handlers */
			steam_users_get_all_rows, steam_users_get_one,
			steam_users_delete, steam_users_validate_and_insert,
			/* steam_api_keys handlers */
			steam_api_keys_get_all, steam_api_keys_get_one,
			steam_api_keys_delete, steam_api_keys_validate_and_insert
		])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
