use crate::database::database::DatabaseModel;
use crate::database::steam_api_keys;
use crate::database::steam_api_keys::{SteamApiKey, prepare_keys_for_frontend};
use crate::database::utils::Either;

#[tauri::command]
pub fn steam_api_keys_get_all() -> Vec<SteamApiKey> {
	let mut keys = SteamApiKey::get_all().unwrap_or_else(|err| {
		eprintln!("steam_api_keys_get_all::error::{}", err);
		vec![]
	});
	prepare_keys_for_frontend(&mut keys);
	keys
}

#[tauri::command]
pub fn steam_api_keys_get_one(uuid: i32) -> Option<SteamApiKey> {
	match SteamApiKey::get_one(uuid) {
		Ok(keys) => Some(keys),
		Err(err) => {
			eprintln!("steam_api_keys_get_one::error::{}", err);
			None
		},
	}
}

#[tauri::command]
pub async fn steam_api_keys_validate_and_insert(key: String) -> Result<SteamApiKey, steam_api_keys::Error> {
	let mut mut_key = SteamApiKey::new(key);
	match mut_key.test_key("76561199123627139").await {
		Ok(_) => {
			match mut_key.force_save() {
				Ok(_) => {
					mut_key.checked = true;
					Ok(mut_key)
				},
				Err(error) => {
					match error {
						Either::Left(err) => {
							eprintln!("{:?}", err);
							Err(err)
						},
						Either::Right(err) => {
							eprintln!("{}", err);
							Err(steam_api_keys::Error::ErrorMessage(err.to_string()))
						}
					}
				}
			}

		},
		Err(err) => {
			eprintln!("steam_api_keys_validate_and_insert::error::{:?}", err);
			Err(steam_api_keys::Error::InvalidKey)
		}
	}
}

#[tauri::command]
pub fn steam_api_keys_delete(uuid: i32) -> Result<(), steam_api_keys::Error> {
	SteamApiKey::delete_by_uuid(uuid)
}
