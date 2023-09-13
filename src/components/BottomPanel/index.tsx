import React, { useEffect, useRef, useState } from "react"
import "./styles.scss"
import ICONS from "../Icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faSearch, faFilter, faTimes, faGlobe, faLock, faUser, faEnvelope, faCheck, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"
import clsx from "clsx"
import { ValidateError } from "../../consts"

export interface BottomPanelProps {
	handleNewRow: (row: NewRowData) => void
	/*handleSearchButton: () => void*/
	filter: [string, React.Dispatch<React.SetStateAction<string>>]
	data: Row
	setData: React.Dispatch<React.SetStateAction<Row>>
	state: BottomBarState
	setState: React.Dispatch<React.SetStateAction<BottomBarState>>
}

export enum BottomBarState {
	Closed,
	New,
	Edit,
	Search,
	Filter
}

const BottomPanel: React.FC<BottomPanelProps> = ({state, setState, data, ...props}) => {
	const [closing, setClosing] = useState(false)
	const [searchOpen, setSearchOpen] = useState(false)
	const filterRef = useRef<HTMLInputElement>(null)
	const [error, setError] = useState<ValidateError>(ValidateError.none)

	const onInputChange = (e: any) => {
		props.filter[1](e.target.value)
	}

	const toggleSearchOpen = () => { setSearchOpen(b => !b) }
	const buttonSaveClick = () => {
		window.electronAPI.validateNewRow(data).then(validated => {
			console.log(`${validated} ${typeof validated}`)
			if ((validated as NewRowData).site === undefined) { /* HACK to check the validated type */
				setError(validated as ValidateError)
				console.log("invalid")
			} else {
				setError(ValidateError.none)
				console.log("valid data, new row:", data)
				props.handleNewRow(data)
			}
		})
	}
	const buttonEditClick = () => {
		window.electronAPI.updateRow(data.uuid, data).then((row) => {
			console.log(`updated row (uuid: ${row.uuid}):`, row)
		})
	}
	const onInputChangeTemplate = (s: string) => (e: any) => {
		props.setData(data => {return { ...data, [s]: e.target.value }})
	}

	const buttonCloseClick = () => {
		setState(BottomBarState.Closed)
	}
	useEffect(() => {
		if (state === BottomBarState.Closed) {
			setClosing(true)
			setTimeout(() => {
				setClosing(false)
			}, 300);
		}
	}, [state])

	useEffect(() => {
		if (searchOpen) {
			filterRef.current?.focus()
		}
	}, [searchOpen])

	return (
		<div className={clsx("bottomBar", { "closed": BottomBarState.Closed === state, "closing": closing })}>
			<div className="top-bar">
				<div className="button newButton" onClick={() => { setState(BottomBarState.New) }/*props.handleNewRow*/}>
					<span className="label">New</span> <FontAwesomeIcon icon={faPlus} size="sm" />
				</div>
				<div className="button searchButton" onClick={searchOpen ? () => { } : toggleSearchOpen}>
					<span className={clsx("label", { displayNone: searchOpen })}>Search</span>

					<span className={clsx("close", { displayNone: !searchOpen })} onClick={toggleSearchOpen}><FontAwesomeIcon icon={faTimes} size="sm" /></span>
					<input ref={filterRef} className={clsx("filter", { displayNone: !searchOpen })} value={props.filter[0]} onChange={onInputChange} placeholder="search" type="text" />

					<FontAwesomeIcon icon={faSearch} size="sm" />
				</div>
				<div className="button filterButton" onClick={() => { setState(BottomBarState.New) }/*openBottomBarFilter props.handleSearchButton*/}>
					<span className="label">Filter</span> <FontAwesomeIcon icon={faFilter} size="sm" />
				</div>
				{BottomBarState.Closed !== state && error !== ValidateError.none && <div className="button disabled error">
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
				{(state === BottomBarState.New || state === BottomBarState.Edit) && <form className={state === BottomBarState.New ? "new" : "edit"}>
					<div className={clsx("input")}>
						<span className={clsx("inputWrapper", { error: ValidateError.site === error })}>
							<label htmlFor="site"><FontAwesomeIcon icon={faGlobe} size="1x" /></label>
							<input defaultValue={data.site} onChange={onInputChangeTemplate("site")} type="text" id="site" placeholder="Site" />
						</span>
					</div>
					<div className={clsx("input")}>
						<span className={clsx("inputWrapper", { error: [ValidateError.emailFormat, ValidateError.emailLength].includes(error) })}>
							<label htmlFor="email"><FontAwesomeIcon icon={faEnvelope} size="1x" /></label>
							<input type="text" defaultValue={data.email} onChange={onInputChangeTemplate("email")} id="email" list="mails" placeholder="Email" />
							<datalist id="mails">
								{/*{props.mails.map(mail => <option key={Math.random()} value={mail} />)}*/}
							</datalist>
						</span>
					</div>
					<div className="input">
						<span className="inputWrapper">
							<label htmlFor="username"><FontAwesomeIcon icon={faUser} size="1x" /></label>
							<input type="text" defaultValue={data.username} onChange={onInputChangeTemplate("username")} id="username" placeholder="Username" />
						</span>
					</div>
					<div className={clsx("input")}>
						<span className={clsx("inputWrapper", { error: ValidateError.password === error })}>
							<label htmlFor="password"><FontAwesomeIcon icon={faLock} size="1x" /></label>
							<input type="text" defaultValue={data.password} onChange={onInputChangeTemplate("password")} id="password" placeholder="Password" />
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
							<span>{state === BottomBarState.New ? "Save" : "Edit"}</span>
							<FontAwesomeIcon icon={faCheck} size="1x" />
						</span>
					</span>
				</form>}
				{/* if state is Filter open the filter tab (we can filter by site, email and username*/}
				{state === BottomBarState.Filter && <form className="filter">
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
					<span className="button" onClick={() => setState(BottomBarState.Closed)}>Save</span>
				</form>}
			</div>
		</div>
	)
}

export default React.memo(BottomPanel)