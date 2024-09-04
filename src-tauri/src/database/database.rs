use lazy_static::lazy_static;
use rusqlite::{params, Connection, Error, ToSql};
use std::sync::{Mutex, MutexGuard, OnceLock};
use serde::Serialize;

use super::password_vault::PasswordVaultUser;
use super::steam_api_keys::SteamApiKey;
use super::steam_users::SteamUser;
use super::utils::{Either, Pair};
use super::unique_identifier::UniquelyIdentified;
pub static DB_PATH: OnceLock<&'static str> = OnceLock::new();

lazy_static! {
    static ref DB: Mutex<Connection> = match DB_PATH.get() {
		Some(path) => {
			Mutex::new(match Connection::open(path) {
				Ok(conn) => {/* Init tables */
					PasswordVaultUser::ensure_table_exists(&conn);
					SteamUser::ensure_table_exists(&conn);
					SteamApiKey::ensure_table_exists(&conn);
					conn
				},
				Err(err) => {
					panic!("Failed to open database: {:?}", err);
				},
			})
		},
		None => {
			panic!("Failed to get DB_PATH!");
		}
    };
}

pub fn get_db_connection() -> MutexGuard<'static, Connection> {
	DB.lock().unwrap()
}

fn db_get_all<T: DatabaseModel<U>, U: DMValidationError>(table_name: &str, row_mapper: fn(&rusqlite::Row) -> T) -> Result<Vec<T>, Error> {
	let conn = get_db_connection();
	let sql_query = format!("SELECT * FROM {}", table_name);
	let mut stmt = match conn.prepare(&sql_query) {
		Ok(stmt) => stmt,
		Err(err) => return Err(err)
	};
	let rows = match stmt.query_map(params!(), |row| {
		Ok(row_mapper(&row))
	}) {
		Ok(rows) => rows,
		Err(err) => return Err(err)
	};
	let mut res_rows: Vec<T> = Vec::new();
	for row in rows {
		res_rows.push(match row {
			Ok(row) => row,
			Err(err) => return Err(err)
		});
	}
	Ok(res_rows)
}

fn db_get_one<T: DatabaseModel<U>, U: DMValidationError>(table_name: &str, row_mapper: fn(&rusqlite::Row) -> T, uuid: i32) -> Result<T, Error> {
	let conn = get_db_connection();
	let sql_query = format!("SELECT * FROM {} WHERE uuid = ? LIMIT 1", table_name);
	let mut stmt = match conn.prepare(&sql_query) {
		Ok(stmt) => stmt,
		Err(err) => return Err(err)
	};
	match stmt.query_row([uuid], |row| { Ok(row_mapper(&row)) }) {
		Ok(row) => Ok(row),
		Err(err) => Err(err)
	}
}

/* DMValidationError enum */
pub trait DMValidationError {
	fn make_error(err: String) -> Self;
}

#[macro_export]
macro_rules! dm_error {
	($enum_name:ident { $($variant:ident => $message:expr,)* }) => {
		#[derive(Debug, serde::Serialize, serde::Deserialize)]
        pub enum $enum_name {
			ErrorMessage(String),
            $($variant,)*
        }

		impl crate::database::database::DMValidationError for $enum_name {
			fn make_error(err: String) -> Self {
				Self::ErrorMessage(String::from(err))
			}
		}
	};
}

/// A trait that will be implemented by all models that will be stored in the database
/// Brings a lot of usefull already implemented methods like `save()`, `update()`, `delete()`, `get_all()`, `get_one()`
pub trait DatabaseModel<T: DMValidationError>: UniquelyIdentified + Serialize {
	const TABLE_NAME: &'static str;

	fn default() -> Self;
	/// Will be called whenever fetching a row from the db to convert it to a struct the way you want
	fn from_row(row: &rusqlite::Row) -> Self;
	fn ensure_table_exists(conn: &Connection);
	fn get_all() -> Result<Vec<Self>, Error> where Self: Sized {
		db_get_all(Self::TABLE_NAME, Self::from_row)
	}
	fn get_one(uuid: i32) -> Result<Self, Error> where Self: Sized {
		db_get_one(Self::TABLE_NAME, Self::from_row, uuid)
	}
	fn __get_save_params(&self) -> Pair<String, Box<[&dyn ToSql]>>;
	fn __get_update_params(&self) -> Pair<String, Box<[&dyn ToSql]>>;
	/// Will be called by `Self::save()` and `Self::update()` before inserting or updating the db
	fn validate(&self) -> Result<(), T>;
	/// Will call `Self::validate()` before saving
	fn force_save(&mut self) -> Result<(), Either<T, Error>> {
		let conn = get_db_connection();
		let Pair(sql_query, params) = self.__get_save_params();
		match conn.execute(&sql_query, params.as_ref()) {
			Ok(_) => {
				self.set_uuid(conn.last_insert_rowid() as i32);
				Ok(())
			},
			Err(err) => Err(Either::Right(err))
		}
	}
	/// Will not call `Self::validate()` before saving
	fn save(&mut self) -> Result<(), Either<T, Error>> {
		match self.validate() {/* Better validation errors in the future */
			Ok(_) => (),
			Err(err) => return Err(Either::Left(err))
		}
		self.force_save()
	}
	fn __delete(uuid: i32) -> Result<(), T> {
		let conn = get_db_connection();
		let sql_query = format!("DELETE FROM {} WHERE uuid = ?", Self::TABLE_NAME);
		match conn.execute(&sql_query, [uuid]) {
			Ok(_) => Ok(()),
			Err(err) => Err(T::make_error(err.to_string()))
		}
	}
	fn delete(&self) -> Result<(), T> {
		Self::__delete(self.get_uuid())
	}
	fn delete_by_uuid(uuid: i32) -> Result<(), T> {
		Self::__delete(uuid)
	}
	fn force_update(&self) -> Result<(), Either<T, Error>> {
		let conn = get_db_connection();
		let Pair(sql_query, params) = self.__get_update_params();
		match conn.execute(&sql_query, params.as_ref()) {
			Ok(_) => Ok(()),
			Err(err) => Err(Either::Right(err))
		}
	}
	fn update(&self) -> Result<(), Either<T, Error>> {
		match self.validate() {
			Ok(_) => (),
			Err(err) => return Err(Either::Left(err))
		}
		self.force_update()
	}
}