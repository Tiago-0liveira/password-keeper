import React, { useEffect, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faBars, faMinus, faTimes, faWindowRestore } from "@fortawesome/free-solid-svg-icons"
import PasswordApp from "../Apps/Passwords"
import { faSquare } from "@fortawesome/free-regular-svg-icons"
import Apps from "../Apps"
import "./styles.scss"
import clsx from "clsx"
import Mousetrap from "mousetrap"
import nw from "../../myscript.js"


/*const { BrowserWindow } = remote;*/

const Main: React.FC = () => {
	const [activeApp, setActiveApp] = useState(PasswordApp)
	const [isSbopen, setisSbopen] = useState(true)
	const [isMaximized, setisMaximized] = useState<boolean>(nw.Window.get().isFullscreen ?? false)
	const [extraLabel, setExtraLabel] = useState("")

	nw.Window.get().on("leave-fullscreen", () => { setisMaximized(false) })
	nw.Window.get().on("enter-fullscreen", () => { setisMaximized(true) })
	const toggleSideBar = () => { setisSbopen(value => !value) }
	const setApp = (index: number) => () => {
		setActiveApp(Apps[index])
	}
	const minimize = () => { nw.Window.get().minimize() }
	const toggleMaximize = () => { nw.Window.get().toggleFullscreen() }
	const exit = () => { nw.App.quit() }
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
						<FontAwesomeIcon icon={faBars} size="lg" />
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
						<FontAwesomeIcon icon={faMinus} size="2x" />
					</div>
					<div className="maximize" onClick={toggleMaximize}>
						<FontAwesomeIcon icon={isMaximized ? faWindowRestore : faSquare} size="2x" />
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
					{<activeApp.component setExtraLabel={setExtraLabel} />}
				</div>
			</div>
		</div>
	)
}

export default Main
