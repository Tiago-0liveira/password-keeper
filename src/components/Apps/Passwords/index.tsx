import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFilter, faPlus, faSearch, faTimes, faGlobe, faLock, faUser, faEnvelope, faCheck, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"
import "./styles.scss"
import { ipcRenderer } from "electron"
import Modal from "../../Modal"
import SearchBox from "../../SearchBox"
import CardComponent from "../../Card"
import mousetrap from "mousetrap"
import RowList from "../../RowList"
/*import BottomPanel, { BottomBarState } from "../../BottomPanel"*/
import RowComponent from "../../Row"
import { FixedSizeList as List } from "react-window";
import clsx from "clsx"
import { ValidateError } from "../../../consts"
import ICONS from "../../Icons"

export type PasswordsComponentProps = {
	setExtraLabel: React.Dispatch<React.SetStateAction<string>>
}

enum BottomBarState {
	Closed,
	New,
	Edit,
	Search,
	Filter
}

const PasswordsComponent: React.FC<PasswordsComponentProps> = (props) => {
	const [data, setData] = useState<Row[]>([])
	const [filter, setFilter] = useState("")
	const [bottomPanelData, setBottomPanelData] = useState<NewRowData>({ site: "", email: "", username: "", password: "" } as NewRowData)
	const [bottomPanelState, setBottomPanelState] = useState<BottomBarState>(BottomBarState.New)

	const [searchOpen, setSearchOpen] = useState(false)
	const filterRef = useRef<HTMLInputElement>(null)
	const [error, setError] = useState<ValidateError>(ValidateError.none)
	const formRef = useRef<HTMLFormElement>(null)
	const [isPassHidden, setIsPassHidden] = useState(true)

	const newRow = useCallback((row: NewRowData) => {
		window.electronAPI.newRow(row);
		fetchRows()
	}, [])
	const deleteRow = useCallback((id: number) => {
		window.electronAPI.deleteRow(id);
		//setData(prev => prev.filter((r) => r.uuid !== id))
		fetchRows()
	}, [])

	/*const */

	const handleUpdate = (row: Row) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault()
		setBottomPanelData(row)
		setBottomPanelState(BottomBarState.Closed)/* biggest hack to trigger a re-render */
		setBottomPanelState(BottomBarState.Edit)
	}
	const handleDelete = (row: Row) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault()
		window.electronAPI.deleteRow(row.uuid)
		fetchRows()
	}

	const fetchRows = async () => {
		setData(await window.electronAPI.getRows(filter, true))
	}

	useEffect(() => {
		fetchRows()
	}, [filter])

	/*  */
	const toggleSearchOpen = () => { setSearchOpen(b => !b) }

	useEffect(() => {
		if (searchOpen) {
			filterRef.current?.focus()
		}
	}, [searchOpen])

	const onInputChange = (e: any) => {
		setFilter(e.target.value)
	}
	const saveInputData = () => {
		if (formRef === null) return
		if (formRef.current === null) return
		let formData = new FormData(formRef.current)
		let data: NewRowData = {
			site: formData.get("site") as string,
			email: formData.get("email") as string,
			username: formData.get("username") as string,
			password: formData.get("password") as string,
		}
		setBottomPanelData(data)

		return data
	}
	const buttonCloseClick = () => {
		saveInputData()
		setBottomPanelState(BottomBarState.Closed)
	}
	const buttonSaveClick = () => {
		let data = saveInputData()
		if (!data) { /* if data is null just use bottomPanelData but data should always be not null, just so it doesnt crash and makes js happy :) */
			data = bottomPanelData
		}
		window.electronAPI.validateNewRow(data).then(validated => {
			if ((validated as NewRowData).site === undefined) { /* HACK to check the validated type */
				setError(validated as ValidateError)
			} else {
				setError(ValidateError.none)
				newRow(data as NewRowData)
			}
		})
	}

	return (
		<div className="PasswordsComponent">

			<div className="Rows-header">
				<div className="Label"><span>Site</span></div>
				<div className="Label"><span>Email</span></div>
				<div className="Label"><span>Username</span></div>
				<div className="Label"><span>Password</span></div>
			</div>
			<List
				className="Rows"
				width={"100%"}
				height={1000}
				itemCount={data.length}
				itemSize={45}
			>
				{({ index, style }) => {
					const row = data[index]
					return (
						<RowComponent
							style={style}
							key={`${row.uuid}`}
							row={row}
							handleUpdate={handleUpdate}
							handleDelete={handleDelete}
						/>
					)
				}}
			</List>

			<div className={clsx("bottomBar", { "closed": BottomBarState.Closed === bottomPanelState })}>
				<div className="top-bar">
					<div className="button newButton" onClick={() => { setBottomPanelState(BottomBarState.New) }/*props.handleNewRow*/}>
						<span className="label">New</span> <FontAwesomeIcon icon={faPlus} size="sm" />
					</div>
					<div className="button searchButton" onClick={searchOpen ? () => { } : toggleSearchOpen}>
						<span className={clsx("label", { displayNone: searchOpen })}>Search</span>

						<span className={clsx("close", { displayNone: !searchOpen })} onClick={toggleSearchOpen}><FontAwesomeIcon icon={faTimes} size="sm" /></span>
						<input ref={filterRef} className={clsx("filter", { displayNone: !searchOpen })} value={filter} onChange={onInputChange} placeholder="search" type="text" />

						<FontAwesomeIcon icon={faSearch} size="sm" />
					</div>
					<div className="button filterButton" onClick={() => { /*setBottomPanelState(BottomBarState.Filter)*/ }/*openBottomBarFilter props.handleSearchButton*/}>
						<span className="label">Filter</span> <FontAwesomeIcon icon={faFilter} size="sm" />
					</div>
					{BottomBarState.Closed !== bottomPanelState && error !== ValidateError.none && <div className="button disabled error">
						<FontAwesomeIcon icon={faExclamationTriangle} size="sm" />
						<p className="label">{error}</p>
					</div>}
					{/*<div className="button filterToggle">
						<span className="label"><FontAwesomeIcon icon={faFilter} size="sm" /></span>
					</div>*/}
					{/*<label className="switch disabled" >  Currently disabled maybe removing cards ?? 
						<input type="checkbox" disabled onClick={(e) => props.Switch[1](b => !b)} />
						<span className="slider round" >
							<span className={!props.Switch[0] ? "r" : "c"}>{!props.Switch[0] ? "Row" : "Card"}</span>
						</span>
					</label>*/}
				</div>

				<div className={clsx("bottom-bar")}>

					{/* if state is New open the new tab (a row needs a site, email, username and a password)*/}
					{(bottomPanelState === BottomBarState.New || bottomPanelState === BottomBarState.Edit) && <form ref={formRef} className={bottomPanelState === BottomBarState.New ? "new" : "edit"}>
						<div className={clsx("input")}>
							<span className={clsx("inputWrapper", { error: ValidateError.site === error })}>
								<label htmlFor="site"><FontAwesomeIcon icon={faGlobe} size="1x" /></label>
								<input defaultValue={bottomPanelData.site} /*onChange={onInputChangeTemplate("site")}*/ type="text" name="site" id="site" placeholder="Site" />
							</span>
						</div>
						<div className={clsx("input")}>
							<span className={clsx("inputWrapper", { error: [ValidateError.emailFormat, ValidateError.emailLength].includes(error) })}>
								<label htmlFor="email"><FontAwesomeIcon icon={faEnvelope} size="1x" /></label>
								<input type="text" defaultValue={bottomPanelData.email} /*onChange={onInputChangeTemplate("email")}*/ name="email" id="email" list="mails" placeholder="Email" />
								<datalist id="mails">
									{/*{props.mails.map(mail => <option key={Math.random()} value={mail} />)}*/}
								</datalist>
							</span>
						</div>
						<div className="input">
							<span className="inputWrapper">
								<label htmlFor="username"><FontAwesomeIcon icon={faUser} size="1x" /></label>
								<input type="text" defaultValue={bottomPanelData.username} /*onChange={onInputChangeTemplate("username")}*/ name="username" id="username" placeholder="Username" />
							</span>
						</div>
						<div className={clsx("input")}>
							<span className={clsx("inputWrapper", { error: ValidateError.password === error })}>
								<label htmlFor="password"><FontAwesomeIcon icon={faLock} size="1x" /></label>
								<input type="text" defaultValue={bottomPanelData.password} /*onChange={onInputChangeTemplate("password")}*/ name="password" id="password" placeholder="Password" />
								<button className="eye" onClick={() => setIsPassHidden(b => !b)}>{isPassHidden ? ICONS.row.eye.on : ICONS.row.eye.off}</button>
							</span>
						</div>
						<span className="buttonwrapper close">
							<span className="button close" onClick={buttonCloseClick}>
								<span>Close</span>
								<FontAwesomeIcon icon={faTimes} size="1x" />
							</span>
						</span>
						<span className="buttonwrapper save">
							<span className="button save" onClick={buttonSaveClick}>
								<span>{bottomPanelState === BottomBarState.New ? "Save" : "Edit"}</span>
								<FontAwesomeIcon icon={faCheck} size="1x" />
							</span>
						</span>
					</form>}
					{/* if state is Filter open the filter tab (we can filter by site, email and username*/}
					{bottomPanelState === BottomBarState.Filter && <form className="filter">
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
					</form>}
				</div>
			</div>
		</div>
	)
}


export default {
	label: "Password Vault",
	component: PasswordsComponent,
	extraLabel: false
}