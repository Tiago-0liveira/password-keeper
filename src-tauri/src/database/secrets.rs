use rusqlite::Connection;

use crate::{
    database::{database::DatabaseModel, utils::Pair},
    dm_error, make_uuid_struct,
};

make_uuid_struct! {
    Secret {
        name: String,
        secret: String
    }
}

dm_error! {
    Error {

    }
}

impl DatabaseModel<Error> for Secret {
    const TABLE_NAME: &'static str = "Secrets";

    fn default() -> Secret {
        Secret {
            uuid: Self::DEFAULT_UUID,
            name: String::from(""),
            secret: String::from(""),
        }
    }
    fn from_row(row: &rusqlite::Row) -> Secret {
        Secret {
            uuid: row.get(0).unwrap(),
            name: row.get(1).unwrap(),
            secret: row.get(2).unwrap(),
        }
    }
    fn ensure_table_exists(conn: &Connection) {
        let sql_query = format!(
            "CREATE TABLE IF NOT EXISTS {} (
			uuid INTEGER PRIMARY KEY,
			name TEXT NOT NULL UNIQUE,
			secret TEXT NOT NULL
		)",
            Self::TABLE_NAME
        );
        conn.execute(&sql_query, []).unwrap();
    }
    fn __get_save_params(&self) -> Pair<String, Box<[&dyn rusqlite::ToSql]>> {
        let sql_query = format!("INSERT INTO {} (name) VALUES (?)", Self::TABLE_NAME);
        let params: Box<[&dyn rusqlite::ToSql]> = Box::new([&self.name]);
        Pair(sql_query, params)
    }
    fn __get_update_params(&self) -> Pair<String, Box<[&dyn rusqlite::ToSql]>> {
        let sql_query = format!("UPDATE {} SET name = ? WHERE uuid = ?", Self::TABLE_NAME);
        let params: Box<[&dyn rusqlite::ToSql]> = Box::new([&self.name, &self.uuid]);
        Pair(sql_query, params)
    }
    fn validate(&self) -> Result<(), Error> {
        Ok(())
    }
}
