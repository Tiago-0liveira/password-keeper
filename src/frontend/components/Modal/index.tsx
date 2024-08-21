import React, { useEffect, useRef, useState } from "react"
import "./styles.scss"
import clsx from "clsx"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons"
import { faSteamSymbol, faWindows } from "@fortawesome/free-brands-svg-icons"
import { SteamAppActionType } from "@shared/enums"

export type ModalProps = {
	isOpen: boolean
	setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
	steamAppState: SteamAppState
	dispatch: React.Dispatch<SteamAppAction>
}
const Modal: React.FC<ModalProps> = (props) => {
	const [steam_id, setSteamId] = useState("")
	const steamIdInputRef = useRef<HTMLInputElement>(null)
	const [windows_name, setWindowsName] = useState("")
	const [errorMessage, setError] = useState("")

	const onSteamIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSteamId(e.target.value)
	}
	const onWindowsNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setWindowsName(e.target.value)
	}

	const saveModal = () => {
		if (steam_id.length !== 17) {
			setError("Steam ID must have 17 chars!")
			return
		}
		if (windows_name.length === 0) {
			setError("You must select a windows user!")
			return
		}
		window.electronAPI.apps.steam.validateAndSaveSteamUser(steam_id, windows_name).then((options) => {
			if (options.success) {
				props.dispatch({type: SteamAppActionType.NEW, data: options.value})
				if (steamIdInputRef.current)
					steamIdInputRef.current.value = ""
				setSteamId("")
				
				props.setIsModalOpen(false)
			} else {
				setError(options.value.message)
			}
		})
	}

	const closeModal = () => {
		props.setIsModalOpen(false)
	}

	useEffect(() => {
		const name = props.steamAppState.windows_users.find((user) => !user.in_use)?.name
		if (name) {
			setWindowsName(name)
		}
	}, [props.steamAppState.windows_users])

	return (
		<div className={clsx("Modal", {open: props.isOpen})}>
			<div className="modal-content">
				<div className="modal-header">
					<h2>Add Steam User</h2>
				</div>

				<div className="modal-body">
					<span className="inputs">
						<span className="steam-id input">
							<FontAwesomeIcon className="icon steam" icon={faSteamSymbol} size={"lg"}/>
							<input type="text" placeholder="Steam ID" ref={steamIdInputRef} onChange={onSteamIdChange}/>
							{steam_id.length === 17 && <FontAwesomeIcon className="icon check" icon={faCheck} size={"lg"}/>}
						</span>
						<span className="select win-user">
							<FontAwesomeIcon icon={faWindows} size={"lg"}/>
							<select id="choices" name="choices" onChange={onWindowsNameChange} defaultChecked>
								{props.steamAppState.windows_users.filter((user) => !user.in_use).map((user, i) => (
									<option key={i} value={user.name}>{user.name}</option>
								))}
							</select>
						</span>
						{ errorMessage.length > 0 && <span className="error message">
							<span className="icon"><FontAwesomeIcon icon={faXmark}/></span>
							<span className="text">{errorMessage}</span>
						</span>}
					</span>
					<span className="buttons">
						<span className="button close" onClick={closeModal}>
							Close <FontAwesomeIcon icon={faXmark}/>
						</span>
						<span className="button save" onClick={saveModal}>
							Save <FontAwesomeIcon icon={faCheck}/>
						</span>
					</span>
					
				</div>

			</div>
		</div>
	)
}

export default Modal