import { faTimes } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import clsx from "clsx"
import Mousetrap from "mousetrap"
import React, { useEffect } from "react"
import "./styles.scss"

export type SearchBoxProps = {
	setFilter: React.Dispatch<React.SetStateAction<string>>
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
	isOpen: boolean
	filter: string
}

const SearchBox: React.FC<SearchBoxProps> = (props) => {
	const handleResetFilter = () => { props.setFilter("") }
	const handleClose = () => { props.setIsOpen(false) }
	const handleOutSideClick = (e: any) => {
		e.persist()
		e._targetInst.pendingProps.className?.includes("SearchBoxWrapper") && handleClose()
	}
	useEffect(() => {
		if (props.isOpen) {
			Mousetrap.bind("escape", handleClose)
		} else {
			Mousetrap.unbind("escape")
		}
		return () => {
			Mousetrap.unbind("escape")
		};
	}, [props.isOpen]);
	return (
		<div className={clsx("SearchBoxWrapper", { active: props.isOpen })} onClick={handleOutSideClick}>
			<div className="SearchBox">
				<input type="text" autoFocus value={props.filter} placeholder="Filter" onChange={(e) => props.setFilter(e.target.value)} />
				<span><FontAwesomeIcon icon={faTimes} onClick={handleResetFilter} className="TimesIcon" size="lg" /></span>
			</div>
			<div className="CloseIcon" onClick={handleClose}>
				<FontAwesomeIcon icon={faTimes} size="lg" />
			</div>
		</div>
	)
}

export default SearchBox