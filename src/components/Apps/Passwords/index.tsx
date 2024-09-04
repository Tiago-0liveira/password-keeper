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
	faSquareCheck,
	faTimes,
	faUser
} from "@fortawesome/free-solid-svg-icons"
import "./styles.scss"
import clsx from "clsx"
import { PasswordsAppActionType, EBottomBarState, ValidateError } from "@src/enums"
import ICONS from "../../Icons"
import PasswordsList from "./PasswordsList"
import Mousetrap from "mousetrap"
import { faSquare } from "@fortawesome/free-regular-svg-icons"
import { rowsDataDefault } from "@reducers/rowsDataReducer"
import { getRows, insertOne, updateRow } from "@api/Passwords"
import RowsDataProvider, { RowsContext } from "@src/Providers/RowsDataProvider"

export type PasswordsComponentProps = {
	setExtraLabel: React.Dispatch<React.SetStateAction<string>>
}

const PasswordsComponent: React.FC<PasswordsComponentProps> = () => {
	const {data: state, dispatch} = useContext<RowsContextT>(RowsContext);
	const [isPassHidden, setIsPassHidden] = useState(true)
	const canEditRef = useRef({value: true})
	const formRef = useRef<HTMLFormElement>(null)

	const handleCtrlC = () => {
		buttonCloseClick()
	}
	const handleCtrlF = () => {
		dispatch({type: PasswordsAppActionType.BB_TOGGLE_FILTER})
	}
	const handleCtrlE = () => {
		dispatch({type: PasswordsAppActionType.BB_TOGGLE_EDIT})
	}
	const handleCtrlN = () => {
		dispatch({type: PasswordsAppActionType.BB_TOGGLE_NEW})
	}

	const fetchRows = () => {
		getRows()
			.then(users => {
				dispatch({ type: PasswordsAppActionType.INITIAL_LOAD, data: users })
			}).catch(err => {
				console.error(err)
			})
	}

	useEffect(() => {
		fetchRows()
		/*fetchRows()*/
		Mousetrap.bind("ctrl+c", handleCtrlC)
		Mousetrap.bind("ctrl+n", handleCtrlN)
		Mousetrap.bind("ctrl+e", handleCtrlE)
		Mousetrap.bind("ctrl+f", handleCtrlF)
		return () => {
			Mousetrap.unbind("ctrl+c")
			Mousetrap.unbind("ctrl+n")
			Mousetrap.unbind("ctrl+e")
			Mousetrap.unbind("ctrl+f")
		}
	}, [])
	const OpenBottomBar = (type: PasswordsAppActionType) => () => {
		saveInputData(true)
		dispatch({ type } as PasswordAppAction)
	}
	const resetInputsValue = () => {
		if (formRef === null || formRef.current === null) return
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
						dispatch({type: PasswordsAppActionType.UPDATE_NEW_DATA, data})
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
						dispatch({type: PasswordsAppActionType.UPDATE_EDIT_DATA, data: {uuid: state.bottomBar.data.edit.row?.uuid, ...data}})
					else
						return {uuid: state.bottomBar.data.edit.row?.uuid, ...data}
				}
				break;
			}
		}
	}
	const buttonCloseClick = () => {
		saveInputData(true)
		dispatch({ type: PasswordsAppActionType.BB_CLOSE })
	}
	const buttonSaveClick = () => {
		let data = saveInputData(false)
	
		switch (state.bottomBar.state) {
			case EBottomBarState.New:
				insertOne(state.bottomBar.data.new)
					.then(user => {
						dispatch({type: PasswordsAppActionType.NEW, data: user as Row})
					})
					.catch(err => {
						dispatch({type: PasswordsAppActionType.SET_ERROR, data: err})
						console.error(err)
					})
				break;
			case EBottomBarState.Edit:
				updateRow(data as Row).then((user) => {
					state.bottomBar.data.edit?.cancelCallback()
					dispatch({type: PasswordsAppActionType.EDIT, data: user as Row})
				}).catch(err => {
					console.error(err)
					dispatch({type: PasswordsAppActionType.SET_ERROR, data: err})
				})
				break;
		}
	}
	const buttonCancelClick = () => {
		resetInputsValue()
		switch (state.bottomBar.state) {
			case EBottomBarState.New:
				dispatch({type: PasswordsAppActionType.UPDATE_NEW_DATA, data: {site:"", username:"", password:"", email:""}})
				break;
			case EBottomBarState.Edit:
				state.bottomBar.data.edit?.cancelCallback()
				dispatch({type: PasswordsAppActionType.UPDATE_EDIT_DATA, data: {uuid: -1, site:"", username:"", password:"", email:""}})
				break;
		}
	}
	const buttonResetClick = () => {
		if (state.filter == rowsDataDefault.filter) return
		dispatch({type: PasswordsAppActionType.FILTER_RESET})
	}
	const onFilterInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		dispatch({type: PasswordsAppActionType.FILTER_SEARCH_UPDATE, data: event.target.value})
	}
	const onFilterCheckBoxChange = (propName: string) => (_event: React.MouseEvent<HTMLDivElement>) => {
		let updatedFilter: FilterObject = {...state.filter.options}
		switch (propName) {
			case "site":
				updatedFilter.site = !updatedFilter.site
				break;
			case "email":
				updatedFilter.email = !updatedFilter.email
				break;
			case "username":
				updatedFilter.username = !updatedFilter.username
				break;
			case "password":
				updatedFilter.password = !updatedFilter.password
				break;
			case "active":
				updatedFilter.active = !updatedFilter.active
				break;
			case "matchcase":
				updatedFilter.matchcase = !updatedFilter.matchcase
				break;
		}

		dispatch({type: PasswordsAppActionType.FILTER_CHECKBOXES_UPDATE, data: updatedFilter})
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
			element = <>
				<div className="Filter">
					<div className="input">
						<span className="inputWrapper">
							<label htmlFor="filter"><FontAwesomeIcon icon={faFilter} size="1x" /></label>
							<input type="text" autoFocus value={state.filter.search} onChange={onFilterInputChange} name="filter" id="filter" placeholder="Filter" />
						</span>
					</div>
					<div className="checkbox" onClick={onFilterCheckBoxChange("active")}>
						<FontAwesomeIcon icon={state.filter.options.active ? faSquareCheck : faSquare} size="lg" color={"#0E9594"}/>
						<label>Filter</label>
					</div>
					<div className="checkbox" onClick={onFilterCheckBoxChange("matchcase")}>
						<FontAwesomeIcon icon={state.filter.options.matchcase ? faSquareCheck : faSquare} size="lg" color={"#0E9594"}/>
						<label htmlFor="matchcase">Case Sensitive</label>
					</div>
				</div>
				<div className="checkboxes">
					<div className="checkbox" onClick={onFilterCheckBoxChange("site")}>
						<FontAwesomeIcon icon={state.filter.options.site ? faSquareCheck : faSquare} size="lg" color={"#0E9594"}/>
						<label htmlFor="site">Site</label>
					</div>
					<div className="checkbox" onClick={onFilterCheckBoxChange("email")}>
						<FontAwesomeIcon icon={state.filter.options.email ? faSquareCheck : faSquare} size="lg" color={"#0E9594"}/>
						<label htmlFor="email">Email</label>
					</div>
					<div className="checkbox" onClick={onFilterCheckBoxChange("username")}>
						<FontAwesomeIcon icon={state.filter.options.username ? faSquareCheck : faSquare} size="lg" color={"#0E9594"}/>
						<label htmlFor="username">Username</label>
					</div>
				</div>
			</>
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
							{/* TODO: add options to choose from sites that already exist */}
						</span>
					</div>
					<div className={clsx("input")}>
						<span className={clsx("inputWrapper", { error: [ValidateError.emailFormat, ValidateError.emailLength].includes(state.bottomBar.error) })}>
							<label htmlFor="email"><FontAwesomeIcon icon={faEnvelope} size="1x" /></label>
							<input type="text" defaultValue={state.bottomBar.state === EBottomBarState.New ? state.bottomBar.data.new.email : state.bottomBar.data.edit.row?.email} /*onChange={onInputChangeTemplate("email")}*/ name="email" id="email" list="mails" placeholder="Email" />
							<datalist id="mails">
								{/*TODO: {props.mails.map(mail => <option key={Math.random()} value={mail} />)}*/}
							</datalist>
						</span>
					</div>
					<div className="input">
						<span className="inputWrapper">
							<label htmlFor="username"><FontAwesomeIcon icon={faUser} size="1x" /></label>
							<input type="text" defaultValue={state.bottomBar.state === EBottomBarState.New ? state.bottomBar.data.new.username : state.bottomBar.data.edit.row?.username} name="username" id="username" placeholder="Username" />
						</span>
					</div>
					<div className={clsx("input")}>
						<span className={clsx("inputWrapper", { error: ValidateError.password === state.bottomBar.error })}>
							<label htmlFor="password" className="password" onClick={() => setIsPassHidden(b => !b)}>{isPassHidden ? ICONS.passwordsComp.lock.closed : ICONS.passwordsComp.lock.open}</label>
							<input type={isPassHidden ? "password" : "text"} defaultValue={state.bottomBar.state === EBottomBarState.New ? state.bottomBar.data.new.password : state.bottomBar.data.edit.row?.password} name="password" id="password" placeholder="Password" />
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
				{(state.bottomBar.state === EBottomBarState.New || (state.bottomBar.state === EBottomBarState.Edit && state.bottomBar.data.edit.row?.uuid !== undefined)) &&
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
				}
				{(state.bottomBar.state === EBottomBarState.Filter) && 
					(<span className="button erase" onClick={buttonResetClick}>
						<span>Reset</span>
						<FontAwesomeIcon icon={faEraser} size="1x" />
					</span>)
				}
			</div>
		</>
		return element
	}

	return (
		<div className="PasswordsComponent">
			<PasswordsList rows={state.rows} filter={state.filter} dispatch={dispatch} canEditRef={canEditRef}/>
			<div className={clsx("bottomBar", { "closed": EBottomBarState.Closed ===  state.bottomBar.state})}>
				<div className="top-bar">
					<div className="button newButton" onClick={OpenBottomBar(PasswordsAppActionType.BB_OPEN_NEW)}>
						<span className="label">New</span> <FontAwesomeIcon icon={faPlus} size="sm" />
					</div>
					<div className="button editButton" onClick={OpenBottomBar(PasswordsAppActionType.BB_OPEN_EDIT)}>
						<span className="label">Edit</span> <FontAwesomeIcon icon={faPencil} size="sm" />
					</div>
					<div className="button filterButton" onClick={OpenBottomBar(PasswordsAppActionType.BB_OPEN_FILTER)}>
						<span className="label">Filter</span> <FontAwesomeIcon icon={faFilter} size="sm" />
					</div>
					{EBottomBarState.Closed !== state.bottomBar.state && state.bottomBar.error !== ValidateError.none && <div className="button disabled error">
						<FontAwesomeIcon icon={faExclamationTriangle} size="sm" />
						<p className="label">{state.bottomBar.error}</p>
					</div>}
				</div>

				<div className={clsx("bottom-bar")}>
					{bottomBarisOpen() && 
					<form ref={formRef} className={getBottomBarClassName()} onSubmit={(e) => {e.preventDefault();console.log("submitted")}}>
						{bottomBarContent()}
					</form>}
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