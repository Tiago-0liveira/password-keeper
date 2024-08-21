import { ipcMain } from "electron"
import { mainWindow } from "../main"

if (process.env.NODE_ENV === "development") {
	console.log(`ipcMain||init||general`)
}

ipcMain.handle("requestCloseApp", () => {
	if (mainWindow) {
		mainWindow.close()
	}
})

ipcMain.handle("requestMinimizeApp", () => {
	if (mainWindow) {
		mainWindow.minimize()
	}
})

ipcMain.handle("requestToggleFullscreenApp", () => {
	if (mainWindow) {
		if (mainWindow.isFullScreen()) {
			mainWindow.setFullScreen(false)
		} else if (mainWindow.isMaximized()) {
			mainWindow.unmaximize()
		} else {
			mainWindow.maximize()
		}
	}
})
