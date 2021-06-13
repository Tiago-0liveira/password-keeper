import React, { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import "./styles.scss"
import { Row } from "../../../../electron/database/generated/client"
import { ipcRenderer } from "electron"
import { DataOrError, PossibleData } from "../../../types"

export type PasswordsComponentProps = {

}

const PasswordsComponent: React.FC<PasswordsComponentProps> = (props) => {
	const [data, setData] = useState<Row[]>([])

	useEffect(() => {
		ipcRenderer.send("requestGetRows")
		ipcRenderer.on("responseGetRows", (event, data: DataOrError) => {
			console.log(data)
			if (data.error) {
				console.error(data.error)
			} else {	
				console.log(data.data)
				setData(data.data as Row[])
			}
		})
	}, [])

	return (
		<div className="PasswordsComponent">
			<div className="rows">
				{data.map(row => (
					<div className="row" key={`${row.uuid}${Math.random().toFixed(3)}`}>
						<div className="site">
							<span className="label"><b>Site: </b></span><br />
							<span className="value">{row.site}</span>
						</div>
						<div className="createdAt">
							<span className="label"><b>Created At: </b></span><br />
							<span className="value">{row.createdAt}</span>
						</div>
						<div className="email">
							<span className="label"><b>Email: </b></span><br />
							<span className="value">{row.email}</span>
						</div>
						<div className="password">
							<span className="label"><b>Password: </b></span><br />
							<span className="value">{row.password}</span>
						</div>
						{row.username && <div className="username">
							<span className="label"><b>Username: </b></span><br />
							<span className="value">{row.username}</span>
						</div>}
					</div>
				))}
			</div>
			<div className="newButton">
				<FontAwesomeIcon icon={faPlus} size="2x" />
			</div>
		</div>
	)
}


export default {
	label: "Password Vault",
	component: PasswordsComponent
}