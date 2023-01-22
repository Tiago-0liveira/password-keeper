import React, { useState, useEffect } from "react"
import RowComponent from "../Row"
import { ipcRenderer } from "electron"

export interface RowListProps {
	rows: Row[]
	filter: Filter
	//setModalData: React.Dispatch<React.SetStateAction<ModalData>>
}

const RowList: React.FC<RowListProps> = (props) => {
	const [data, setData] = useState<Row[]>([])

	useEffect(() => {
		let cleanData = props.rows
		if (props.filter.active) {
			cleanData = cleanData.filter(row =>
				row.site.toLowerCase().includes(props.filter.data.site) ||
				row.username?.toLowerCase().includes(props.filter.data.username) ||
				row.email.toLowerCase().includes(props.filter.data.email) ||
				row.password.toLowerCase().includes(props.filter.data.password)
			)
		}
		if (props.filter.search) {
			cleanData = cleanData.filter(row =>
				row.site.toLowerCase().includes(props.filter.data.site) ||
				row.username?.toLowerCase().includes(props.filter.data.username) ||
				row.email.toLowerCase().includes(props.filter.data.email)
			)
		}
		setData(cleanData)
	}, [props])

	const handleUpdate = (row: Row) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault()
		
		//props.setModalData({active:true, updating:true, updateData:row})
	}
	const handleDelete = (row: Row) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault()
		console.log(row.uuid)
		window.electronAPI.deleteRow(row.uuid).then(r => {
			//console.log(`deleted ${JSON.stringify(row)}|${r}`)
			setData(prev => prev.filter(r => r.uuid !== row.uuid))
		}).catch((e) => { console.log(`error deleting row id:${row.uuid}|e=`, e) })
	}

	return (
		<>
			{/*props.rows*/

				/*.sort((a, b) => a.site.localeCompare(b.site) ||
				a.email.localeCompare(b.email) ||
				a.username?.localeCompare(b.username)
					)*//*.filter(row =>
                        row.site.toLowerCase().includes(props.filter) ||
                        row.username?.toLowerCase().includes(props.filter)
						//row.email.toLowerCase().includes(props.filter) ||
					)*/data.map(row => <RowComponent
				key={`${row.uuid}${Math.random().toFixed(4)}`}
				row={row}
				handleUpdate={handleUpdate}
				handleDelete={handleDelete}
			//hidden={!row.site.toLowerCase().includes(props.filter) && !row.username?.toLowerCase().includes(props.filter)}
			/>
			)}
		</>
	)
}

export default React.memo(RowList)