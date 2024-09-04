use std::time::{SystemTime, UNIX_EPOCH};
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use super::{database::DatabaseModel, utils::Pair, validation::ValidatableStrings};
use crate::{make_uuid_struct, dm_error};
use crate::database::steam_api_keys::SteamApiKey;

make_uuid_struct! {
	SteamUser {
		steam_id: String,
		windows_name: String,
		steam_name: String,
		avatar_path: String,
		last_fetch: i64
	}
}

dm_error! {
	Error {
		InvalidSteamId => "Invalid Steam Id",
	}
}

impl DatabaseModel<Error> for SteamUser {
	const TABLE_NAME: &'static str = "SteamUsers";
	fn default() -> SteamUser {
		SteamUser {
			uuid: Self::DEFAULT_UUID,
			steam_id: String::from(""),
			windows_name: String::from(""),
			steam_name: String::from(""),
			avatar_path: String::from(""),
			last_fetch: 0
		}
	}
	fn from_row(row: &rusqlite::Row) -> SteamUser {
		SteamUser {
			uuid: row.get(0).unwrap(),
			steam_id: row.get(1).unwrap(),
			windows_name: row.get(2).unwrap(),
			steam_name: row.get(3).unwrap(),
			avatar_path: row.get(4).unwrap(),
			last_fetch: row.get(5).unwrap()
		}
	}
	fn ensure_table_exists(conn: &Connection) {
		let sql_query = format!("CREATE TABLE IF NOT EXISTS {} (
			uuid INTEGER PRIMARY KEY,
			steam_id TEXT NOT NULL UNIQUE,
			windows_name TEXT NOT NULL UNIQUE,
			steam_name TEXT NOT NULL,
			avatar_path TEXT NOT NULL,
			last_fetch INTEGER NOT NULL
		)", Self::TABLE_NAME);
		conn.execute(&sql_query, []).unwrap();
	}
	fn __get_save_params(&self) -> Pair<String, Box<[&dyn rusqlite::ToSql]>> {
		let sql_query = format!("INSERT INTO {} (steam_id, windows_name, steam_name, avatar_path, last_fetch) VALUES (?, ?, ?, ?, ?)", Self::TABLE_NAME);
		let params: Box<[&dyn rusqlite::ToSql]> = Box::new([&self.steam_id, &self.windows_name, &self.steam_name, &self.avatar_path, &self.last_fetch]);
		Pair(sql_query, params)
	}
	fn __get_update_params(&self) -> Pair<String, Box<[&dyn rusqlite::ToSql]>> {
		let sql_query = format!("UPDATE {} SET steam_id = ?, windows_name = ?, steam_name = ?, avatar_path = ?, last_fetch = ? WHERE uuid = ?", Self::TABLE_NAME);
		let params: Box<[&dyn rusqlite::ToSql]> = Box::new([&self.steam_id, &self.windows_name, &self.steam_name, &self.avatar_path, &self.last_fetch, &self.uuid]);
		Pair(sql_query, params)
	}
	fn validate(&self) -> Result<(), Error> {
		/* TODO: validate if windows user exists and fetch steam user */
		if !self.steam_id.is_valid_steam_id() {
			return Err(Error::InvalidSteamId);
		}
		Ok(())
	}
}

#[derive(Deserialize, Debug)]
pub struct SteamUserResponse {
	pub response: SteamUserResponseBody
}

#[derive(Deserialize, Debug, Serialize)]
pub struct SteamUserResponseBody {
	pub players: Vec<SteamUserDetails>
}

#[derive(Deserialize, Debug, Serialize)]
pub struct SteamUserDetails {
	pub steamid: String,
	pub avatarfull: String,
	pub personaname: String
}

impl SteamUser {
	pub fn new(steam_id: String, windows_name: String, steam_name: String, avatar_path: String, last_fetch: i64) -> SteamUser {
		SteamUser {
			uuid: Self::DEFAULT_UUID,
			steam_id,
			windows_name,
			steam_name,
			avatar_path,
			last_fetch
		}
	}
	pub fn make_fetch_details_url(api_key: &String, steam_users: &Vec<&SteamUser>) -> String {
		let steam_users_concat = steam_users
			.iter()
			.map(|user| String::from(&user.steam_id))
			.collect::<Vec<String>>()
			.join(",");
		format!("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key={api_key}&steamids={steam_users_concat}")
	}

	pub async fn fetch_multiple(api_keys: &Vec<SteamApiKey>, steam_users: &Vec<&SteamUser>) -> Result<Vec<SteamUserDetails>, Error> {
		let mut last_err: Error = Error::ErrorMessage(String::new());
		for api_key in api_keys {
			let url = Self::make_fetch_details_url(&api_key.api_key, steam_users);
			eprintln!("fetch_multiple::url::{:?}", url);
			let response = reqwest::get(url)
				.await
				.map_err(|e| Error::ErrorMessage(e.to_string()));
			match response {
				Ok(res) => {
					eprintln!("fetch_multiple::res::{:?}", res);
					if res.status().is_success() {
						let body = res
							.json::<SteamUserResponse>();
						return match body.await {
							Ok(out) => {
								eprintln!("fetch_multiple::out::{:?}", out);
								Ok(out.response.players)
							}
							Err(err) => {
								eprintln!("fetch_multiple::err::{:?}", err);
								Err(Error::ErrorMessage(err.to_string()))
							}
						}
					} else {
						last_err = Error::ErrorMessage(res.status().to_string());
						continue;
					}
				},
				Err(err) => {
					last_err = err;
				}
			}
		}
		Err(last_err)
	}
	pub fn set_new_detail(&mut self, details: &SteamUserDetails, new_fetch: bool) {
		self.avatar_path = details.avatarfull.clone();
		self.steam_name = details.personaname.clone();
		if new_fetch {
			self.last_fetch = SystemTime::now()
				.duration_since(UNIX_EPOCH)
				.unwrap()
				.as_millis() as i64;
			let _ = self.force_update();
		}
	}
}