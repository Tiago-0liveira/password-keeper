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

export const runasUser = (username: string) => new Promise<void>((resolve, reject) => {
    if (username === process.env["USERNAME"]) {
        exec("\"C:\\Program Files (x86)\\Steam\\steam.exe\"")
    } else {
        exec(`runas.exe /user:${username} /savecred "C:\\Program Files (x86)\\Steam\\steam.exe"`, (err, stdout, stderr) => {
    		if (err) reject(err)
    		resolve()
        })
    }
})