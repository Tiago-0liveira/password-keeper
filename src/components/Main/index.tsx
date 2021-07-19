import React, { useEffect, useState } from "react"
import { remote } from "electron"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faBars, faMinus, faSquare as fasSquare, faTimes, faWindowMaximize } from "@fortawesome/free-solid-svg-icons"
import PasswordApp from "../Apps/Passwords"
import { faSquare as farSquare } from "@fortawesome/free-regular-svg-icons"
import Apps from "../Apps"
import "./styles.scss"
import clsx from "clsx"


const { BrowserWindow } = remote;

const Main: React.FC = () => {
	const [activeApp, setActiveApp] = useState(PasswordApp)
	const [isSbopen, setisSbopen] = useState(true)
	const [isMaximized, setisMaximized] = useState<boolean>(BrowserWindow.getFocusedWindow()?.isMaximized() ?? false)

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
		setisMaximized(win?.isMaximized ?? false)
	}
	const exit = () => {
		const win = BrowserWindow.getFocusedWindow()?.close()
	}
	const handleCtrlB = toggleSideBar
	useEffect(() => {
		remote.globalShortcut.register("Ctrl+B", handleCtrlB)
		return () => {
			remote.globalShortcut.unregister("Ctrl+B")
		}
	})

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
						{isMaximized ? <div className="squares">
							<FontAwesomeIcon className="first" icon={farSquare} size="2x" />
							<FontAwesomeIcon className="invisible" icon={fasSquare} size="2x" />
							<FontAwesomeIcon className="second" icon={farSquare} size="2x" swapOpacity />
						</div> :
							<FontAwesomeIcon icon={faWindowMaximize} size="2x" />}
					</div>
					<div className="exit" onClick={exit}>
						<FontAwesomeIcon icon={faTimes} size="2x" />
					</div>
				</div>
			</div>
			<div className="content">
				<div className={clsx("sidebar", !isSbopen && "closed")}>
					{Apps.map((app, i) => (
						<div className={clsx("app", app.label === activeApp.label ? "active" : "")} key={i} onClick={setApp(i)}>
							<p><b>{app.label}</b></p>
							<FontAwesomeIcon icon={faArrowRight} size="1x" />
						</div>
					))}
				</div>
				<div className={clsx("active-app", !isSbopen && "SbClosed")} key={activeApp.label}>
					{activeApp.component}
				</div>
			</div>
		</div>
	)
}

export default Main
