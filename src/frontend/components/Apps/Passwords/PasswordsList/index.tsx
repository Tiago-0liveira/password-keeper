import React, { useCallback, useEffect } from 'react'
import { FixedSizeList as List } from "react-window";
import RowComponent from "@components/Row"

interface PasswordsListProps {
	rows: Row[],
	dispatch: React.Dispatch<PasswordAppAction>,
	canEditRef: React.RefObject<{ value: boolean }>,
	filter: Filter
}

const PasswordsList: React.FC<PasswordsListProps> = (props) => {
	const filtered = useCallback(
		() => {
			if (!props.filter.options.active) return props.rows
			return props.rows.filter((row) => {
				if (props.filter.search === "") return true
				let toMatch = []

				if (props.filter.options.email) toMatch.push(row.email)
				if (props.filter.options.site) toMatch.push(row.site)
				if (row.username && props.filter.options.username) toMatch.push(row.username)
				if (props.filter.options.password) toMatch.push(row.password)
				
				if (props.filter.options.matchcase) {
					return toMatch.some((v) => v.includes(props.filter.search))
				}
				return toMatch.some((v) => v.toLowerCase().includes(props.filter.search.toLowerCase()))
			})
		},
	  [props.filter, props.rows],
	)

	return (
		<>
			<div className="Rows-header">
				<div className="Label"><span>Site</span></div>
				<div className="Label"><span>Email</span></div>
				<div className="Label"><span>Username</span></div>
				<div className="Label"><span>Password</span></div>
			</div>
			<div className="Rows">
				{filtered().map((row) =>
					<RowComponent
						key={row.uuid}
						row={row}
						dispatch={props.dispatch}
						canEditRef={props.canEditRef}
					/>
				)}
			</div>
		</>
	)
}

export default React.memo(PasswordsList)