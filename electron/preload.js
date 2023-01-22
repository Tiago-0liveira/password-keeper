const electron = require("electron")

console.log("preload.ts || loaded")
//window.electron = require("electron")

/*electron.contextBridge.exposeInMainWorld('electronAPI', 
*/
window.electronAPI = {
	getRows: async () => await electron.ipcRenderer.invoke("requestGetRows"),
	newRow: async (data) => await electron.ipcRenderer.invoke("requestNewRow", data),
	deleteRow: async (uuid) => await electron.ipcRenderer.invoke("requestDeleteRow", { uuid }),
	updateRow: async (uuid, data) => await electron.ipcRenderer.invoke("requestUpdateRow", { uuid, data }),
	steamActiveUser: async () => await electron.ipcRenderer.invoke("requestSteamActiveUser"),
	steamChangeUser: async (username) => await electron.ipcRenderer.invoke("requestSteamChangeUser", username),
	steamShutdown: async () => await electron.ipcRenderer.invoke("requestSteamShutdown"),
	validateNewRow: async (row) => await electron.ipcRenderer.invoke("requestValidateNewRow", row),
}/* ) */
