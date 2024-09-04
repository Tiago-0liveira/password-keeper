use std::time::Duration;
use reqwest::blocking::Client;
use rusqlite::Connection;

use super::{database::DatabaseModel, utils::Pair};
use crate::{make_uuid_struct, dm_error};
use crate::database::steam_users::SteamUser;
use crate::database::validation::ValidatableStrings;

make_uuid_struct! {
	SteamApiKey {
		api_key: String,
		checked: bool
	}
}

dm_error! {
	Error {
		InvalidKey => "Invalid Key",
		InvalidKeyLen => "Invalid Key Length",
		InvalidKeyFormat => "Every character must be alphanumeric",
	}
}


impl DatabaseModel<Error> for SteamApiKey {
	const TABLE_NAME: &'static str = "SteamApiKeys";

	fn default() -> SteamApiKey {
		SteamApiKey {
			uuid: Self::DEFAULT_UUID,
			api_key: String::from(""),
			checked: false
		}
	}
	fn from_row(row: &rusqlite::Row) -> SteamApiKey {
		SteamApiKey {
			uuid: row.get(0).unwrap(),
			api_key: row.get(1).unwrap(),
			checked: true
		}
	}
	fn ensure_table_exists(conn: &Connection) {
		let sql_query = format!("CREATE TABLE IF NOT EXISTS {} (
			uuid INTEGER PRIMARY KEY,
			api_key TEXT NOT NULL UNIQUE
		)", Self::TABLE_NAME);
		conn.execute(&sql_query, []).unwrap();
	}
	fn __get_save_params(&self) -> Pair<String, Box<[&dyn rusqlite::ToSql]>> {
		let sql_query = format!("INSERT INTO {} (api_key) VALUES (?)", Self::TABLE_NAME);
		let params: Box<[&dyn rusqlite::ToSql]> = Box::new([&self.api_key]);
		Pair(sql_query, params)
	}
	fn __get_update_params(&self) -> Pair<String, Box<[&dyn rusqlite::ToSql]>> {
		let sql_query = format!("UPDATE {} SET api_key = ? WHERE uuid = ?", Self::TABLE_NAME);
		let params: Box<[&dyn rusqlite::ToSql]> = Box::new([&self.api_key, &self.uuid]);
		Pair(sql_query, params)
	}
	fn validate(&self) -> Result<(), Error> {
		tokio::task::block_in_place(|| {
			tokio::runtime::Handle::current().block_on(self.test_key("76561199123627139"))
		})
	}
}

pub fn prepare_keys_for_frontend(keys: &mut Vec<SteamApiKey>) {
	while keys.len() < SteamApiKey::MAX_KEYS {
		keys.push(SteamApiKey::default());
	}
}

impl SteamApiKey {
	pub const MAX_KEYS: usize = 5;
	const KEY_LEN: usize = 32;

	pub fn new(api_key: String) -> SteamApiKey {
		SteamApiKey {
			uuid: Self::DEFAULT_UUID,
			api_key,
			checked: false
		}
	}
	pub async fn test_key(&self, steam_id: &str) -> Result<(), Error> {
		if self.api_key.len() != Self::KEY_LEN { return Err(Error::InvalidKeyLen); }
		else if !self.api_key.is_valid_steam_api_key() { return Err(Error::InvalidKeyFormat); }
		let mut the_chosen_one = SteamUser::default();
		the_chosen_one.steam_id = steam_id.to_string();/* actually my user lol */

		let client = Client::builder()
			.timeout(Duration::from_millis(1000))
			.build().unwrap();
		match client.get(SteamUser::make_fetch_details_url(&self.api_key, &vec![&the_chosen_one]))
			.send() {
			Ok(res) => {
				if res.status().is_success() {
					Ok(())
				} else {
					Err(Error::InvalidKey)
				}
			}
			Err(err) => {
				Err(Error::ErrorMessage(String::from(err.to_string())))
			}
		}
	}
}