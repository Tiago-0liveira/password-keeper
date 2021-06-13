import React, { useEffect, useState } from "react"
import { ipcRenderer, remote } from "electron"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faBars, faMinus, faSquare, faTimes } from "@fortawesome/free-solid-svg-icons"
import type { App } from "../../types"
import PasswordApp from "../Apps/Passwords"
import Apps from "../Apps"
import "./styles.scss"
import { Row } from "../../../electron/database/generated/client"

const { BrowserWindow } = remote;

const Main: React.FC = () => {
	const [data, setdata] = useState<Row[]>()
	const [activeApp, setActiveApp] = useState<App>(PasswordApp)
	const [isSbopen, setisSbopen] = useState(true)

	const toggleSideBar = () => { setisSbopen(value => !value) }
	const setApp = (index: number) => () => {
		setActiveApp(Apps[index])
	}
	const minimize = () => {
		const win = BrowserWindow.getFocusedWindow()
		win && win.minimize()
	}
	const toggleMaximize = () => {
		const win = BrowserWindow.getFocusedWindow()
		win && (win.isMaximized() ? win.unmaximize() : win.maximize())
	}
	const exit = () => {
		const win = BrowserWindow.getFocusedWindow()?.close()
	}
	return (
		<div className="main">
			<div className="navbar">
				<div className="left">
					<div className="toggleSideBar-button" onClick={toggleSideBar}>
						<FontAwesomeIcon icon={faBars} size="lg" />
					</div>
					<h3><span>PasswordKeeper</span><span className="divider"><b>/</b></span><span>{activeApp.label}</span></h3>
				</div>
				<div className="rigth">
					<div className="minimize" onClick={minimize}>
						<FontAwesomeIcon icon={faMinus} size="2x" />
					</div>
					<div className="maximize" onClick={toggleMaximize}>
						<FontAwesomeIcon icon={faSquare} size="2x" />
					</div>
					<div className="exit" onClick={exit}>
						<FontAwesomeIcon icon={faTimes} size="2x" />
					</div>
				</div>
			</div>
			<div className="content">
				{isSbopen && <div className="sidebar">
					{Apps.map((app, i) => (
						<div className={["app", app.label === activeApp.label ? "active" : ""].join(" ")} key={Math.random().toFixed(3)} onClick={setApp(i)}>
							<p><b>{app.label}</b></p>
							<FontAwesomeIcon icon={faArrowRight} size="2x" />
						</div>
					))}
				</div>}
				<div className={["active-app", isSbopen ? "SbOpen" : "SbClosed"].join(" ")}>
					{<activeApp.component />}
				</div>
			</div>
		</div>
	)
}

export default Main
