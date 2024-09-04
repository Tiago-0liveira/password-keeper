use crate::database::{database::DatabaseModel, password_vault::PasswordVaultUser, utils::Either};
use crate::database::password_vault;

#[tauri::command]
pub fn password_vault_get_all_rows() -> Vec<PasswordVaultUser> {
	PasswordVaultUser::get_all().unwrap_or_else(|err| {
		println!("get_password_vault_all_rows::error::{:?}", err);
		vec![]
	})
}

#[tauri::command]
pub fn password_vault_get_one(uuid: i32) -> Option<PasswordVaultUser> {
	match PasswordVaultUser::get_one(uuid) {
		Ok(user) => Some(user),
		Err(err) => {
			eprintln!("err: {}", err);
			None
		},
	}
}

#[tauri::command]
pub fn password_vault_validate_and_insert(user: PasswordVaultUser) -> Result<PasswordVaultUser, password_vault::Error> {
	let mut mut_user = user.clone();
	match mut_user.save() {
		Ok(_) => Ok(mut_user),
		Err(error) => {
			match error {
				Either::Left(err) => {
					eprintln!("{:?}", err);
					Err(err)
				},
				Either::Right(err) => {
					eprintln!("{}", err);
					Err(password_vault::Error::ErrorMessage(err.to_string()))
				}
			}
		}
	}
}

#[tauri::command]
pub fn password_vault_delete(uuid: i32) -> Result<(), password_vault::Error> {
	PasswordVaultUser::delete_by_uuid(uuid)
}

#[tauri::command]
pub fn password_vault_update(user: PasswordVaultUser) -> Result<PasswordVaultUser, password_vault::Error> {
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
					Err(password_vault::Error::ErrorMessage(err.to_string()))
				}
			}
		}
	}
}

