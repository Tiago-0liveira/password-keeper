import React, { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons"
import "./styles.scss"
import { ipcRenderer, remote } from "electron"
import type { Row } from "../../../types"
import Modal from "../../Modal"
import RowComponent from "../../Row"
import SearchBox from "../../SearchBox"
import CardComponent from "../../Card"
export type PasswordsComponentProps = {
	setExtraLabel: React.Dispatch<React.SetStateAction<string>>
}

const PasswordsComponent: React.FC<PasswordsComponentProps> = (props) => {
	const [data, setData] = useState<Row[]>([])
	const [isModalActive, setIsModalActive] = useState(false)
	const [updateModalData, setUpdateModalData] = useState<Row>()
	const [isModalUpdateData, setIsModalUpdateData] = useState(false)
	const [isSearchBoxOpen, setSearchBoxOpen] = useState(false)
	const [filter, setFilter] = useState("")
	const [switchValue, setSwitchValue] = useState(false)

	useEffect(() => {
		props.setExtraLabel(!switchValue ? "Row" : "Card")
	}, [switchValue]);

	const responseGetRowsListener = (_event: Electron.IpcRendererEvent, data: Row[]) => {
		setData(data)
	}
	const responseNewRowListener = (_event: Electron.IpcRendererEvent, row: Row) => {
		setData(beforeData => [...beforeData, row])
	}
	const responseDeleteRowListener = (_event: Electron.IpcRendererEvent, data: { uuid: number }) => {
		setData(beforeData => beforeData.filter(v => v.uuid != data.uuid))
	}
	const responseUpdateRowListener = (_event: Electron.IpcRendererEvent, row: Row) => {
		setData(b => [...b.filter(v => v.uuid != row.uuid), row])
	}

	const handleNewRow = () => { setIsModalActive(true) }
	const handleSearchButton = () => { setSearchBoxOpen(true) }
	const handleClearSearchFilterButton = () => { setFilter("") }
	const toggleSearch = () => { setSearchBoxOpen(b => !b) }
	const handleUpdate = (row: Row) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault()
		setUpdateModalData(row)
		setIsModalUpdateData(true)
		setIsModalActive(true)
	}
	const handleDelete = (row: Row) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault()
		ipcRenderer.send("requestDeleteRow", { uuid: row.uuid })
	}

	const handleCtrlF = toggleSearch
	const handleCtrlPlus = handleNewRow
	useEffect(() => {
		ipcRenderer.send("requestGetRows")
		ipcRenderer.on("responseGetRows", responseGetRowsListener)
		ipcRenderer.on("responseNewRow", responseNewRowListener)
		ipcRenderer.on("responseDeleteRow", responseDeleteRowListener)
		ipcRenderer.on("responseUpdateRow", responseUpdateRowListener)
		remote.globalShortcut.register("Ctrl+F", handleCtrlF)
		remote.globalShortcut.register("Ctrl+PLUS", handleCtrlPlus)
		return () => {
			ipcRenderer.removeListener("responseGetRows", responseGetRowsListener)
			ipcRenderer.removeListener("responseNewRow", responseNewRowListener)
			ipcRenderer.removeListener("responseDeleteRow", responseDeleteRowListener)
			ipcRenderer.removeListener("responseUpdateRow", responseUpdateRowListener)
			remote.globalShortcut.unregister("Ctrl+F")
			remote.globalShortcut.unregister("Ctrl+PLUS")
		}
	}, [])

	return (
		<div className="PasswordsComponent">
			<label className="switch" >
				<input type="checkbox" onClick={(e) => setSwitchValue(b => !b)} />
				<span className="slider round" >
					<span className={!switchValue ? "r" : "c"}>{!switchValue ? "Row" : "Card"}</span>
				</span>
			</label>
			{!switchValue ?
				<>
					<div className="Rows-header">
						<div><span>Site</span></div>
						<div><span>Email</span></div>
						<div><span>Username</span></div>
						<div><span>Password</span></div>
					</div><div className="Rows">
						{data.sort((a, b) => a.site.localeCompare(b.site) ||
							a.email.localeCompare(b.email) ||
							a.username.localeCompare(b.username)).filter(row => row.site.toLowerCase().includes(filter) ||
								row.email.toLowerCase().includes(filter) ||
								row.username?.toLowerCase().includes(filter)).map(row => <RowComponent
									key={`${row.uuid}${Math.random().toFixed(4)}`}
									row={row}
									handleUpdate={handleUpdate}
									handleDelete={handleDelete} />
								)}
					</div></> :
				<>
					<div className="Cards-header">
						<div><span>Site</span></div>
						<div><span>Email</span></div>
						<div><span>Username</span></div>
						<div><span>Password</span></div>
					</div>
					<div className="Cards">
						{data.sort((a, b) =>
							a.site.localeCompare(b.site) ||
							a.email.localeCompare(b.email) ||
							a.username.localeCompare(b.username)).filter(row =>
								row.site.toLowerCase().includes(filter) ||
								row.email.toLowerCase().includes(filter) ||
								row.username?.toLowerCase().includes(filter)).map(row => (
									<CardComponent
										key={`${row.uuid}${Math.random().toFixed(4)}`}
										row={row}
										handleUpdate={handleUpdate}
										handleDelete={handleDelete} />
								))
						}
					</div>
				</>}
			<div className="newButton" onClick={handleNewRow}>
				<FontAwesomeIcon icon={faPlus} size="lg" />
			</div>
			<div className="searchButton" onClick={handleSearchButton}>
				<FontAwesomeIcon icon={faSearch} size="lg" />
			</div>
			{filter.length > 0 &&
				<div className="clearSearchFilterButton" onClick={handleClearSearchFilterButton}>
					<FontAwesomeIcon icon={faTimes} size="lg" />
				</div>}
			<Modal active={isModalActive} setActive={setIsModalActive} update={isModalUpdateData} updateData={updateModalData} setUpdate={setIsModalUpdateData} setUpdateData={setUpdateModalData} />
			{isSearchBoxOpen && <SearchBox isOpen={isSearchBoxOpen} setFilter={setFilter} setIsOpen={setSearchBoxOpen} filter={filter} />}
		</div>
	)
}


export default {
	label: "Password Vault",
	component: PasswordsComponent,
	extraLabel: true
}