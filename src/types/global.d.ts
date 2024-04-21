import type React from "react";
import { ActionType, EBottomBarState, ValidateError } from "enums";

export interface IElectronAPI {
	getRows: (query: string, sort: boolean) => Promise<Row[]>,
	newRow: (data: NewRowData) => Promise<Row>,
	deleteRow: (uuid: number) => Promise<Row>,
	updateRow: (row: Row) => Promise<Row>,
	steamActiveUser: () => Promise<WindowsProcess>,
	steamChangeUser: (username: string) => Promise<void>,
	steamShutdown: () => Promise<void>,
	validateNewRow: (row: NewRowData) => Promise<ValidateError | NewRowData>,
	validateAndNewRow: (row: NewRowData) => Promise<OptionValue<Row, ValidateError>>,
	validateAndUpdateRow: (row: Row) => Promise<OptionValue<Row, ValidateError>>,
	closeApp: () => void,
	minimizeApp: () => void,
	toggleFullscreenApp: () => void,
}


declare module "*.svg" {
	const content: string;
	export default content;
}

declare global {
	interface Window {
		electronAPI: IElectronAPI
	}
	type PasswordsContext = {
		data: Row[],
		add: (data: Row) => void,
		remove: (uuid: number) => void
	}
	interface Row extends NewRowData {
		uuid: number
	}

	type FilterObject = {
		site: string
		email: string
		username: string
		password: string
	}
	type Filter = {
		active: boolean
		data: FilterObject
		search: string
	}
	type ModalData = {
		active: boolean,
		updateData: Row | undefined,
		updating: boolean
	}
	type DataToDataLists = {
		sites: string[]
		mails: string[]
		usernames: string[]
	}
	type AppBaseProps = {
		setExtraLabel: React.Dispatch<React.SetStateAction<string>>
	}
	type App = {
		label: string
		component: React.FC<AppBaseProps>
		extraLabel: boolean
		sidebarBottom?: boolean
		icon?: JSX.Element
	}
	type Data = Row[] | Row
	type NewRowData = {
		site: string,
		email: string,
		password: string,
		username: string,
	}
	type GetRowsData = {
		query: string,
		sort: boolean
	}
	type PossibleData = null | Data
	type DataOrError = { data: Data, error: null } | { data: null, error: { error: string } }
	type TgetRows = (query: string, sort: boolean) => Promise<Row[]>
	type TnewRow = (data: NewRowData) => Promise<void>
	type TDeleteRow = (data: { uuid: number }) => Promise<{ uuid: number }>
	type TUpdateRow = (data: Row) => Promise<Row>
	type WindowsProcess = {
		running: boolean,
		PID?: number,
		USERNAME?: string
	}
	type WindowsRunningProcess = {
		running: boolean,
		PID: number,
		USERNAME: string
	}

	type cancelableEdit = {
		row: Row,
		cancelCallback: () => void
	}

	type BottomBarState = {
		state: EBottomBarState
		error: ValidateError
		data: {
			new: NewRowData,
			edit: cancelableEdit,
		}
	}

	type PasswordAppState = {
		rows: Row[],
		//filter: Filter,
		//eventually sort: Sort
		bottomBar: BottomBarState
	}
	/* TODO: make this types A_... to a clean interface that inherits types and extends it */

	type A_INITIAL_LOAD = {
		type: ActionType.INITIAL_LOAD,
		data: Row[]
	}
	type A_NEW = {
		type: ActionType.NEW,
		data: Row
	}
	type A_DELETE = {
		type: ActionType.DELETE,
		data: { uuid: number }
	}
	type A_UPDATE_NEW_DATA = {
		type: ActionType.UPDATE_NEW_DATA
		data: NewRowData
	}
	type A_UPDATE_EDIT_DATA = {
		type: ActionType.UPDATE_EDIT_DATA,
		data: Row
	}
	type A_EDIT = {
		type: ActionType.EDIT
		data: Row
	}
	type A_ENABLE_EDIT = {
		type: ActionType.ENABLE_EDIT,
		data: cancelableEdit
	}
	type A_CANCEL_EDIT = {
		type: ActionType.CANCEL_EDIT
	}
	type A_BB_OPEN_NEW = {
		type: ActionType.BB_OPEN_NEW
	}
	type A_BB_OPEN_EDIT = {
		type: ActionType.BB_OPEN_EDIT
	}
	type A_BB_OPEN_FILTER = {
		type: ActionType.BB_OPEN_FILTER
	}
	type A_BB_CLOSE = {
		type: ActionType.BB_CLOSE
	}
	type A_BB_ERASE_DATA = {
		type: ActionType.BB_ERASE_DATA
	}
	type A_SET_ERROR = {
		type: ActionType.SET_ERROR,
		data: ValidateError
	}
	type A_CLEAR_ERROR = {
		type: ActionType.CLEAR_ERROR
	}
	type Action = A_INITIAL_LOAD | A_NEW | A_DELETE | A_EDIT | A_UPDATE_NEW_DATA | A_UPDATE_EDIT_DATA | A_ENABLE_EDIT | A_CANCEL_EDIT | A_BB_OPEN_NEW | A_BB_OPEN_EDIT | A_BB_OPEN_FILTER | A_BB_CLOSE | A_BB_ERASE_DATA | A_SET_ERROR | A_CLEAR_ERROR

	type RowsContextT = {
		data: PasswordAppState,
		dispatch: React.Dispatch<Action>
	}

	type OptionValue<T, U> =
		{ isValid: true, value: T } |
		{ isValid: false,value: U }
}

/*export type TgetRow = (uuid: string, resolve: (value: Row | PromiseLike<Row>) => void, reject: (reason?: any) => void) => void*/
