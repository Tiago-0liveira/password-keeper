use rusqlite::Connection;

use crate::{make_uuid_struct, dm_error};

use super::database::DatabaseModel;
use super::utils::Pair;
use super::validation::ValidatableStrings;

make_uuid_struct! {
	PasswordVaultUser {
		site: String,
		email: String,
		password: String,
		username: Option<String>
	}
}

dm_error! {
	Error {
		InvalidSiteLen => "Site name must be between 4 and 50 characters long",
		InvalidEmailLen => "Email must be between 8 and 255 characters long",
		InvalidEmailFormat => "Invalid email format",
		InvalidPassword => "Password must be between 8 and 255 characters long",
	}
}


impl DatabaseModel<Error> for PasswordVaultUser {
	const TABLE_NAME: &'static str = "passwordVault";

	fn default() -> PasswordVaultUser {
		PasswordVaultUser {
			uuid: Self::DEFAULT_UUID,
			site: String::from(""),
			email: String::from(""),
			password: String::from(""),
			username: None,
		}
	}
	fn from_row(row: &rusqlite::Row) -> PasswordVaultUser {
		PasswordVaultUser {
			uuid: row.get(0).unwrap(),
			site: row.get(1).unwrap(),
			email: row.get(2).unwrap(),
			password: row.get(3).unwrap(),
			username: row.get(4).unwrap(),
		}
	}
	fn ensure_table_exists(conn: &Connection) {
		let sql_query = format!("CREATE TABLE IF NOT EXISTS {} (
			uuid INTEGER PRIMARY KEY,
			site TEXT NOT NULL,
			email TEXT NOT NULL,
			password TEXT NOT NULL,
			username TEXT
		)", Self::TABLE_NAME);
		conn.execute(&sql_query, []).unwrap();
	}
	fn __get_save_params(&self) -> Pair<String, Box<[&dyn rusqlite::ToSql]>> {
		let sql_query = format!("INSERT INTO {} (site, email, password, username) VALUES (?, ?, ?, ?)", Self::TABLE_NAME);
		let params: Box<[&dyn rusqlite::ToSql]> = Box::new([&self.site, &self.email, &self.password, &self.username]);
		Pair(sql_query, params)
	}
	fn __get_update_params(&self) -> Pair<String, Box<[&dyn rusqlite::ToSql]>> {
		let sql_query = format!("UPDATE {} SET site = ?, email = ?, password = ?, username = ? WHERE uuid = ?", Self::TABLE_NAME);
		let params: Box<[&dyn rusqlite::ToSql]> = Box::new([&self.site, &self.email, &self.password, &self.username, &self.uuid]);
		Pair(sql_query, params)
	}
	fn validate(&self) -> Result<(), Error>  {
		if !self.site.len_between(4, 50) {
			Err(Error::InvalidSiteLen)
		} else if !self.email.len_between(8, 255) {
			Err(Error::InvalidEmailLen)
		} else if !self.email.is_valid_email() {
			Err(Error::InvalidEmailFormat)
		} else if !self.password.len_between(8, 255) {
			Err(Error::InvalidPassword)
		} else {
			Ok(())
		}
	}
}

impl PasswordVaultUser {
	pub fn new(site: String, email: String, password: String, username: Option<String>) -> PasswordVaultUser {
		PasswordVaultUser {
			uuid: Self::DEFAULT_UUID,
			site,
			email,
			password,
			username,
		}
	}
}
