import React, { useCallback, useReducer } from "react"
import "./styles.scss"
import { useState, useEffect } from "react"
import clsx from "clsx"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
	faSquare, faPlay,
	faCheck,
	faTrash,
	faGear,
	faTrashCan,
	faArrowsRotate,
	faCode,
	faExclamation,
	faInfo,
	faSignal,
	faSquarePlus
} from "@fortawesome/free-solid-svg-icons"

import { faSteamSymbol, faWindows } from "@fortawesome/free-brands-svg-icons"
import { SteamAppActionType, SteamUserState } from "@shared/enums"
import { steamUsersDefault, steamUsersReducer } from "@reducers/steamUsersReducer"
import Modal from "@components/Modal"
import mousetrap from "mousetrap"


const electronAPI = window.electronAPI.apps.steam

const SteamManagerComponent: React.FC = () => {
	const [steamAppState, dispatch] = useReducer(steamUsersReducer, steamUsersDefault)
	const [apiDrawerOpen, setApiDrawerOpen] = useState(false)
	const [modalisOpen, setModalisOpen] = useState(false)
	const [apiKeyErrorMessage, setApiKeyErrorMessage] = useState("")/* lets do it later */

	const toggleApiDrawer = () => {
		setApiDrawerOpen((prev) => !prev)
	}
	const onApikeyChange = (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
		dispatch({type: SteamAppActionType.API_KEY_UPDATE, data: {index: i, value: e.target.value}})
	}
	const validateApiKey = (i: number) => () => {
		const key = steamAppState.apiKeys[i]
		if (key.apiKey.length === 32) {
			window.electronAPI.apps.steam.validateAndSaveApiKey(key.apiKey).then((option) => {
				if (option.success) {
					dispatch({type: SteamAppActionType.API_KEY_SAVE, data: { index: i, key: option.value }})

				} else {
					/* TODO: handle this error nicely */
					console.log("Error validating api key: ", option.value.message)
				}
			})
		}
	}
	const deleteApiKey = (i: number) => () => {
		const uuid = steamAppState.apiKeys[i].uuid
		window.electronAPI.apps.steam.deleteSteamApiKey(uuid).then(() => {
			dispatch({type: SteamAppActionType.API_KEY_DELETE, data: { uuid }})
		})
	}
	const onDeleteSteamUser = (uuid: number) => () => {
		window.electronAPI.apps.steam.steamDeleteUser(uuid).then(() => {
			dispatch({type: SteamAppActionType.DELETE, data: {uuid}})
		})
	}
	const toggleModal = () => {
		setModalisOpen((prev) => !prev)
	}
	const onStartorStop = (start: boolean, uuid: number) => () => {
		if (!start) {
			dispatch({type: SteamAppActionType.SET_LAUNCHING, data: {uuid: uuid}})
			electronAPI.steamChangeUser(uuid)
		}
		else {
			electronAPI.steamShutdown().then(() => {
				dispatch({type: SteamAppActionType.SET_STOPPED})
			})
		}
	}
	const isAnyApikeyChecked = useCallback(() => {
		return steamAppState.apiKeys.some(key => key.checked)
	}, [steamAppState.apiKeys])

	useEffect(() => {
		if (steamAppState.active.state === SteamUserState.Launching) {
			setTimeout(() =>  {
				dispatch({type: SteamAppActionType.SET_RUNNING, data: {uuid: steamAppState.active.uuid}})
			}, 2000)
		}
	}, [steamAppState.active])

	useEffect(() => {
		mousetrap.bind("ctrl+v", toggleModal)
		mousetrap.bind("esc", () => {setModalisOpen(false)})
		electronAPI.steamGetUsers().then(data => {
			//console.log("steamGetUsers: ", data)
			dispatch({type: SteamAppActionType.INITIAL_LOAD, data})
		})
		
		return () => {
			mousetrap.unbind("ctrl+v")
			mousetrap.unbind("esc")
		}
	}, [])

	return (
		<div className="SteamManagerComponent">
			<Modal isOpen={modalisOpen} {...{dispatch, steamAppState}} setIsModalOpen={setModalisOpen} />
			<div className={clsx("apikeys-drawer", {closed: !apiDrawerOpen})}>
				<div className="apikeys-header">
					<h3>Steam API Keys</h3>
				</div>
				<div className="apikeys-list">
					{Array.from({length: 5}).map((_, i) => {
						const key = steamAppState.apiKeys.length >= i ? steamAppState.apiKeys[i] : ""
						const keyval = key ? key.apiKey : ""
						const checked = key ? key.checked : false
						const editing = !checked && keyval.length > 0 && keyval.length !== 32
						return (<div className={clsx("apikey", {checked, editing })} key={i}>
							<span className="apikey-input">
								<input type="text" disabled={checked} placeholder="Api key" onChange={onApikeyChange(i)} defaultValue={keyval} />
								<FontAwesomeIcon onClick={validateApiKey(i)} className={clsx("icon-check", {"no-click": checked})} fade={keyval.length === 32 && !checked} icon={faCheck}/>
							</span>
							<span className="apikey-buttons">
								<span className={clsx("button delete", {disabled: !checked})} onClick={checked ? deleteApiKey(i): () => {}}><FontAwesomeIcon icon={faTrash} /></span>
								{editing && <span className="button message error">API key must be 32 chars!</span>}
								{!editing && !isAnyApikeyChecked() && keyval.length !== 32 && <span className="button message warning">At least one key must be checked!</span>}
								{!checked && keyval.length === 32 && <span className="button message info">Valid key size. Click to Validate!</span>}
								{checked && <span className="button message success">Key is working!</span>}
							</span>
						</div>)
					})}
				</div>
			</div>
			<div className="titleBar">
				<div className="titleWrapper">
					<h1 className="title">
						<img src={"assets/images/Steam.ico"}/>
						Steam Account Switcher
						<FontAwesomeIcon className={clsx({running: steamAppState.active.state !== SteamUserState.Stopped})} icon={faSignal} flip="horizontal"/>
					</h1>
					<div className="button new-account">
						<FontAwesomeIcon onClick={() => {setModalisOpen(true)}} className="icon-plus" size={"2x"} icon={faSquarePlus}/>
					</div>
				</div>
				<span className={clsx("apikeys-button", {ok: isAnyApikeyChecked()})} onClick={toggleApiDrawer}>
					{!isAnyApikeyChecked() && <FontAwesomeIcon fade className="icon-exclamation" size={"xs"} icon={faExclamation} />}
					<FontAwesomeIcon className="icon-code" icon={faCode} />
				</span>
			</div>
			<div className="cards">
				<div className="sized">
					{steamAppState.users.map(({windows_name, steam_name, state, details, uuid}) => {
						const user_is_active = windows_name === steamAppState.active.windows_name

						return (<div className={clsx(["accountCard"], { launching: state === SteamUserState.Launching , active: user_is_active, standby: steamAppState.active.uuid !== uuid })} key={windows_name}>
							<img className="avatar" src={details.avatarPath} alt="" />
							<span className="steam-name"><FontAwesomeIcon color={"$prussian-blue"} className="steam-icon" icon={faSteamSymbol}/>{steam_name}</span>
							<span className="windows-name"><FontAwesomeIcon color={"cyan"} className="win-icon" icon={faWindows}/>{windows_name}</span>
							<span className="option-buttons">
								<span className="settings"><FontAwesomeIcon className="settings-icon" icon={faGear}/></span>
								<span className="trash" onClick={onDeleteSteamUser(uuid)}><FontAwesomeIcon className="trash-icon" icon={faTrashCan}/></span>
							</span>
							<span className="active">
								<span className="toggle-button" onClick={onStartorStop(user_is_active, uuid)}>
									<FontAwesomeIcon className={clsx("icon", {start: user_is_active})} icon={user_is_active ? faSquare : faPlay}/>
									<span className="label">{user_is_active ? "Stop" : "Start"}</span>
								</span>
								<span className="label">{state === SteamUserState.Running ? <FontAwesomeIcon className="check-icon" icon={faCheck} /> :
									state === SteamUserState.Launching ? <FontAwesomeIcon className="spin-icon" icon={faArrowsRotate} spin /> :
									  <FontAwesomeIcon className="stop-icon" icon={faSquare} />}
								</span>
							</span>
						</div>)
					})}
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
