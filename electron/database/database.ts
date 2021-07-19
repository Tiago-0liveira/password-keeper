import type { TgetRows, TnewRow, TDeleteRow, TUpdateRow, Row } from "../../src/types"
import sqlite3 from "sqlite3"
import { app } from "electron"
import path from "path"

const dbFilePath = path.join(app.getPath('userData'), "db.db")
const dbName: string = "passwordVaultV2DB"
const DB = new sqlite3.Database(dbFilePath)
const dbParams = "site,email,password,username"

DB.run(`CREATE TABLE IF NOT EXISTS ${dbName} (
	uuid INTEGER NOT NULL PRIMARY KEY,
	site TEXT NOT NULL,
	email TEXT NOT NULL,
	password TEXT NOT NULL,
	username TEXT
)`)

export const getRows: TgetRows = () => {
	return new Promise((resolve, reject) => {
		DB.all(`SELECT uuid, ${dbParams} FROM ${dbName}`, (err, rows: Row[]) => {
			if (err) reject(err)
			resolve(rows)
		})
	})
}

export const newRow: TnewRow = ({ site, email, password, username }) => {
	return new Promise((resolve, reject) => {
		DB.run(`INSERT INTO ${dbName} (${dbParams}) VALUES(?,?,?,?)`, [site, email, password, username], (err) => {
			if (err) reject(err)
			resolve()
		})
	})
}

export const deleteRow: TDeleteRow = ({ uuid }) => {
	return new Promise((resolve, reject) => {
		DB.run(`DELETE FROM ${dbName} WHERE uuid=?`, [uuid], (err) => {
			if (err) reject(err)
			resolve({ uuid })
		})
	})
}

export const updateRow: TUpdateRow = ({ uuid, newRowData: { site, email, password, username } }) => {
	return new Promise((resolve, reject) => {
		DB.run(`UPDATE ${dbName} SET site=?, email=?, password=?, username=? WHERE uuid=?`, [site, email, password, username, uuid], (err) => {
			if (err) reject(err)
		})
		DB.get(`SELECT uuid, ${dbParams} FROM ${dbName} WHERE uuid=?`, [uuid], (err, row: Row) => {
			if (err) reject(err)
			console.log("db -> ", row);
			resolve(row)
		})
	})
}
