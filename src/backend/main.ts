import "core-js/stable";
import "regenerator-runtime/runtime";
import { app, BrowserWindow } from "electron"
import * as path from "path"
import * as url from "url"

import { winUsers, shutDownSteam, getSteamProcess, runasUser } from "./steam"
import { steamICO } from "./Images";

import "./database/database"
import "./handlers/general"
import "./handlers/passwordsApp"
import "./handlers/steamApp"

export let mainWindow: Electron.BrowserWindow | null

let steamTaskRan = false
app.setJumpList([
	{
		name: 'Steam Accounts',
		items: winUsers.map((user, i) => {
			return {
				type: 'task',
				title: user,
				program: process.execPath,
				args: `--run-steam=${user}`,
				iconIndex: i,
				iconPath: steamICO,
				description: `Opens steam as ${user}`
			}
		})
	}
])
let steamSwitch = app.commandLine.getSwitchValue("run-steam")
if (winUsers.includes(steamSwitch)) {
	steamTaskRan = true
	getSteamProcess().then(async ({ running }) => {
		if (running) await shutDownSteam()
		await runasUser(steamSwitch)
		process.exit(0)
	}).catch(console.log)
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1050,
		height: 650,
		backgroundColor: "#191622",
		center: true,
		frame: false,
		title: "Password Keeper",
		minWidth: 1050,
		minHeight: 600,
		icon: "./build/vault.png",
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			sandbox: true,
			preload: path.join(__dirname, 'preload.js')
		}
	})

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, "renderer/index.html"),
		protocol: "file:",
		slashes: true
	}))

	mainWindow.on("closed", () => {
		mainWindow = null
	})
}

!steamTaskRan && app.on("ready", createWindow)
