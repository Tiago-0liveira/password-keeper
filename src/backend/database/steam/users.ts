import { SteamUserState } from "@shared/enums"
import { DB } from "../database"

const SteamUsersDbName = "SteamUsers"

DB.run(`CREATE TABLE IF NOT EXISTS ${SteamUsersDbName} (
	uuid INTEGER NOT NULL PRIMARY KEY,
	steam_id TEXT NOT NULL,
	windows_name TEXT NOT NULL,
	steam_name TEXT NOT NULL,
	avatar_path TEXT NOT NULL,
	last_fetch INTEGER NOT NULL
)`)

type DatabaseSteamUser = {
	uuid: number
	windows_name: string
	steam_name: string
	steam_id: string
	avatar_path: string
	last_fetch: number
}

export const getSteamUsers = () => new Promise<WindowsSteamUserNumbered[]>((resolve, reject) => {
	DB.all<DatabaseSteamUser>(`SELECT * FROM ${SteamUsersDbName}`, (err, rows) => {
		if (err) reject(err)
		resolve(rows.map(({windows_name, steam_name, steam_id, avatar_path, last_fetch, uuid}) => ({
			uuid,
			windows_name,
			steam_name,
			details: {
				steamID: steam_id,
				avatarPath: avatar_path,
				lastFetch: last_fetch,
			},
			state: SteamUserState.Stopped,
		})))
	})
})

export const addSteamUser = (user: WindowsSteamUser) => new Promise<WindowsSteamUserNumbered>((resolve, reject) => {
	/* TODO: before this being called we should fetch the avatar and name from steam api */
	DB.run(`INSERT INTO ${SteamUsersDbName} (windows_name, steam_name, steam_id, avatar_path, last_fetch) VALUES (?, ?, ?, ?, ?)`, [
		user.windows_name,
		user.steam_name,
		user.details.steamID,
		user.details.avatarPath,
		user.details.lastFetch,
	], (err) => {
		if (err) reject(err)
		DB.get<DatabaseSteamUser>(`SELECT last_insert_rowid() AS inserted_id, * FROM ${SteamUsersDbName} WHERE uuid = last_insert_rowid()`, (err, row) => {
			if (err) reject(err);
			const {uuid, steam_id, windows_name, steam_name, avatar_path, last_fetch} = row
			return resolve({
				uuid,
				windows_name,
				steam_name,
				details: {
					steamID: steam_id,
					avatarPath: avatar_path,
					lastFetch: last_fetch,
				},
				state: SteamUserState.Stopped,
			})
		})
	})
})

export const deleteSteamUser = (uuid: number) => new Promise<void>((resolve, reject) => {
	DB.run(`DELETE FROM ${SteamUsersDbName} WHERE uuid = ?`, [uuid], (err) => {
		if (err) reject(err)
		resolve()
	})
})


export const updateSteamUser = (user: WindowsSteamUserNumbered) => new Promise<void>((resolve, reject) => {
	DB.run(`UPDATE ${SteamUsersDbName} SET windows_name = ?, steam_name = ?, steam_id = ?, avatar_path = ?, last_fetch = ? WHERE uuid = ?`, [
		user.windows_name,
		user.steam_name,
		user.details.steamID,
		user.details.avatarPath,
		user.details.lastFetch,
		user.uuid,
	], (err) => {
		if (err) reject(err)
		resolve()
	})
})
