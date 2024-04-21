import React, { useEffect, useState } from "react"
import "./styles.scss"
import clsx from "clsx"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope, faGlobe, faLock, faEye, faEyeSlash, faUser, faArrowLeft } from "@fortawesome/free-solid-svg-icons"
//import { ipcRenderer } from "electron"
import Mousetrap from "mousetrap"

export type ModalProps = {
	setModalData: React.Dispatch<React.SetStateAction<ModalData>>
	modalData: ModalData
	dataforDataLists: DataToDataLists
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
		if (props.modalData.updateData) {
			setSite(props.modalData.updateData.site)
			setEmail(props.modalData.updateData.email)
			setUsername(props.modalData.updateData.username)
			setPassword(props.modalData.updateData.password)
		} else {
			cleanState()
		}
	}, [props.modalData.updateData]);

	useEffect(() => {
		if (props.modalData.active) {
			Mousetrap.bind("escape", () => {
				props.setModalData((prev) => {return {...prev, active:false}})
			})
		} else {
			Mousetrap.unbind("escape")
		}
		return () => {
			Mousetrap.unbind("escape")
		};
	}, [props.modalData.active]);

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
				if (!props.modalData.updating) {
					/*ipcRenderer.send("requestNewRow", { site: Site, email: Email, password: Password, username: Username })*/
					window.electronAPI.newRow({ site: Site, email: Email, password: Password, username: Username })
				} else {
					/*ipcRenderer.send("requestUpdateRow", { uuid: (props.modalData.updateData as Row).uuid, newRowData: { site: Site, email: Email, password: Password, username: Username } })*/
					window.electronAPI.updateRow((props.modalData.updateData as Row).uuid, { site: Site, email: Email, password: Password, username: Username })
					props.setModalData((prev) => {return {...prev, updating:false, updateData:undefined}})
				}
				props.setModalData((prev) => {return {...prev, active:false}})
				cleanState()
			} else {
				console.log("no");
				/* !TODO SHOW ERROR HERE */
			}
		} else {
			if (textArea) {
				try {
					const r: Row[] = JSON.parse(textArea)
					r.map(b => {
						return { site: b.site, email: b.email, password: b.password, username: b.username }
					}).forEach(row => {
						window.electronAPI.newRow(row)
						/*ipcRenderer.send("requestNewRow", row)*/
					});
					props.setModalData((prev) => {return {...prev, active:false}})
					cleanState()
				} catch (error) {
					console.error(error);
				}
			}
		}
	}
	const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault()
		props.setModalData({active: false, updating: false, updateData: undefined})
	}
	const handleOutSideClick = (e: any) => {
		e.persist()
		e._targetInst.pendingProps.className?.includes("Modal") && handleCancel(e)
	}
	return (
		<div className={clsx("ModalWrapper", { active: props.modalData.active })} onClick={handleOutSideClick}>
			<div className="Modal">
				<form onSubmit={handleOnSubmit}>
					<div className="top">
						<h2>{props.modalData.updating ? "Update Row" : "New Row"}</h2>
					</div>
					<div className="content">
						{modalIsText ? <>
							<div className="site">
								<FontAwesomeIcon color="black" icon={faGlobe} size="lg" />
								<input type="text" value={Site} placeholder="Site" onChange={(e) => { setSite(e.target.value) }} />
							</div>
							<div className="email">
								<FontAwesomeIcon color="black" icon={faEnvelope} size="lg" />
								<input type="text" value={Email} list="mails" placeholder="Email" onChange={(e) => { setEmail(e.target.value) }} />
								<datalist id="mails">
									{props.dataforDataLists.mails.map(mail => <option key={Math.random()} value={mail} />)}
								</datalist>
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
					<div className={clsx("bottom", { hasLeftSide: !props.modalData.updating })}>
						{!props.modalData.updating && <div className="modalTypeDiv">
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