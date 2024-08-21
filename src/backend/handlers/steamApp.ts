import { ipcMain } from "electron"
import { getSteamProcess, runasUser, shutDownSteam, fetchSteamUserDetails, winUsers, testApiKey } from "../steam"
import { getWindowsUsers } from "../windows"
import { SteamUserState } from "@shared/enums"
import { addSteamUser, deleteSteamUser, getSteamUsers } from "../database/steam/users"
import { addSteamApiKey, deleteSteamApiKey, getSteamApiKeys } from "../database/steam/Api_keys"

if (process.env.NODE_ENV === "development") {
	console.log(`ipcMain||init||steamApp`)
}

let users: WindowsSteamUserNumbered[] | undefined = undefined

ipcMain.handle("requestSteamInitialize", async (event) => {
	if (process.env.NODE_ENV === "development") {
		console.log(`ipcMain||requestSteamInitialize`)
	}
	/* TODO: this should fetch every steamUser registered in db, this is just dummy data for testing now */
	/* The state should not be fetched from the db, it does not make sense, i'll change it later */
	/* INFO: get steam web api key url: https://steamcommunity.com/dev/apikey */
	
	const steamProcess = await getSteamProcess()

	if (users === undefined) {
		users = await getSteamUsers()
	}
	const usersToFetch = users.filter(user => {
		if (user.details.lastFetch === -1) return true
		if (Date.now() - user.details.lastFetch > 1000 * 60 * 60 * 24) return true/* fetch every day basically */
		return false
	})
	const apiKeys = await getSteamApiKeys()
	if (usersToFetch.length !== 0) {
		const usersDetails = await fetchSteamUserDetails(apiKeys, users.map(u => u.details.steamID))
		users.forEach(u => {
			const details = usersDetails.find(d => d.steamID === u.details.steamID)
			if (details) {
				u.steam_name = details.nickname
				u.details = {
					steamID: details.steamID,
					avatarPath: details.avatarUrl,
					lastFetch: Date.now()
				}
			}
		})
	}
	let activeUser = users.find(u => u.windows_name === steamProcess.USERNAME)
	if (activeUser) {
		activeUser.state = SteamUserState.Running
	} else {
		activeUser = {uuid: -1, windows_name: "", steam_name: "", state: SteamUserState.Stopped, details: {steamID: "", avatarPath: "", lastFetch: -1}}
	}
	const windowsUsers = (await getWindowsUsers()).map(user => {
		return {
			name: user,
			in_use: users?.some(u => u.windows_name === user) || false
		}
	})

	return {
		users,
		active: activeUser,
		windows_users: windowsUsers,
		apiKeys
	} as SteamAppState
})

ipcMain.handle("requestSteamActiveUser", async (event) => {
	if (process.env.NODE_ENV === "development") {
		console.log(`ipcMain||steamActiveUser`)
	}
	return await getSteamProcess()
})

ipcMain.handle("requestSteamChangeUser", async (event, data: { uuid: number }) => {
	if (process.env.NODE_ENV === "development") {
		console.log(`ipcMain||requestSteamChangeUser`)
	}

	const user = users?.find(u => u.uuid === data.uuid)
	if (user) {
		if ((await getSteamProcess()).running) {
			await shutDownSteam()
		}
		await runasUser(user.windows_name)
		return await getSteamProcess()
	}
})
ipcMain.handle("requestSteamShutdown", async (event) => {
	if (process.env.NODE_ENV === "development") {
		console.log(`ipcMain||requestSteamShutdown`)
	}
	return await shutDownSteam()
})

ipcMain.handle("requestValidateAndSaveApiKey", async (event, data: { apiKey: string }) => {
	if (process.env.NODE_ENV === "development") {
		console.log(`ipcMain||requestValidateAndSaveApiKey`)
	}
	const test = await testApiKey(data.apiKey)
	if (!test) {
		console.log("ipcMain||requestValidateAndSaveApiKey||Invalid Api key")
		return { success: false, value: {message: "Invalid API Key"} }
	}
	return {success:true, value: await addSteamApiKey(data.apiKey)}
})

ipcMain.handle("requestDeleteSteamApiKey", async (event, data: { uuid: number }) => {
	if (process.env.NODE_ENV === "development") {
		console.log(`ipcMain||requestDeleteSteamApiKey`)
	}
	console.log(data)
	await deleteSteamApiKey(data.uuid)
})

ipcMain.handle("requestValidateAndSaveSteamUser", async (event, data: { steam_id: string, windows_name: string}) => {
	if (process.env.NODE_ENV === "development") {
		console.log(`ipcMain||requestValidateAndSaveSteamUser`)
	}
	console.log(data)
	const ResUsers = await fetchSteamUserDetails(await getSteamApiKeys(), [data.steam_id])
	if (ResUsers.length === 0) {
		return { success: false, value: {message: "Invalid Steam ID"}}
	}
	const user = ResUsers[0]
	const windowsSteamUser: WindowsSteamUser = {
		windows_name: data.windows_name,
		steam_name: user.nickname,
		details: {
			steamID: user.steamID,
			avatarPath: user.avatarUrl,
			lastFetch: Date.now()
		},
		state: SteamUserState.Stopped	
	}
	const numberedSteamUser = await addSteamUser(windowsSteamUser)
	if (!users)
		users = []
	users.push(numberedSteamUser)
	
	return { success: true, value: numberedSteamUser }
})

ipcMain.handle("requestSteamDeleteUser", async (event, data: { uuid: number }) => {
	if (process.env.NODE_ENV === "development") {
		console.log(`ipcMain||requestDeleteSteamUser`)
	}

	await deleteSteamUser(data.uuid)
	users = users?.filter(u => u.uuid !== data.uuid)
})