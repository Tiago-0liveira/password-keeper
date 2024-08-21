import electron from "electron"
import type { IElectronAPI } from "../types/global";

electron.contextBridge.exposeInMainWorld('electronAPI', {
	apps: {
		passwords: {
			getRows: async (query = "", sort = false) => await electron.ipcRenderer.invoke("requestGetRows", { query, sort }),
			newRow: async (data) => await electron.ipcRenderer.invoke("requestNewRow", data),
			deleteRow: async (uuid) => await electron.ipcRenderer.invoke("requestDeleteRow", { uuid }),
			updateRow: async (row) => await electron.ipcRenderer.invoke("requestUpdateRow", row),
			
			validateNewRow: async (row) => await electron.ipcRenderer.invoke("requestValidateNewRow", row),
			validateAndNewRow: async (row) => await electron.ipcRenderer.invoke("requestValidateAndNewRow", row),
			validateAndUpdateRow: async (row) => await electron.ipcRenderer.invoke("requestValidateAndUpdateRow", row),
		},
		steam: {
			steamGetUsers: async () => await electron.ipcRenderer.invoke("requestSteamInitialize"),
			steamAddUser: async (user) => await electron.ipcRenderer.invoke("requestSteamAddUser", user),
			steamDeleteUser: async (uuid) => await electron.ipcRenderer.invoke("requestSteamDeleteUser", { uuid }),
			steamUpdateUser: async (user) => await electron.ipcRenderer.invoke("requestSteamUpdateUser", user),
			steamActiveUser: async () => await electron.ipcRenderer.invoke("requestSteamActiveUser"),
			steamChangeUser: async (uuid) => await electron.ipcRenderer.invoke("requestSteamChangeUser", { uuid }),
			steamShutdown: async () => await electron.ipcRenderer.invoke("requestSteamShutdown"),

			getSteamApiKeys: async () => await electron.ipcRenderer.invoke("requestGetSteamApiKeys"),
			//addSteamApiKey: async (apiKey) => await electron.ipcRenderer.invoke("requestAddSteamApiKey", { apiKey }),
			deleteSteamApiKey: async (uuid) => await electron.ipcRenderer.invoke("requestDeleteSteamApiKey", { uuid }),
			updateSteamApiKey: async (uuid, apiKey) => await electron.ipcRenderer.invoke("requestUpdateSteamApiKey", { uuid, apiKey }),
			validateAndSaveApiKey: async (apiKey) => await electron.ipcRenderer.invoke("requestValidateAndSaveApiKey", { apiKey }),
			validateAndSaveSteamUser: async (steam_id, windows_name) => await electron.ipcRenderer.invoke("requestValidateAndSaveSteamUser", { steam_id, windows_name }),
		}
	},
	closeApp: () => electron.ipcRenderer.invoke("requestCloseApp"),
	minimizeApp: () => electron.ipcRenderer.invoke("requestMinimizeApp"),
	toggleFullscreenApp: () => electron.ipcRenderer.invoke("requestToggleFullscreenApp"),
} as IElectronAPI)
