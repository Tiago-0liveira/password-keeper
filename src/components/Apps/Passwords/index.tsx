import React, { useContext, useEffect, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
	faCheck,
	faEnvelope,
	faEraser,
	faExclamationTriangle,
	faFilter,
	faGlobe,
	faPencil,
	faPlus,
	faTimes,
	faUser
} from "@fortawesome/free-solid-svg-icons"
import "./styles.scss"
import clsx from "clsx"
import { ActionType, EBottomBarState, ValidateError } from "enums"
import ICONS from "../../Icons"
import PasswordsList from "./PasswordsList"
import RowsDataProvider, { RowsContext } from "providers/RowsDataProvider"

export type PasswordsComponentProps = {
	setExtraLabel: React.Dispatch<React.SetStateAction<string>>
}

const PasswordsComponent: React.FC<PasswordsComponentProps> = (props) => {
	const {data: state, dispatch} = useContext<RowsContextT>(RowsContext);
	const [isPassHidden, setIsPassHidden] = useState(true)
	const canEditRef = useRef({value: true})
	const [searchOpen, setSearchOpen] = useState(false)
	const filterRef = useRef<HTMLInputElement>(null)
	const formRef = useRef<HTMLFormElement>(null)

	const toggleSearchOpen = () => { setSearchOpen(b => !b) }
	const fetchRows = async () => {
		try {
			let t = false
			while (!t) {
				let rows = await window?.electronAPI?.getRows("", true)

				if (rows === undefined) {
					rows = []
					console.log(window)
					console.log(window.electronAPI)
				} else
					t = true
				dispatch({ type: ActionType.INITIAL_LOAD, data: rows })
				break
			}
		} catch (err) {
			console.error(err);
		}
	}

	useEffect(() => {
		fetchRows()
		if (searchOpen) {
			filterRef.current?.focus()
		}
	}, [searchOpen])
	const OpenBottomBar = (type: ActionType) => () => {
		saveInputData(true)
		dispatch({ type } as Action)
	}
	const resetInputsValue = () => {
		if (formRef === null || formRef.current === null) return
		console.log(formRef.current)
		formRef.current.reset()
	}
	const saveInputData = (flag_dispatch: boolean) => {
		if (state.bottomBar.state === EBottomBarState.Closed) return
		if (formRef === null || formRef.current === null) return
		let formData = new FormData(formRef.current)
		let data = { site: "", email: "", username: "", password: "" }
		resetInputsValue();
		switch (state.bottomBar.state) {
			case EBottomBarState.New: {
				data = state.bottomBar.data.new
				if (formData.get("site")) data.site = formData.get("site")?.toString() || ""
				if (formData.get("email")) data.email = formData.get("email")?.toString() || ""
				if (formData.get("username")) data.username = formData.get("username")?.toString() || ""
				if (formData.get("password")) data.password = formData.get("password")?.toString() || ""
				if (state.bottomBar.data.new != data) {
					if (flag_dispatch)
						dispatch({type: ActionType.UPDATE_NEW_DATA, data})
					else
						return data
				}
				break;
			}
			case EBottomBarState.Edit: {
				if (formData.get("site")) data.site = formData.get("site")?.toString() || ""
				if (formData.get("email")) data.email = formData.get("email")?.toString() || ""
				if (formData.get("username")) data.username = formData.get("username")?.toString() || ""
				if (formData.get("password")) data.password = formData.get("password")?.toString() || ""
				if (state.bottomBar.data.edit.row != data) {
					if (flag_dispatch)
						dispatch({type: ActionType.UPDATE_EDIT_DATA, data: {uuid: state.bottomBar.data.edit.row?.uuid, ...data}})
					else
						return {uuid: state.bottomBar.data.edit.row?.uuid, ...data}
				}
				break;
			}
		}
	}
	const buttonCloseClick = () => {
		saveInputData(true)
		dispatch({ type: ActionType.BB_CLOSE })
	}
	const buttonSaveClick = () => {
		let data = saveInputData(false)
		switch (state.bottomBar.state) {
			case EBottomBarState.New:
				window.electronAPI.validateAndNewRow(state.bottomBar.data.new)
					.then((opt) => {
						if (opt.isValid) {
							dispatch({type: ActionType.NEW, data: opt.value})
						} else {
							dispatch({type: ActionType.SET_ERROR, data: opt.value})
						}
					}).catch(err => {
						console.error(err)
					})
				break;
			case EBottomBarState.Edit:
				window.electronAPI.validateAndUpdateRow(data as Row)
					.then((opt) => {
						if (opt.isValid) {
							state.bottomBar.data.edit?.cancelCallback()
							dispatch({type: ActionType.EDIT, data: opt.value})
						} else {
							dispatch({type: ActionType.SET_ERROR, data: opt.value})
						}
					}).catch(err => {
						console.error(err)
					})
				break;
		}
	}
	const buttonCancelClick = () => {
		resetInputsValue()
		switch (state.bottomBar.state) {
			case EBottomBarState.New:
				dispatch({type: ActionType.UPDATE_NEW_DATA, data: {site:"", username:"", password:"", email:""}})
				break;
			case EBottomBarState.Edit:
				state.bottomBar.data.edit?.cancelCallback()
				dispatch({type: ActionType.UPDATE_EDIT_DATA, data: {uuid: -1, site:"", username:"", password:"", email:""}})
				break;
		}
	}
	const getBottomBarClassName = () => {
		switch (state.bottomBar.state) {
			case EBottomBarState.New:
				return "new"
			case EBottomBarState.Edit:
				return "edit"
			case EBottomBarState.Filter:
				return "filter"
			default:
				throw Error("Unknown bottom bar state")
		}
	}
	const bottomBarisOpen = () => {
		return state.bottomBar.state > EBottomBarState.Closed && state.bottomBar.state < EBottomBarState.LAST
	}

	const bottomBarContent = () => {
		let element = <></>
		if (state.bottomBar.state === EBottomBarState.Filter)
		{
			element = <div className="Filter">Work in Progress!</div>
		}
		else if (state.bottomBar.state === EBottomBarState.New || state.bottomBar.state === EBottomBarState.Edit)
		{
			if (state.bottomBar.state === EBottomBarState.Edit && state.bottomBar.data.edit.row?.uuid === undefined)
				element = <>
					<div className="NoRowSelected">
						<p>No Row selected!</p>
					</div>
				</>
			else 
				element = <>
					{element}
					<div className={clsx("input")}>
						<span className={clsx("inputWrapper", { error: ValidateError.site === state.bottomBar.error })}>
							<label htmlFor="site"><FontAwesomeIcon icon={faGlobe} size="1x" /></label>
							<input type="text" name="site" id="site" defaultValue={state.bottomBar.state === EBottomBarState.New ? state.bottomBar.data.new.site : state.bottomBar.data.edit?.row?.site} placeholder="Site" />
						</span>
					</div>
					<div className={clsx("input")}>
						<span className={clsx("inputWrapper", { error: [ValidateError.emailFormat, ValidateError.emailLength].includes(state.bottomBar.error) })}>
							<label htmlFor="email"><FontAwesomeIcon icon={faEnvelope} size="1x" /></label>
							<input type="text" defaultValue={state.bottomBar.state === EBottomBarState.New ? state.bottomBar.data.new.email : state.bottomBar.data.edit.row?.email} /*onChange={onInputChangeTemplate("email")}*/ name="email" id="email" list="mails" placeholder="Email" />
							<datalist id="mails">
								{/*{props.mails.map(mail => <option key={Math.random()} value={mail} />)}*/}
							</datalist>
						</span>
					</div>
					<div className="input">
						<span className="inputWrapper">
							<label htmlFor="username"><FontAwesomeIcon icon={faUser} size="1x" /></label>
							<input type="text" defaultValue={state.bottomBar.state === EBottomBarState.New ? state.bottomBar.data.new.username : state.bottomBar.data.edit.row?.username} /*onChange={onInputChangeTemplate("username")}*/ name="username" id="username" placeholder="Username" />
						</span>
					</div>
					<div className={clsx("input")}>
						<span className={clsx("inputWrapper", { error: ValidateError.password === state.bottomBar.error })}>
							<label htmlFor="password" className="password" onClick={() => setIsPassHidden(b => !b)}>{isPassHidden ? ICONS.passwordsComp.lock.closed : ICONS.passwordsComp.lock.open}</label>
							<input type={isPassHidden ? "password" : "text"} defaultValue={state.bottomBar.state === EBottomBarState.New ? state.bottomBar.data.new.password : state.bottomBar.data.edit.row?.password} /*onChange={onInputChangeTemplate("password")}*/ name="password" id="password" placeholder="Password" />
							{/*<span className="eye" onClick={() => setIsPassHidden(b => !b)}>{isPassHidden ? ICONS.passwordsComp.lock.closed : ICONS.passwordsComp.lock.open}</span>*/}
						</span>
					</div>
				</>
		}

		element = <>
			{element}
			<div className="buttonwrappers">
				<span className="button close" onClick={buttonCloseClick}>
					<span>Close</span>
					<FontAwesomeIcon icon={faTimes} size="1x" />
				</span>
				{(state.bottomBar.state === EBottomBarState.New || (state.bottomBar.state === EBottomBarState.Edit && state.bottomBar.data.edit.row?.uuid !== undefined)) ?
					<>
					<span className="button erase" onClick={buttonCancelClick}>
						<span>Cancel</span>
						<FontAwesomeIcon icon={faEraser} size="1x" />
					</span>
					<span className="button save" onClick={buttonSaveClick}>
						<span>{state.bottomBar.state === EBottomBarState.New ? "Save" : "Edit"}</span>
						<FontAwesomeIcon icon={faCheck} size="1x" />
					</span>
					</>
				: <></>}
			</div>
		</>
		return element
	}

	return (
		<div className="PasswordsComponent">
			<PasswordsList rows={state.rows} dispatch={dispatch} canEditRef={canEditRef}/>
			<div className={clsx("bottomBar", { "closed": EBottomBarState.Closed ===  state.bottomBar.state})}>
				<div className="top-bar">
					<div className="button newButton" onClick={OpenBottomBar(ActionType.BB_OPEN_NEW)}>
						<span className="label">New</span> <FontAwesomeIcon icon={faPlus} size="sm" />
					</div>
					<div className="button editButton" onClick={OpenBottomBar(ActionType.BB_OPEN_EDIT)}>
						<span className="label">Edit</span> <FontAwesomeIcon icon={faPencil} size="sm" />
					</div>
					<div className="button filterButton" onClick={OpenBottomBar(ActionType.BB_OPEN_FILTER)}>
						<span className="label">Filter</span> <FontAwesomeIcon icon={faFilter} size="sm" />
					</div>
					{EBottomBarState.Closed !== state.bottomBar.state && state.bottomBar.error !== ValidateError.none && <div className="button disabled error">
						<FontAwesomeIcon icon={faExclamationTriangle} size="sm" />
						<p className="label">{state.bottomBar.error}</p>
					</div>}
				</div>

				<div className={clsx("bottom-bar")}>
					{bottomBarisOpen() && 
					<form ref={formRef} className={getBottomBarClassName()}>
						{bottomBarContent()}
					</form>}

					{/* if state is Filter open the filter tab (we can filter by site, email and username*/}
					{/*{rowsData.bottomBar.state === BottomBarState.Filter && <form className="filter">
						<div className="input">
							<label htmlFor="site">Site</label>
							<input type="text" id="site" />
						</div>
						<div className="input">
							<label htmlFor="email">Email</label>
							<input type="text" id="email" />
						</div>

						<div className="input">
							<label htmlFor="username">Username</label>
							<input type="text" id="username" />
						</div>
						<span className="button" onClick={() => setBottomPanelState(BottomBarState.Closed)}>Save</span>
					</form>}*/}
				</div>
			</div>
		</div>
	)
}

interface Appprops extends PasswordsComponentProps {}
const App: React.FC<Appprops> = (props) =>
	(<RowsDataProvider>
		<PasswordsComponent {...props}/>
	</RowsDataProvider>)

export default {
	label: "Password Vault",
	component: App,
	extraLabel: false
}