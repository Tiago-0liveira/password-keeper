import { PasswordsAppActionType } from "@src/enums"

declare global {

	type RowsContextT = {
		data: PasswordAppState,
		dispatch: React.Dispatch<PasswordAppAction>
	}

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



}

export { };