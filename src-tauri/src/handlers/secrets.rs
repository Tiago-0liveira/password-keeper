use crate::database::secrets;
use crate::database::{database::DatabaseModel, secrets::Secret, utils::Either};

#[tauri::command]
pub fn secrets_get_all_rows() -> Vec<Secret> {
    Secret::get_all().unwrap_or_else(|err| {
        println!("get_password_vault_all_rows::error::{:?}", err);
        vec![]
    })
}
#[tauri::command]
pub fn secrets_validate_and_insert(secret: Secret) -> Result<Secret, secrets::Error> {
    let mut mut_secret = secret.clone();
    match mut_secret.save() {
        Ok(_) => Ok(mut_secret),
        Err(error) => match error {
            Either::Left(err) => {
                eprintln!("{:?}", err);
                Err(err)
            }
            Either::Right(err) => {
                eprintln!("{}", err);
                Err(secrets::Error::ErrorMessage(err.to_string()))
            }
        },
    }
}

#[tauri::command]
pub fn secrets_delete(uuid: i32) -> Result<(), secrets::Error> {
    Secret::delete_by_uuid(uuid)
}

#[tauri::command]
pub fn secrets_update(secret: Secret) -> Result<Secret, secrets::Error> {
    match secret.force_update() {
        Ok(_) => Ok(secret),
        Err(error) => match error {
            Either::Left(err) => {
                eprintln!("{:?}", err);
                Err(err)
            }
            Either::Right(err) => {
                eprintln!("{}", err);
                Err(secrets::Error::ErrorMessage(err.to_string()))
            }
        },
    }
}
