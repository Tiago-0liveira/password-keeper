import React, { useState } from "react"
import "./styles.scss"
import ICONS from "../Icons"
import clsx from "clsx"

export interface RowProps {
	row: Row
	handleUpdate: (row: Row) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	handleDelete: (row: Row) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	hidden?: boolean
	style: React.CSSProperties
}

const RowComponent: React.FC<RowProps> = (props) => {
	const [isPassHidden, setIsPassHidden] = useState(true)

	const setClipBoardText = (text: string) => () => { navigator.clipboard.writeText(text) }

	return (
		<div style={props.style} className={clsx("Row", { hidden: props.hidden })} key={`${props.row.uuid}${Math.random().toFixed(4)}`}>
			<div className="site" onClick={setClipBoardText(props.row.site)}>
				<span className="value">{props.row.site}{/*{ICONS.row.clipboard}*/}</span>
			</div>
			<div className="email" onClick={setClipBoardText(props.row.email)}>
				<span className="value">{props.row.email.endsWith("@gmail.com") ?
					<>{ICONS.global.google("google-icon")}{props.row.email.slice(0, props.row.email.indexOf("@"))}</> :
					<>{props.row.email}</>}

					{/*{ICONS.row.clipboard}*/}
				</span>
			</div>
			<div className="username" onClick={setClipBoardText(props.row.username)} {...{username: props.row.username ?? ""}}>
				<span className="value">{props.row.username && props.row.username}{/*{props.row.username && ICONS.row.clipboard}*/}</span>
			</div>
			<div className="password" onClick={setClipBoardText(props.row.password)}>
				<span className="value">{isPassHidden ? "************" : props.row.password}{/*{ICONS.row.clipboard}*/}{/*<FontAwesomeIcon icon={isPassHidden ? faEyeSlash : faEye} onClick={() => setIsPassHidden(b => !b)} />*/}</span>
			</div>
			<div className="buttons">
				<button className="eye" onClick={() => setIsPassHidden(b => !b)}>{isPassHidden ? ICONS.row.eye.on : ICONS.row.eye.off}</button>
				<button className="update" onClick={props.handleUpdate(props.row)}>{ICONS.row.update}</button>
				<button className="delete" onClick={props.handleDelete(props.row)}>{ICONS.row.delete}</button>
			</div>
		</div>
	)
}

export default React.memo(RowComponent)