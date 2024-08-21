import { DB } from "../database"

const SteamApiKeysDbName = "SteamApiKeys"

DB.run(`CREATE TABLE IF NOT EXISTS ${SteamApiKeysDbName} (
	uuid INTEGER NOT NULL PRIMARY KEY,
	api_key TEXT NOT NULL
)`)

export const getSteamApiKeys = () => new Promise<SteamApiKey[]>((resolve, reject) => {
	DB.all<{uuid: number, api_key: string}>(`SELECT * FROM ${SteamApiKeysDbName}`, (err, rows) => {
		if (err) reject(err)
		let moddedRows = rows.map(({uuid, api_key}) => ({uuid, apiKey: api_key, checked: true}))
		if (moddedRows.length !== 5) {
			for (let i = moddedRows.length; i < 5; i++) {
				moddedRows.push({uuid: -1, apiKey: "", checked: false})
			}
		}
		return resolve(moddedRows)
	})
})

export const addSteamApiKey = (apiKey: string) => new Promise<SteamApiKey>((resolve, reject) => {
	DB.run(`INSERT INTO ${SteamApiKeysDbName} (api_key) VALUES (?)`, [apiKey], (err) => {
		if (err) reject(err)
		DB.get<{uuid:number, api_key: string}>(`SELECT last_insert_rowid() AS inserted_id, * FROM ${SteamApiKeysDbName} WHERE uuid = last_insert_rowid()`, (err, row) => {
			if (err) reject(err);
			return resolve({uuid: row.uuid, apiKey: row.api_key, checked: true})
		})
	})
})

export const deleteSteamApiKey = (uuid: number) => new Promise<void>((resolve, reject) => {
	DB.run(`DELETE FROM ${SteamApiKeysDbName} WHERE uuid = ?`, [uuid], (err) => {
		if (err) reject(err)
		return resolve()
	})
})

export const updateSteamApiKey = (uuid: number, apiKey: string) => new Promise<void>((resolve, reject) => {
	DB.run(`UPDATE ${SteamApiKeysDbName} SET api_key = ? WHERE uuid = ?`, [apiKey, uuid], (err) => {
		if (err) reject(err)
		return resolve()
	})
})
