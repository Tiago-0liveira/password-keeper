import { DB } from "./database"

const dbName: string = "passwordVaultV2DB"
const dbParams = "site,email,password,username"

DB.run(`CREATE TABLE IF NOT EXISTS ${dbName} (
	uuid INTEGER NOT NULL PRIMARY KEY,
	site TEXT NOT NULL,
	email TEXT NOT NULL,
	password TEXT NOT NULL,
	username TEXT
)`)

export const getRows: TgetRows = (search, sort) => {
	return new Promise((resolve, reject) => {
		let query = `SELECT uuid, ${dbParams} FROM ${dbName}`

		if (search) query += ` WHERE site LIKE '%${search}%' OR username LIKE '%${search}%'`
		if (sort) query += " ORDER BY site ASC, email ASC, username ASC"

		DB.all(query, (err, rows: Row[]) => {
			if (err) reject(err)
			resolve(rows)
		})
	})
}

export const newRow: TnewRow = ({ site, email, password, username }) => {
	return new Promise((resolve, reject) => {
		DB.run(`INSERT INTO ${dbName} (${dbParams}) VALUES(?,?,?,?)`, [site, email, password, username], (err) => {
			if (err) reject(err)
			DB.get<Row>(`SELECT last_insert_rowid() AS inserted_id, * FROM ${dbName} WHERE uuid = last_insert_rowid()`, (err, row) => {
				if (err) reject(err);
				resolve(row)
			})
		})
	})
}

export const deleteRow: TDeleteRow = ({ uuid }) => {
	return new Promise((resolve, reject) => {
		DB.run(`DELETE FROM ${dbName} WHERE uuid=?`, [uuid], (err) => {
			if (err) reject(err)
			DB.get(`SELECT uuid, ${dbParams} FROM ${dbName} WHERE uuid=?`, [uuid], (err, row: Row) => {
				if (err) reject(err)
				resolve(row)
			})
		})
	})
}

export const updateRow: TUpdateRow = ({ uuid, site, email, password, username }) => {
	console.log({uuid, site, email, password, username})
	return new Promise((resolve, reject) => {
		DB.run(`UPDATE ${dbName} SET site=?, email=?, password=?, username=? WHERE uuid=?`, [site, email, password, username, uuid], (err) => {
			if (err) reject(err)
			DB.get(`SELECT uuid, ${dbParams} FROM ${dbName} WHERE uuid=?`, [uuid], (err, row: Row) => {
				if (err) reject(err)
				resolve(row)
			})
		})
	})
}
