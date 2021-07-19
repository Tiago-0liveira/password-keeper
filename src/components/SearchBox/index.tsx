import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import clsx from "clsx"
import { remote } from "electron"
import React, { useEffect } from "react"
import "./styles.scss"

export type SearchBoxProps = {
	setFilter: React.Dispatch<React.SetStateAction<string>>
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
	isOpen: boolean
	filter: string
}

const SearchBox: React.FC<SearchBoxProps> = (props) => {
	useEffect(() => {
		remote.globalShortcut.register("Escape", () => {
			props.setIsOpen(false)
		})
		return () => {
			remote.globalShortcut.unregister("Escape")
		};
	}, []);
	return (
		<div className={clsx("SearchBoxWrapper", { active: props.isOpen })}>
			<div className="SearchBox">
				<input type="text" autoFocus value={props.filter} placeholder="Filter" onChange={(e) => props.setFilter(e.target.value)} />
				<span><FontAwesomeIcon onClick={() => { props.setIsOpen(false) }} icon={faTimes} className="TimesIcon" size="lg" /></span>
			</div>
		</div>
	)
}

export default SearchBox