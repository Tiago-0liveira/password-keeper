import type React from "react";
import { PasswordsAppActionType, EBottomBarState, ValidateError, SteamUserState, SteamAppActionType } from "@shared/enums";

export interface IElectronAPI {
	apps: {
		passwords: {
			getRows: (query: string, sort: boolean) => Promise<Row[]>,
			newRow: (data: NewRowData) => Promise<Row>,
			deleteRow: (uuid: number) => Promise<Row>,
			updateRow: (row: Row) => Promise<Row>,

			validateNewRow: (row: NewRowData) => Promise<ValidateError | NewRowData>,
			validateAndNewRow: (row: NewRowData) => Promise<OptionValue<Row, ValidateError>>,
			validateAndUpdateRow: (row: Row) => Promise<OptionValue<Row, ValidateError>>,
		},
		steam: {
			steamGetUsers: () => Promise<SteamAppState>,
			steamAddUser: (user: WindowsSteamUser) => Promise<WindowsSteamUserNumbered>,
			steamDeleteUser: (uuid: number) => Promise<void>,
			steamUpdateUser: (user: WindowsSteamUserNumbered) => Promise<void>,
			steamActiveUser: () => Promise<WindowsProcess | WindowsRunningProcess>,
			steamChangeUser: (uuid: number) => Promise<WindowsRunningProcess>,
			steamShutdown: () => Promise<void>,

			getSteamApiKeys: () => Promise<string[]>,
			//addSteamApiKey: (apiKey: string) => Promise<void>,
			deleteSteamApiKey: (uuid: number) => Promise<void>,
			updateSteamApiKey: (uuid: number, apiKey: string) => Promise<void>,
			validateAndSaveApiKey: (apiKey: string) => Promise<OptionValue<SteamApiKey, Message>>,
			validateAndSaveSteamUser: (steam_id: string, windows_name: string) => Promise<OptionValue<WindowsSteamUserNumbered, Message>>,
		}
	}
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
		site: boolean
		email: boolean
		username: boolean
		password: boolean
		matchcase: boolean
		active: boolean
	}
	type Filter = {
		options: FilterObject
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
	type TnewRow = (data: NewRowData) => Promise<Row>
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
		filter: Filter,
		//eventually sort: Sort
		bottomBar: BottomBarState
	}
	/* TODO: make this types A_... to a clean interface that inherits types and extends it */

	type PA_A_INITIAL_LOAD = {
		type: PasswordsAppActionType.INITIAL_LOAD,
		data: Row[]
	}
	type PA_A_NEW = {
		type: PasswordsAppActionType.NEW,
		data: Row
	}
	type PA_A_DELETE = {
		type: PasswordsAppActionType.DELETE,
		data: { uuid: number }
	}
	type PA_A_UPDATE_NEW_DATA = {
		type: PasswordsAppActionType.UPDATE_NEW_DATA
		data: NewRowData
	}
	type PA_A_UPDATE_EDIT_DATA = {
		type: PasswordsAppActionType.UPDATE_EDIT_DATA,
		data: Row
	}
	type PA_A_EDIT = {
		type: PasswordsAppActionType.EDIT
		data: Row
	}
	type PA_A_ENABLE_EDIT = {
		type: PasswordsAppActionType.ENABLE_EDIT,
		data: cancelableEdit
	}
	type PA_A_CANCEL_EDIT = {
		type: PasswordsAppActionType.CANCEL_EDIT
	}
	type PA_A_BB_OPEN_NEW = {
		type: PasswordsAppActionType.BB_OPEN_NEW
	}
	type PA_A_BB_OPEN_EDIT = {
		type: PasswordsAppActionType.BB_OPEN_EDIT
	}
	type PA_A_BB_OPEN_FILTER = {
		type: PasswordsAppActionType.BB_OPEN_FILTER
	}
	type PA_A_BB_TOGGLE_NEW = {
		type: PasswordsAppActionType.BB_TOGGLE_NEW
	}
	type PA_A_BB_TOGGLE_EDIT = {
		type: PasswordsAppActionType.BB_TOGGLE_EDIT
	}
	type PA_A_BB_TOGGLE_FILTER = {
		type: PasswordsAppActionType.BB_TOGGLE_FILTER
	}
	type PA_A_BB_CLOSE = {
		type: PasswordsAppActionType.BB_CLOSE
	}
	type PA_A_BB_ERASE_DATA = {
		type: PasswordsAppActionType.BB_ERASE_DATA
	}
	type PA_A_SET_ERROR = {
		type: PasswordsAppActionType.SET_ERROR,
		data: ValidateError
	}
	type PA_A_FILTER_SEARCH_UPDATE = {
		type: PasswordsAppActionType.FILTER_SEARCH_UPDATE,
		data: string
	}
	type PA_A_FILTER_CHECKBOXES_UPDATE = {
		type: PasswordsAppActionType.FILTER_CHECKBOXES_UPDATE,
		data: FilterObject
	}
	type PA_A_FILTER_RESET = {
		type: PasswordsAppActionType.FILTER_RESET
	}
	type PA_A_CLEAR_ERROR = {
		type: PasswordsAppActionType.CLEAR_ERROR
	}
	
	type PasswordAppAction = PA_A_INITIAL_LOAD | PA_A_NEW | PA_A_DELETE | PA_A_EDIT | PA_A_UPDATE_NEW_DATA | PA_A_UPDATE_EDIT_DATA
		 | PA_A_ENABLE_EDIT | PA_A_CANCEL_EDIT | PA_A_BB_OPEN_NEW | PA_A_BB_OPEN_EDIT | PA_A_BB_OPEN_FILTER | PA_A_BB_TOGGLE_NEW | PA_A_BB_TOGGLE_EDIT | PA_A_BB_TOGGLE_FILTER
		 | PA_A_BB_CLOSE | PA_A_BB_ERASE_DATA | PA_A_SET_ERROR | PA_A_FILTER_SEARCH_UPDATE | PA_A_FILTER_CHECKBOXES_UPDATE | PA_A_FILTER_RESET | PA_A_CLEAR_ERROR

	type RowsContextT = {
		data: PasswordAppState,
		dispatch: React.Dispatch<PasswordAppAction>
	}

	
	/* TODO: Still has much to develop and add here
	- add STEAMID to the user so we can fetch avatar and name (maybe more things after)
	*/
	type WindowsSteamUser = {
		windows_name: string
		steam_name: string
		details: {
			steamID: string
			avatarPath: string
			lastFetch: number
		}
		state: SteamUserState
	}
	interface WindowsSteamUserNumbered extends WindowsSteamUser {
		uuid: number
	}
	type SteamUserDetails = {
		steamID: string
		avatarUrl: string
		nickname: string
	}
	type WindowsUser = {
		name: string
		in_use: boolean
	}
	type SteamApiKey = {
		uuid: number
		apiKey: string
		checked: boolean
	}
	type SteamAppState = {
		users: WindowsSteamUserNumbered[]
		active: WindowsSteamUserNumbered
		windows_users: WindowsUser[]
		apiKeys: SteamApiKey[]
	}
	type SA_A_INITIAL_LOAD = {
		type: SteamAppActionType.INITIAL_LOAD,
		data: SteamAppState
	}
	type SA_A_NEW = {
		type: SteamAppActionType.NEW,
		data: WindowsSteamUserNumbered
	}
	type SA_A_DELETE = {
		type: SteamAppActionType.DELETE,
		data: { uuid: number }
	}
	type SA_A_EDIT = {
		type: SteamAppActionType.EDIT,
		data: WindowsSteamUserNumbered
	}
	type SA_A_SET_RUNNING = {
		type: SteamAppActionType.SET_RUNNING,
		data: { uuid: number }
	}
	type SA_A_SET_LAUNCHING = {
		type: SteamAppActionType.SET_LAUNCHING,
		data: { uuid: number }
	}
	type SA_A_SET_STOPPED = {
		type: SteamAppActionType.SET_STOPPED
	}
	type SA_A_API_KEY_UPDATE = {
		type: SteamAppActionType.API_KEY_UPDATE,
		data: { index: number, value: string }
	}
	type SA_A_API_KEY_SAVE = {
		type: SteamAppActionType.API_KEY_SAVE,
		data: { index: number, key: SteamApiKey }
	}
	type SA_A_API_KEY_DELETE = {
		type: SteamAppActionType.API_KEY_DELETE,
		data: { uuid: number }
	}
	
	type SteamAppAction = SA_A_INITIAL_LOAD | SA_A_NEW | SA_A_DELETE | SA_A_EDIT | 
		SA_A_SET_RUNNING | SA_A_SET_LAUNCHING | SA_A_SET_STOPPED | SA_A_API_KEY_UPDATE |
		SA_A_API_KEY_SAVE | SA_A_API_KEY_DELETE

	type OptionValue<T, U> =
		{ success: true, value: T } |
		{ success: false,value: U }

	type Message = {
		message: string
	}

}

/*export type TgetRow = (uuid: string, resolve: (value: Row | PromiseLike<Row>) => void, reject: (reason?: any) => void) => void*/
