import React, { useEffect, useState } from "react"
import { remote } from "electron"
import PasswordApp from "../Apps/Passwords/index"
import Apps from "../Apps"
import "./styles.scss"
import clsx from "clsx"
import Mousetrap from "mousetrap"
import icons from "../Icons"

const { BrowserWindow } = remote;

const Main: React.FC = () => {
	const [activeApp, setActiveApp] = useState(PasswordApp)
	const [isSbopen, setisSbopen] = useState(true)
	const [isMaximized, setisMaximized] = useState<boolean>(BrowserWindow.getFocusedWindow()?.isMaximized() ?? false)
	const [extraLabel, setExtraLabel] = useState("")

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
		BrowserWindow.getFocusedWindow()?.close()
	}
	const handleCtrlB = toggleSideBar
	useEffect(() => {
		Mousetrap.bind("ctrl+b", handleCtrlB)
		return () => {
			Mousetrap.unbind("ctrl+b")
		}
	})

	return (
		<div className="main">
			<div className="navbar">
				<div className="left">
					<div className="toggleSideBar-button" onClick={toggleSideBar}>
						{icons.main.bars}
					</div>
					<h3>
						<span>PasswordKeeper</span>
						<span className="divider"><b>/</b></span>
						<span>{activeApp.label}</span>
						{activeApp.extraLabel && <>
							<span className="divider"><b>/</b></span>
							{extraLabel && <span>{extraLabel}</span>}
						</>}
					</h3>
				</div>
				<div className="rigth">
					<div className="minimize" onClick={minimize}>

						{icons.main.minimize}
					</div>
					<div className="maximize" onClick={toggleMaximize}>
						{isMaximized ? icons.main.maximize.maximized : icons.main.maximize.not}
					</div>
					<div className="exit" onClick={exit}>
						{icons.main.exit}
					</div>
				</div>
			</div>
			<div className="content">
				<div className={clsx("sidebar", !isSbopen && "closed")}>
					{Apps.map((app, i) => (
						<div className={clsx("app", app.label === activeApp.label ? "active" : "")} key={i} onClick={setApp(i)}>
							<p><b>{app.label}</b></p>
							{icons.main.sidebarArrow}
						</div>
					))}
				</div>
				<div className={clsx("active-app", !isSbopen && "SbClosed")} key={activeApp.label}>
					{<activeApp.component setExtraLabel={setExtraLabel} />}
				</div>
			</div>
		</div>
	)
}

export default Main
