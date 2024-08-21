import {PasswordsAppActionType, EBottomBarState, ValidateError} from "@shared/enums";
import { Reducer } from "react"

export const rowsDataReducer: Reducer<PasswordAppState, PasswordAppAction> = (state, action) => {
	switch (action.type) {
		case PasswordsAppActionType.INITIAL_LOAD: {
			return {
				...state,
				rows: action.data
			}
		}
		case PasswordsAppActionType.NEW: {
			return {
				...state,
				rows: [...state.rows, action.data],
				bottomBar: {
					...state.bottomBar,
					data: {
						new: {...rowsDataDefault.bottomBar.data.new},
						edit: state.bottomBar.data.edit
					},
					error: ValidateError.none
				}
			}
		}
		case PasswordsAppActionType.DELETE: {
			const deletedRow = window.electronAPI.apps.passwords.deleteRow(action.data.uuid)
			if (deletedRow === undefined) return (state);
			return {
				...state,
				rows: state.rows.filter(row => row.uuid !== action.data.uuid)
			}
		}
		case PasswordsAppActionType.EDIT: {
			return {
				...state,
				rows: state.rows.map(row => row.uuid === action.data.uuid ? action.data : row),
				bottomBar: {
					...state.bottomBar,
					data: {
						...state.bottomBar.data,
						edit: {...rowsDataDefault.bottomBar.data.edit}
					}
				}
			}
		}
		case PasswordsAppActionType.UPDATE_EDIT_DATA: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					data: {
						...state.bottomBar.data,
						edit: {
							...state.bottomBar.data.edit,
							row: {...(action.data.uuid === -1 ? rowsDataDefault.bottomBar.data.edit.row : action.data)}
						}
					}
				}
			}
		}
		case PasswordsAppActionType.UPDATE_NEW_DATA: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					data: {
						...state.bottomBar.data,
						new: action.data
					}
				}
			}
		}
		case PasswordsAppActionType.ENABLE_EDIT: {
			let d = { ...state,
				bottomBar: {...state.bottomBar,
					state: EBottomBarState.Edit,
					data: { ...state.bottomBar.data,
						edit: action.data
					}
				}
			}
			return d
		}
		case PasswordsAppActionType.CANCEL_EDIT: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					data: {
						...state.bottomBar.data,
						edit: {...rowsDataDefault.bottomBar.data.edit}
					}
				}
			}
		}
		case PasswordsAppActionType.BB_OPEN_NEW: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					state: EBottomBarState.New
				}
			}
		}
		case PasswordsAppActionType.BB_OPEN_EDIT: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					state: EBottomBarState.Edit
				}
			}
		}
		case PasswordsAppActionType.BB_OPEN_FILTER: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					state: EBottomBarState.Filter
				}
			}
		}
		case PasswordsAppActionType.BB_TOGGLE_NEW: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					state: state.bottomBar.state === EBottomBarState.New ? EBottomBarState.Closed : EBottomBarState.New
				}
			}
		}
		case PasswordsAppActionType.BB_TOGGLE_EDIT: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					state: state.bottomBar.state === EBottomBarState.Edit ? EBottomBarState.Closed : EBottomBarState.Edit
				}
			}
		}
		case PasswordsAppActionType.BB_TOGGLE_FILTER: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					state: state.bottomBar.state === EBottomBarState.Filter ? EBottomBarState.Closed : EBottomBarState.Filter
				}
			}
		}
		case PasswordsAppActionType.BB_CLOSE: {
			console.log("BB_CLOSE")
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					state: EBottomBarState.Closed,
					error: ValidateError.none
				},
			}
		}
		case PasswordsAppActionType.BB_ERASE_DATA: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					data: state.bottomBar.state === EBottomBarState.Edit ? {
						...state.bottomBar.data,
						edit: {...rowsDataDefault.bottomBar.data.edit}
					} : {
						...state.bottomBar.data,
						new: {
							...rowsDataDefault.bottomBar.data.new
						}
					}
				}
			}
		}
		case PasswordsAppActionType.FILTER_SEARCH_UPDATE: {
			return {
				...state,
				filter: {
					...state.filter,
					search: action.data
				}
			}
		}
		case PasswordsAppActionType.FILTER_CHECKBOXES_UPDATE: {
			return {
				...state,
				filter: {
					...state.filter,
					options: action.data
				}
			}
		}
		case PasswordsAppActionType.FILTER_RESET: {
			console.log("FILTER_RESET: ", rowsDataDefault.filter.search)
			return {
				...state,
				filter: rowsDataDefault.filter
			}
		}
		case PasswordsAppActionType.SET_ERROR: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					error: action.data
				}
			}
		}
		case PasswordsAppActionType.CLEAR_ERROR: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					error: ValidateError.none
				}
			}
		}					
		default: {
			throw Error('Unknown action: ' + action);
	  	}
	}
}

export const rowsDataDefault: PasswordAppState = {
	rows: [],
	bottomBar: {
		state: EBottomBarState.Closed,
		error: ValidateError.none,
		data: {
			new: {site:"", email:"", password:"", username: ""} as NewRowData,
			edit: {
				cancelCallback: () => {},
				row: {} as Row
			} as cancelableEdit
		}
	},
	filter: {
		search: "",
		options: {
			site: true,
			email: true,
			password: false,
			username: true,
			matchcase: false,
			active: true
		}
	}
}