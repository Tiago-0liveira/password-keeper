import "core-js/stable";
import "regenerator-runtime/runtime";
import { app, BrowserWindow, ipcMain } from "electron"
import * as path from "path"
import * as url from "url"
import { Row } from "./database/generated/client"
import data from "./data.json"
import {
	getRows,
	newRow,
	deleteRow,
	updateRow
} from "./database/database"
import { NewRowData } from "../src/types"

let mainWindow: Electron.BrowserWindow | null

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1100,
		height: 700,
		backgroundColor: "#191622",
		center: true,
		frame: false,
		title: "Password Keeper",
		minWidth: 500,
		minHeight: 500,
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
				module.default(module.REDUX_DEVTOOLS)
					.then((name) => console.log(`Added Extension:  ${name}`))
					.catch((err) => console.log("An error occurred: ", err))
			}).catch(console.error)
		}

	})
app.allowRendererProcessReuse = true

ipcMain.on("requestGetRows", async (event) => {
	const res = await getRows()
	if (res.error) { console.error(res.error) }
	console.log(`ipcMain||getRows||${(res.data as Row[]).length} rows`)
	event.reply("responseGetRows", res)
})
ipcMain.on("newRow", async (event, data: NewRowData) => {
	console.log(`ipcMain||newRow||${data}`)
	const res = await newRow(data)
	if (res.error) {
		event.reply("error", res.error)
		console.error(res.error)
	}
	else {
		event.reply("newRow", res)
		console.log(`new row successfully created|${(res.data as Row).site}|${(res.data as Row).email}|${(res.data as Row).uuid}`)
	}
})
ipcMain.on("deleteRow", async (event, data: { uuid: string }) => {
	console.log(`ipcMain||deleteRow||${data}`)
	event.reply("deleteRow", await deleteRow({ uuid: data.uuid }))
})
ipcMain.on("updateRow", async (event, data: { uuid: string, newRowData: NewRowData }) => {
	console.log(`ipcMain||updateRow||${data}`)
	const res = await updateRow({ uuid: data.uuid, newRowData: data.newRowData })
	if (res.error) {
		console.error(res.error)
		event.reply("error", res.error)
	} else {
		event.reply("updateRow", res)
		console.log("updated row with success")
	}
})