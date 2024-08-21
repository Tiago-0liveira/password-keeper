import {exec} from "child_process"

export const winUsers = ["tfgol", "tiago", "tiago_1p3y8sg"]

export const shutDownSteam = () => new Promise<void>((resolve, reject) => {
	exec("taskkill /f /im steam.exe", (err, stdout, stderr) => {
		if (err) reject(err)
		resolve()
	})
})

export const getSteamProcess = () => new Promise<WindowsProcess | WindowsRunningProcess>((resolve, reject) => {
	exec(`tasklist /v /FI "IMAGENAME eq steam.exe" /FO list`, function(err, stdout, stderr) {
		if (err) {
			reject(err)
		}
		if (stdout.includes("INFO: No tasks are running which match the specified criteria.")) { /* YES THIS IS HARDCODED */
			resolve({running: false})
		} else {
			const lines = stdout.replace(/(?:\r)+/g, "").split("\n").slice(1, -1);
			let process = {
				running: true,
				PID: Number(lines[1].split(new RegExp(/ +/))[1]),
				USERNAME: lines[6].split(new RegExp(/ +/))[2].split("\\")[1],
			}
			resolve(process)
		}
	})
})

export const 	runasUser = (username: string) => new Promise<void>((resolve, reject) => {
    if (username === process.env["USERNAME"]) {
        exec("\"C:\\Program Files (x86)\\Steam\\steam.exe\"")
    } else {
        exec(`runas.exe /user:${username} /savecred "C:\\Program Files (x86)\\Steam\\steam.exe"`, (err, stdout, stderr) => {
    		if (err) reject(err)
    		resolve()
        })
    }
})

const make_getPlayerSummariesUrl = (apiKey: string, steamIds: string) => `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamIds}`;

export const fetchSteamUserDetails = (api_keys: SteamApiKey[], steamIds: string[]) => new Promise<SteamUserDetails[]>(async (resolve, reject) => {
	const steamIdsJoined = steamIds.join(",")
	for (const apiKey of api_keys) {
		try {
			const res = await fetch(make_getPlayerSummariesUrl(apiKey.apiKey, steamIdsJoined))
			if (!res.ok) continue
			const data = await res.json()
			if (!data || !data.response) continue
			const details: SteamUserDetails[] = []
			for (const player of data.response.players) {
				details.push({
					steamID: player.steamid,
					avatarUrl: player.avatarfull,
					nickname: player.personaname
				})
			}
			return resolve(details)
		} catch (err) {
			console.error(err)
		}
	}
	reject()
})


const randomSteamId = "76561198000000000"/* just to test if the key works */
export const testApiKey = (apiKey: string) => new Promise<boolean>(async (resolve, reject) => {
	try {
		const res = await fetch(make_getPlayerSummariesUrl(apiKey, randomSteamId))
		if (!res.ok) {
			resolve(false)
		} else {
			resolve(true)
		}
	} catch (err) {
		console.error(err)
		resolve(false)
	}
})