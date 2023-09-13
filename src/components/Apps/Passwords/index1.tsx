import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFilter, faPlus, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons"
import "./styles.scss"
import { ipcRenderer } from "electron"
import Modal from "../../Modal"
import SearchBox from "../../SearchBox"
import CardComponent from "../../Card"
import mousetrap from "mousetrap"
import RowList from "../../RowList"
import BottomPanel, { BottomBarState } from "../../BottomPanel"
import RowComponent from "../../Row"
import { FixedSizeList as List } from "react-window";

export type PasswordsComponentProps = {
	setExtraLabel: React.Dispatch<React.SetStateAction<string>>
}

/*export type BottomContext = {
	data: Row
	state: BottomBarState
	updateData: (data: Row) => void
	updateState: (state: BottomBarState) => void
}

const Context = React.createContext<BottomContext>()
*/

const PasswordsComponent: React.FC<PasswordsComponentProps> = (props) => {
	const [data, setData] = useState<Row[]>([])
	const [isSearchBoxOpen, setSearchBoxOpen] = useState(false)
	const [filter, setFilter] = useState("")
	const [filterActive, setFilterActive] = useState(false)
	const [filterValue, setFilterValue] = useState<FilterObject>({ site: "", email: "", username: "", password: "" })
	const [bottomPanelData, setBottomPanelData] = useState<Row>({ site: "", email: "", username: "", password: "" } as Row)
	const [bottomPanelState, setBottomPanelState] = useState<BottomBarState>(BottomBarState.New)

	const newRow = useCallback((row: Row) => {
		window.electronAPI.newRow(row);
		setData(prev => [...prev, row])
	}, [])
	const deleteRow = useCallback((id: number) => {
		window.electronAPI.deleteRow(id);
		setData(prev => prev.filter((r) => r.uuid !== id))
	}, [])
	//const [contextData, setContextData] = useState<PasswordsContext>({ data: [], add: newRow, remove: deleteRow })
	/*	const [modalData, setmodalData] = useState<ModalData>({
			active: false,
			updateData: undefined,
			updating: false
		})*/
	//const [switchValue, setSwitchValue] = useState(false)
	//const [dataforDataLists, setDataLists] = useState<DataToDataLists>({ sites: [], mails: [], usernames: [] })
	//const [search, setSearch] = useState(false)
	//const [switchValue, setSwitchValue] = useState(false)
	/*useEffect(() => {
		props.setExtraLabel(!switchValue ? "Row" : "Card")
	}, [switchValue]);*/
	/*useEffect(() => {
		console.log("ran")
		let time = Date.now()
		setDataLists({
			sites: Array.from(new Set(data.map((r: Row) => r.site))).sort(),
			mails: Array.from(new Set(data.map((r: Row) => r.email))).sort(),
			usernames: Array.from(new Set(data.map((r: Row) => r.username))).sort()
		})
		setData(data => data.sort((a, b) =>
			a.site.localeCompare(b.site) ||
			a.email.localeCompare(b.email) ||
			a.username?.localeCompare(b.username)
		))
		console.log(Date.now() - time)
	}, [data]);*/

	/*const handleNewRow = () => { setmodalData((prev) => {return {...prev,active:true}}) }*/
	//const handleClearSearchFilterButton = () => { setFilter("") }
	//const handleSearchFilter = () => { setSearch(b => !b) }
	const handleNewRow = (row: NewRowData) => { window.electronAPI.newRow(row) }
	const handleSearchButton = () => { setSearchBoxOpen(true) }
	const toggleSearch = () => { setSearchBoxOpen(b => !b) }
	const handleUpdate = (row: Row) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault()
		setBottomPanelData(row)
		setBottomPanelState(BottomBarState.Edit)
	}
	const handleDelete = (row: Row) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault()
		window.electronAPI.deleteRow(row.uuid)
	}

	//const handleCtrlF = toggleSearch
	/*const handleCtrlPlus = handleNewRow*/
	useEffect(() => {
		console.log("tau")
	});

	useEffect(() => {
		console.log("fetch")
		const fetchRows = async () => {
			setData(await window.electronAPI.getRows(filter, true))
		}
		fetchRows()
		//mousetrap.bind("ctrl+f", handleCtrlF)
		/*mousetrap.bind("ctrl+plus", handleCtrlPlus)*/
		/*return () => {
			ipcRenderer.removeListener("responseGetRows", responseGetRowsListener)
			ipcRenderer.removeListener("responseNewRow", responseNewRowListener)
			ipcRenderer.removeListener("responseDeleteRow", responseDeleteRowListener)
			ipcRenderer.removeListener("responseUpdateRow", responseUpdateRowListener)
			//mousetrap.unbind("ctrl+f")
			mousetrap.unbind("ctrl+plus")
		}*/
	}, [filter])

	return (
		<div className="PasswordsComponent">

			<div className="Rows-header">
				<div className="Label"><span>Site</span></div>
				<div className="Label"><span>Email</span></div>
				<div className="Label"><span>Username</span></div>
				<div className="Label"><span>Password</span></div>
				<div className="Label"><span></span></div>
			</div>
			<List
				className="Rows"
				width={"100%"}
				height={1500}
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

			<BottomPanel state={bottomPanelState} setState={setBottomPanelState} data={bottomPanelData} setData={setBottomPanelData} handleNewRow={handleNewRow} filter={[filter, setFilter]} /*handleSearchButton={handleSearchButton}*/ />
		</div>
	)
}


export default {
	label: "Password Vault",
	component: PasswordsComponent,
	extraLabel: false
}