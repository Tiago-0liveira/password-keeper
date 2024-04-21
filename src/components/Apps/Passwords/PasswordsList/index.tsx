import React, { useCallback, useEffect } from 'react'
import { FixedSizeList as List } from "react-window";
import RowComponent from "components/Row"

interface PasswordsListProps {
	/*setRowActive: () => void*/
	rows: Row[],
	dispatch: React.Dispatch<Action>,
	canEditRef: React.RefObject<{ value: boolean }>
}

const PasswordsList: React.FC<PasswordsListProps> = (props) => {
	//const [data, setData] = React.useState<Row[]>([])
	const [filter, setFilter] = React.useState<Filter>({ active: false, data: {} as FilterObject, search: "" })

	const newRow = useCallback((row: NewRowData) => {
		window.electronAPI.newRow(row);
		fetchRows()
	}, [])
	const deleteRow = useCallback((id: number) => {
		window.electronAPI.deleteRow(id);
		//setData(prev => prev.filter((r) => r.uuid !== id))
		fetchRows()
	}, [])

	const handleUpdate = (row: Row) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault()
		/*setBottomPanelData(row)
		setBottomPanelState(BottomBarState.Closed) //biggest hack to trigger a re-render 
		setBottomPanelState(BottomBarState.Edit)*/
	}
	const handleDelete = (row: Row) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault()
		window.electronAPI.deleteRow(row.uuid)
		fetchRows()
	}

	const fetchRows = async () => {
		//setData(await window.electronAPI.getRows(filter.search, true))
	}

	useEffect(() => {
		fetchRows()
	}, [])

	return (
		<>
			<div className="Rows-header">
				<div className="Label"><span>Site</span></div>
				<div className="Label"><span>Email</span></div>
				<div className="Label"><span>Username</span></div>
				<div className="Label"><span>Password</span></div>
			</div>
			<div className="Rows">
				{props.rows.map((row) =>
					<RowComponent
						/*style={style}*/
						key={`${row.uuid}`}
						row={row}
						dispatch={props.dispatch}
						canEditRef={props.canEditRef}
					/>
				)}
			</div>
			{/*			<List
				className="Rows"
				width={"100%"}
				height={1000}
				itemCount={props.rows.length}
				itemSize={45}
			>
				{({ index, style }) => {
					const row = props.rows[index]
					return (
						<RowComponent
							style={style}
							key={`${row.uuid}`}
							row={row}
							dispatch={props.dispatch}
						/>
					)
				}}
			</List>*/}
		</>
	)
}

export default React.memo(PasswordsList)