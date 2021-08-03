import React, { useEffect, useState } from "react"
import "./styles.scss"
import clsx from "clsx"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope, faGlobe, faLock, faEye, faEyeSlash, faUser, faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { Row } from "../../types"
import { ipcRenderer, remote } from "electron"

export type ModalProps = {
	setActive: React.Dispatch<React.SetStateAction<boolean>>
	active: boolean
	update: boolean
	updateData?: Row
	setUpdate: React.Dispatch<React.SetStateAction<boolean>>
	setUpdateData: React.Dispatch<React.SetStateAction<Row | undefined>>
}
const Modal: React.FC<ModalProps> = (props) => {
	const [Site, setSite] = useState("")
	const [Email, setEmail] = useState("")
	const [Username, setUsername] = useState("")
	const [Password, setPassword] = useState("")
	const [passVisible, setPassVisible] = useState(false)
	const [modalIsText, setModalIsText] = useState(true)
	const [textArea, setTextArea] = useState("")
	useEffect(() => {
		if (props.updateData) {
			setSite(props.updateData.site)
			setEmail(props.updateData.email)
			setUsername(props.updateData.username)
			setPassword(props.updateData.password)
		} else {
			cleanState()
		}
	}, [props.updateData]);

	useEffect(() => {
		remote.globalShortcut.register("Escape", () => {
			props.setActive(false)
		})
		return () => {
			remote.globalShortcut.unregister("Escape")
		};
	}, []);

	const cleanState = () => {
		setSite("")
		setEmail("")
		setUsername("")
		setPassword("")
		setTextArea("")
	}
	const togglePassVisible = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault()
		setPassVisible(bef => !bef)
	}
	const handleOnSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (modalIsText) {
			if ([Site, Email, Password].every(s => s.trim() != "" && s.trim().length > 2)) {
				if (!props.update) {
					ipcRenderer.send("requestNewRow", { site: Site, email: Email, password: Password, username: Username })
				} else {
					console.log("update -> ", props.updateData);
					ipcRenderer.send("requestUpdateRow", { uuid: (props.updateData as Row).uuid, newRowData: { site: Site, email: Email, password: Password, username: Username } })
					props.setUpdate(false)
					props.setUpdateData(undefined)
				}
				props.setActive(false)
				cleanState()
			} else {
				console.log("no");
			}
		} else {
			if (textArea) {
				try {
					const r: Row[] = JSON.parse(textArea)
					console.log(r);
					r.map(b => {
						return { site: b.site, email: b.email, password: b.password, username: b.username }
					}).forEach(row => {
						ipcRenderer.send("requestNewRow", row)
					});
					props.setActive(false)
					cleanState()
				} catch (error) {
					console.error(error);
				}
			}
		}
	}
	const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault()
		props.setActive(false)
		props.setUpdate(false)
		props.setUpdateData(undefined)
	}
	const handleOutSideClick = (e: any) => {
		e.persist()
		console.log(e._targetInst.pendingProps.className);
		e._targetInst.pendingProps.className?.includes("Modal") && handleCancel(e)
	}
	return (
		<div className={clsx("ModalWrapper", { active: props.active })} onClick={handleOutSideClick}>
			<div className="Modal">
				<form onSubmit={handleOnSubmit}>
					<div className="top">
						<h2>{props.update ? "Update Row" : "New Row"}</h2>
					</div>
					<div className="content">
						{modalIsText ? <>
							<div className="site">
								<FontAwesomeIcon color="black" icon={faGlobe} size="lg" />
								<input type="text" value={Site} placeholder="Site" onChange={(e) => { setSite(e.target.value) }} />
							</div>
							<div className="email">
								<FontAwesomeIcon color="black" icon={faEnvelope} size="lg" />
								<input type="text" value={Email} placeholder="Email" onChange={(e) => { setEmail(e.target.value) }} />
							</div>
							<div className="username">
								<FontAwesomeIcon color="black" icon={faUser} size="lg" />
								<input type="text" value={Username} placeholder="Username" onChange={(e) => { setUsername(e.target.value) }} />
							</div>
							<div className="password">
								<FontAwesomeIcon color="black" icon={faLock} size="lg" />
								<div className="PassInputDiv">
									<input type={!passVisible ? "password" : "text"} value={Password} placeholder="Password" onChange={(e) => { setPassword(e.target.value) }} />
									<button onClick={togglePassVisible}><FontAwesomeIcon icon={passVisible ? faEye : faEyeSlash} /></button>
								</div>
							</div>
						</> : <>
							<textarea name="json" id="json" onChange={(e) => { setTextArea(e.target.value) }} />
						</>}
					</div>
					<div className={clsx("bottom", { hasLeftSide: !props.update })}>
						{!props.update && <div className="modalTypeDiv">
							<span onClick={() => { setModalIsText(b => !b) }}><span className={clsx("text", { active: modalIsText })}> <b>Text</b> </span> <FontAwesomeIcon className={modalIsText ? "TEXT" : "JSON"} icon={faArrowLeft} size="1x" /> <span className={clsx("json", { active: !modalIsText })}> <b>Json</b> </span></span>
						</div>}
						<div className="buttons">
							<button onClick={handleCancel} className="cancel">Cancel</button>
							<button onClick={handleOnSubmit} className="confirm">Confirm</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	)
}

export default Modal