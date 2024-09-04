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
	faSignal,
	faSquarePlus
} from "@fortawesome/free-solid-svg-icons"

import { faSteamSymbol, faWindows } from "@fortawesome/free-brands-svg-icons"
import { SteamAppActionType, SteamUserState, ValidateError } from "@src/enums"
import { steamUsersDefault, steamUsersReducer } from "@reducers/steamUsersReducer"
import Modal from "@components/Modal"
import mousetrap from "mousetrap"
import { deleteApiKey, insertOne } from "@api/SteamManager/api_keys"
import { getInitLoad, launch_steam_as, shutdown_steam } from "@api/SteamManager/steam"
import { deleteSteamUser } from "@api/SteamManager/users"

const SteamManagerComponent: React.FC = () => {
	const [steamAppState, dispatch] = useReducer(steamUsersReducer, steamUsersDefault)
	const [apiDrawerOpen, setApiDrawerOpen] = useState(false)
	const [modalisOpen, setModalisOpen] = useState(false)
	const [error, setError] = useState<{index: Number, error: String}>({index: -1, error: ""})/* lets do it later */

	const toggleApiDrawer = () => {
		setApiDrawerOpen((prev) => !prev)
	}
	const onApikeyChange = (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
		dispatch({type: SteamAppActionType.API_KEY_UPDATE, data: {index: i, value: e.target.value}})
	}
	const validateApiKey = (i: number) => () => {
		const key = steamAppState.api_keys[i]
		if (key.api_key.length === 32) {
			insertOne(key.api_key).then(r_key => {
				setError({index: -1, error: ""})
				dispatch({type: SteamAppActionType.API_KEY_SAVE, data: { index: i, key: r_key }})
			}).catch((err: ValidateError) => {
				setError({index: i, error: err})
			})
		}
	}
	const handleDeleteApiKey = (i: number) => () => {
		const uuid = steamAppState.api_keys[i].uuid
		deleteApiKey(uuid).then(() => {
			dispatch({type: SteamAppActionType.API_KEY_DELETE, data: { uuid }})
		}).catch((err) => {
			console.error(err)
		})
	}
	const onDeleteSteamUser = (uuid: number) => () => {
		deleteSteamUser(uuid).then(() => {
			dispatch({type: SteamAppActionType.DELETE, data: {uuid}})
		}).catch((err) => {
			console.error(err)
		})
	}
	const toggleModal = () => {
		setModalisOpen((prev) => !prev)
	}
	const onStartorStop = (start: boolean, uuid: number) => () => {
		if (!start) {
			let user = steamAppState.users.find(user => user.uuid === uuid)
			if (!user) return
			dispatch({type: SteamAppActionType.SET_LAUNCHING, data: {uuid}})
			launch_steam_as(user.windows_name).then(data => {
				console.log("launch_steam_as: ", data)
				if (data.state === SteamUserState.Launching) {
					console.log("set running: ", uuid)
					dispatch({type: SteamAppActionType.SET_RUNNING, data: {uuid}})
					console.log("set running: ", uuid)
				} else {
					console.log("set stopped: ", uuid)
					dispatch({type: SteamAppActionType.SET_STOPPED})
					console.log("set stopped: ", uuid)
				}
			}).catch(console.error)
		}
		else {
			shutdown_steam().then(() => {
				dispatch({type: SteamAppActionType.SET_STOPPED})
			})
		}
	}
	const isAnyApikeyChecked = useCallback(() => {
		return steamAppState.api_keys.some(key => key.checked)
	}, [steamAppState.api_keys])

	const getApiKeyMessageComponent = (i: number) => {
		if (error.index != -1 && error.index === i) return <span className="button message error">{error.error}</span>
		const key = steamAppState.api_keys.length >= i ? steamAppState.api_keys[i] : ""
		const keyval = key ? key.api_key : ""
		const checked = key ? key.checked : false
		const editing = !checked && keyval.length > 0 && keyval.length !== 32
		if (editing) return <span className="button message error">API key must be 32 chars!</span>
		else if (!editing && !isAnyApikeyChecked() && keyval.length !== 32) return <span className="button message warning">At least one key must be checked!</span>
		else if (!checked && keyval.length === 32) return <span className="button message info">Valid key size. Click to Validate!</span>
		else if (checked) return <span className="button message success">Key is working!</span>
	}

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
		getInitLoad().then(data => {
			console.log("getInitLoad: ", data)
			dispatch({type: SteamAppActionType.INITIAL_LOAD, data})
		}).catch(err => {
			console.error(err)
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
						const key = steamAppState.api_keys.length >= i ? steamAppState.api_keys[i] : ""
						const keyval = key ? key.api_key : ""
						const checked = key ? key.checked : false
						const editing = !checked && keyval.length > 0 && keyval.length !== 32
						return (<div className={clsx("apikey", {checked, editing })} key={i}>
							<span className="apikey-input">
								<input type="text" disabled={checked} placeholder="Api key" onChange={onApikeyChange(i)} defaultValue={keyval} />
								<FontAwesomeIcon onClick={validateApiKey(i)} className={clsx("icon-check", {"no-click": checked})} fade={keyval.length === 32 && !checked} icon={faCheck}/>
							</span>
							<span className="apikey-buttons">
								<span className={clsx("button delete", {disabled: !checked})} onClick={checked ? handleDeleteApiKey(i): () => {}}><FontAwesomeIcon icon={faTrash} /></span>
								{getApiKeyMessageComponent(i)}
							</span>
						</div>)
					})}
				</div>
			</div>
			<div className="titleBar">
				<div className="titleWrapper">
					<h1 className="title">
						<img src={"/steam.svg"}/>
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
					{steamAppState.users.map(({windows_name, steam_name, state, uuid, avatar_path}) => {
						const user_is_active = windows_name === steamAppState.active.windows_name

						return (<div className={clsx(["accountCard"], { launching: state === SteamUserState.Launching , active: user_is_active, standby: steamAppState.active.uuid !== uuid })} key={windows_name.toString()}>
							<img className="avatar" src={avatar_path.toString()} alt="" />
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
