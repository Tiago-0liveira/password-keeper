import React, { useState, useCallback, useContext } from "react"
import "./styles.scss"
import ICONS from "../Icons"
import clsx from "clsx"
import { RowsContext } from "providers/RowsDataProvider";
import { ActionType } from "enums";

export interface RowProps {
	row: Row
	/*handleUpdate: (row: Row) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	handleDelete: (row: Row) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void*/
	//hidden?: boolean
	//style: React.CSSProperties
	dispatch: React.Dispatch<Action>
	canEditRef: React.RefObject<{ value: boolean }>
}

const RowComponent: React.FC<RowProps> = ({ dispatch, ...props }) => {
	const [isPassHidden, setIsPassHidden] = useState(true)
	const [isediting, setIsEditing] = useState(false)

	const setClipBoardText = (text: string) => () => { navigator.clipboard.writeText(text) }

	const editRow = () => {
		if (props.canEditRef.current && props.canEditRef.current.value) {
			props.canEditRef.current.value = false
			dispatch({ type: ActionType.ENABLE_EDIT, data: { row: props.row, cancelCallback: cancelEdit } })
			setIsEditing(true)
			console.log("zau")
		}
		else {
			/* TODO: animate because there is already some row being edited */
			console.log("akreadt ediuting")
		}
	}

	const cancelEdit = () => {
		if (props.canEditRef.current && !props.canEditRef.current.value)
			props.canEditRef.current.value = true
		setIsEditing(false)
	}
	const deleteRow = () => {
		dispatch({ type: ActionType.DELETE, data: { uuid: props.row.uuid } })
	}


	return (
		<div /*style={props.style}*/ className={clsx("Row", { isediting: isediting })} key={`${props.row.uuid}${Math.random().toFixed(4)}`}>
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
			<div className="username" onClick={setClipBoardText(props.row.username)} {...{ username: props.row.username ?? "" }}>
				<span className="value">{props.row.username && props.row.username}{/*{props.row.username && ICONS.row.clipboard}*/}</span>
			</div>
			<div className="password" onClick={setClipBoardText(props.row.password)}>
				<span className="value">{isPassHidden ? "************" : props.row.password}{/*{ICONS.row.clipboard}*/}{/*<FontAwesomeIcon icon={isPassHidden ? faEyeSlash : faEye} onClick={() => setIsPassHidden(b => !b)} />*/}</span>
			</div>
			<div className="buttons">
				{/*editMode ?
				<>
					<button className="cancel" onClick={cancelEdit}>Cancel{ICONS.main.exit}</button>
				</>
				:*/
					<>
						<button className="eye"   							    onClick={() => setIsPassHidden(b => !b)}>{isPassHidden ? ICONS.row.eye.on : ICONS.row.eye.off}</button>
						<button className="update" {...{ disabled: isediting }} onClick={editRow}>{ICONS.row.update}</button>
						<button className="delete" {...{ disabled: isediting }} onClick={deleteRow/*props.handleDelete(props.row)*/}>{ICONS.row.delete}</button>
					</>}
			</div>
		</div>
	)
}

export default React.memo(RowComponent)