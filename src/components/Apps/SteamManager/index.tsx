import React from "react"
import "./styles.scss"

import { useState, useEffect } from "react"
import { ipcRenderer } from "electron"
import clsx from "clsx"

const winUsers = ["tfgol", "tiago", "tiago_1p3y8sg"]

enum SteamState {
	Running,
	Stopped,
}

const SteamManagerComponent: React.FC = () => {
	const [activeSteamUser, setActiveSteamUser] = useState<string>("")
	const [steamStatus, setSteamStatus] = useState<SteamState>(SteamState.Stopped)

	const handleResponseSteamActiveUser = (_event: Electron.IpcRendererEvent, process: { running: boolean, PID: number, USERNAME: string }) => {
		setSteamStatus(process.running ? SteamState.Running : SteamState.Stopped)
		if (process.running) {
			setActiveSteamUser(process.USERNAME)
		} else setActiveSteamUser("")
	}
	const requestSteamActiveUser = async () => {
		const process = await window.electronAPI.steamActiveUser()
		if (process.running) {
			setActiveSteamUser((process as WindowsRunningProcess).USERNAME)
		} /* steam not running */
		/*ipcRenderer.send("requestSteamActiveUser")*/
	}
	const handleResponseSteamChangeUser = requestSteamActiveUser
	const handleResponseSteamShutdown = requestSteamActiveUser

	const onStartorStop = (start: boolean, user: string) => () => {
		if (!start) {
			window.electronAPI.steamChangeUser(user)
			/*ipcRenderer.send("requestSteamChangeUser", {username: user})*/
		}
		else {
			window.electronAPI.steamShutdown()
			/*ipcRenderer.send("requestSteamShutdown")*/
		}
		requestSteamActiveUser()
		/*ipcRenderer.send("requestSteamActiveUser")*/
	}

	useEffect(() => {
		requestSteamActiveUser()
		/*ipcRenderer.send("requestSteamActiveUser")
		ipcRenderer.on("responseSteamActiveUser", handleResponseSteamActiveUser)
		ipcRenderer.on("responseSteamChangeUser", handleResponseSteamChangeUser)
		ipcRenderer.on("responseSteamShutdown", handleResponseSteamShutdown)*/
		return () => {
			/*ipcRenderer.removeListener("responseSteamActiveUser", handleResponseSteamActiveUser)
			ipcRenderer.removeListener("responseSteamChangeUser", handleResponseSteamChangeUser)
			ipcRenderer.removeListener("responseSteamShutdown", handleResponseSteamShutdown)*/
		}
	}, [])

	return (
		<div className="SteamManagerComponent">
			<div className="titleBar">
				<h1 className="title">Steam Account Manager</h1>
				<h3 className="steamStatus">
					Steam: <span className={clsx("status", { running: steamStatus === SteamState.Running })}>{steamStatus === SteamState.Running ? "Running" : "Stopped"}</span>
				</h3>
			</div>
			<div className="cards">
				<div className="sized">
					{winUsers.map(user => (
						<div className={clsx(["accountCard"], { active: user === activeSteamUser, standby: activeSteamUser && (user !== activeSteamUser) })} key={user}>
							<span className="name">{user}</span>
							<div className={clsx("moving-part", { active: user === activeSteamUser })}>
								<span onClick={onStartorStop(user === activeSteamUser, user)}>{user === activeSteamUser ? "STOP" : "START"}</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}


export default {
	label: "Steam Manager",
	component: SteamManagerComponent,
	extraLabel: false
}

