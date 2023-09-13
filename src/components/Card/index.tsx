import React, { useState } from "react"
import "./styles.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClipboardList, faEye, faEyeSlash, faPencilAlt, faTimes } from "@fortawesome/free-solid-svg-icons"
import clsx from "clsx"

export interface CardProps {
	row: Row
	handleUpdate: (row: Row) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	handleDelete: (row: Row) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const CardComponent: React.FC<CardProps> = (props) => {
	const [isPassHidden, setIsPassHidden] = useState(true)
	return (
		<div className={clsx({ small: props.row.username == undefined }, "Card")} key={`${props.row.uuid}${Math.random().toFixed(4)}`}>
			<div className="site" onClick={() => navigator.clipboard.writeText(props.row.site)}>
				<b className="label">Site: </b>
				<span className="value">{props.row.site}</span>
				<span className="buttons">
					<span className="button"><FontAwesomeIcon icon={faClipboardList} onClick={() => navigator.clipboard.writeText(props.row.site)} size="lg" /></span>
				</span>
			</div>
			<div className="email" onClick={() => navigator.clipboard.writeText(props.row.email)}>
				<b className="label">Email: </b>
				<span className="value">{props.row.email}</span>
				<span className="buttons">
					<span className="button"><FontAwesomeIcon icon={faClipboardList} onClick={() => navigator.clipboard.writeText(props.row.email)} size="lg" /></span>
				</span>
			</div>
			{props.row.username && <div className="username" onClick={() => navigator.clipboard.writeText(props.row.username)}>
				<b className="label">Username: </b>
				<span className="value">{props.row.username}</span>
				<span className="buttons">
					<span className="button"><FontAwesomeIcon icon={faClipboardList} onClick={() => navigator.clipboard.writeText(props.row.username)} size="lg" /></span>
				</span>
			</div>}
			<div className="password">
				<b className="label">Password: </b>
				<span className="value" onClick={() => setIsPassHidden(b => !b)}>{isPassHidden ? "*".repeat(12) : props.row.password}<span className="button"><FontAwesomeIcon icon={isPassHidden ? faEyeSlash : faEye} /></span></span>
				<span className="buttons">
					<span className="button"><FontAwesomeIcon icon={faClipboardList} onClick={() => navigator.clipboard.writeText(props.row.password)} size="lg" /></span>
				</span>
			</div>
			<button className="update" onClick={props.handleUpdate(props.row)}><FontAwesomeIcon icon={faPencilAlt} size="lg" /></button>
			<button className="delete" onClick={props.handleDelete(props.row)}><FontAwesomeIcon icon={faTimes} size="lg" /></button>
		</div>
	)
}

export default React.memo(CardComponent)