import React, { useState } from "react"
import "./styles.scss"
import type { Row } from "../../types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClipboardList, faEdit, faEye, faEyeSlash, faTimes } from "@fortawesome/free-solid-svg-icons"

export interface RowProps {
	row: Row
	handleUpdate: (row: Row) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	handleDelete: (row: Row) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const RowComponent: React.FC<RowProps> = (props) => {
	const [isPassHidden, setIsPassHidden] = useState(true)
	return (
		<div className="Row" key={`${props.row.uuid}${Math.random().toFixed(4)}`}>
			<div className="site">
				<span className="value">{props.row.site}<FontAwesomeIcon icon={faClipboardList} onClick={() => navigator.clipboard.writeText(props.row.site)} size="lg" /></span>
			</div>
			<div className="email">
				<span className="value">{props.row.email}<FontAwesomeIcon icon={faClipboardList} onClick={() => navigator.clipboard.writeText(props.row.email)} size="lg" /></span>
			</div>
			<div className="username">
				<span className="value">{props.row.username && props.row.username}{props.row.username && <FontAwesomeIcon icon={faClipboardList} onClick={() => navigator.clipboard.writeText(props.row.username)} size="lg" />}</span>
			</div>
			<div className="password">
				<span className="value">{isPassHidden ? "*".repeat(12) : props.row.password}<FontAwesomeIcon icon={faClipboardList} onClick={() => navigator.clipboard.writeText(props.row.password)} size="lg" /><FontAwesomeIcon icon={isPassHidden ? faEyeSlash : faEye} onClick={() => setIsPassHidden(b => !b)} /></span>
			</div>
			<div className="buttons">
				<button className="update" onClick={props.handleUpdate(props.row)}><FontAwesomeIcon icon={faEdit} size="lg" /></button>
				<button className="delete" onClick={props.handleDelete(props.row)}><FontAwesomeIcon icon={faTimes} size="lg" /></button>
			</div>
		</div>
	)
}

export default RowComponent