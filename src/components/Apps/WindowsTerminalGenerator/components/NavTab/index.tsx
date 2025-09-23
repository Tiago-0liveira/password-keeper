import clsx from "clsx"
import "./styles.scss"
import ICONS from "@components/Icons"
import React from "react"

export type NavTitleUpdateFunc = (tabId: string, newTitle: string) => void

export type NavTabComponentProps = {
	name: string
	create?: boolean
	onCreate: () => void,
	onDelete?: (tabId: string) => void
	onClick?: () => void
	id: string
	selected: boolean
	disabled: boolean
	updateTitle: NavTitleUpdateFunc
}

const NavTabComponent: React.FC<NavTabComponentProps> = ({ name, create, selected, onCreate, onDelete, onClick, id, updateTitle }) => {
	const onKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
		if (e.key === "Enter") {
			e.preventDefault() // prevent react from creating <br/>
			e.currentTarget.blur() // trigger focus out and the save
		}
	}

	const onSpanInputChange = (e: React.FormEvent<HTMLSpanElement>) => {
		const el = e.target as HTMLSpanElement
		console.log(el.textContent)
		updateTitle(id, el.textContent)
	}

	return (
		<div className={clsx("windows-terminal-nav-tab", { create, selected })} onClick={onClick}>
			{create ?
				<>
					<span onClick={onCreate}>{ICONS.wtsetupgen.tab.create}</span>
				</>
				:
				<>
					<span className="tab-name" suppressContentEditableWarning contentEditable={true} onKeyDown={onKeyDown} onBlur={onSpanInputChange}>{name}</span>
					<span onClick={(e) => {
						e.stopPropagation()
						onDelete && onDelete(id)
					}}>{ICONS.wtsetupgen.tab.delete}</span>
				</>
			}
		</div>
	)
}

export default React.memo(NavTabComponent)