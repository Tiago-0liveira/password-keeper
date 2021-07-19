import "core-js/stable";
import "regenerator-runtime/runtime";
import { app, BrowserWindow, ipcMain } from "electron"
import * as path from "path"
import * as url from "url"

import { NewRowData, Row } from "../src/types"
import { getRows, deleteRow, newRow, updateRow } from "./database/database";

let mainWindow: Electron.BrowserWindow | null

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1000,
		height: 650,
		backgroundColor: "#191622",
		center: true,
		frame: false,
		title: "Password Keeper",
		minWidth: 800,
		minHeight: 600,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true
		}
	})

	if (process.env.NODE_ENV === "development") {
		mainWindow.loadURL("http://localhost:4000")
	} else {
		mainWindow.loadURL(
			url.format({
				pathname: path.join(__dirname, "renderer/index.html"),
				protocol: "file:",
				slashes: true
			})
		)
	}

	mainWindow.on("closed", () => {
		mainWindow = null
	})
}

app.on("ready", createWindow)
	.whenReady()
	.then(() => {
		if (process.env.NODE_ENV === "development") {
			import("electron-devtools-installer").then(module => {
				module.default(module.REACT_DEVELOPER_TOOLS)
					.then((name) => console.log(`Added Extension:  ${name}`))
					.catch((err) => console.log("An error occurred: ", err))
			}).catch(console.error)
		}

	})
app.allowRendererProcessReuse = true

ipcMain.on("requestGetRows", async (event) => {
	const rows: Row[] = await getRows()
	console.log(`ipcMain||getRows||${rows.length} rows`)
	event.reply("responseGetRows", rows)
})
ipcMain.on("requestNewRow", async (event, data: NewRowData) => {
	console.log(`ipcMain||newRow||${JSON.stringify(data, null, 0)}`)
	newRow(data).then(async () => {
		event.reply("responseGetRows", await getRows())
	});
})
ipcMain.on("requestDeleteRow", async (event, data: { uuid: number }) => {
	console.log(`ipcMain||deleteRow||${JSON.stringify(data, null, 0)}`)
	event.reply("responseDeleteRow", await deleteRow({ uuid: data.uuid }))
})
ipcMain.on("requestUpdateRow", async (event, data: { uuid: number, newRowData: NewRowData }) => {
	console.log(`ipcMain||updateRow||${JSON.stringify(data)}`)
	event.reply("responseUpdateRow", await updateRow({ uuid: data.uuid, newRowData: data.newRowData }))
})