/// <reference path="../src/types/global.d.ts" />
import "regenerator-runtime/runtime";
import type { IElectronAPI } from "../src/types/global"
import electron from "electron"
console.log("preload.ts || loaded")
//window.electron = require("electron")

electron.contextBridge.exposeInMainWorld('electronAPI', {
	getRows: async (query = "", sort = false) => await electron.ipcRenderer.invoke("requestGetRows", { query, sort }),
	newRow: async (data) => await electron.ipcRenderer.invoke("requestNewRow", data),
	deleteRow: async (uuid) => await electron.ipcRenderer.invoke("requestDeleteRow", { uuid }),
	updateRow: async (row) => await electron.ipcRenderer.invoke("requestUpdateRow", row),
	steamActiveUser: async () => await electron.ipcRenderer.invoke("requestSteamActiveUser"),
	steamChangeUser: async (username) => await electron.ipcRenderer.invoke("requestSteamChangeUser", username),
	steamShutdown: async () => await electron.ipcRenderer.invoke("requestSteamShutdown"),
	validateNewRow: async (row) => await electron.ipcRenderer.invoke("requestValidateNewRow", row),
	validateAndNewRow: async (row) => await electron.ipcRenderer.invoke("requestValidateAndNewRow", row),
	validateAndUpdateRow: async (row) => await electron.ipcRenderer.invoke("requestValidateAndUpdateRow", row),
	closeApp: () => electron.ipcRenderer.invoke("requestCloseApp"),
	minimizeApp: () => electron.ipcRenderer.invoke("requestMinimizeApp"),
	toggleFullscreenApp: () => electron.ipcRenderer.invoke("requestToggleFullscreenApp"),
} as IElectronAPI)
