import {ActionType, EBottomBarState, ValidateError} from "enums";
import { Reducer, useRef } from "react"

export const rowsDataReducer: Reducer<PasswordAppState, Action> = (state, action) => {
	switch (action.type) {
		case ActionType.INITIAL_LOAD: {
			return {
				...state,
				rows: action.data
			}
		}
		case ActionType.NEW: {
			return {
				...state,
				rows: [...state.rows, action.data],
				bottomBar: {
					...state.bottomBar,
					error: ValidateError.none
				}
			}
		}
		case ActionType.DELETE: {
			const deletedRow = window.electronAPI.deleteRow(action.data.uuid)
			if (deletedRow === undefined) return (state);
			return {
				...state,
				rows: state.rows.filter(row => row.uuid !== action.data.uuid)
			}
		}
		case ActionType.EDIT: {
			return {
				...state,
				rows: state.rows.map(row => row.uuid === action.data.uuid ? action.data : row),
				bottomBar: {
					...state.bottomBar,
					data: {
						...state.bottomBar.data,
						edit: rowsDataDefault.bottomBar.data.edit
					}
				}
			}
		}
		case ActionType.UPDATE_EDIT_DATA: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					data: {
						...state.bottomBar.data,
						edit: {
							...state.bottomBar.data.edit,
							row: action.data.uuid === -1 ? rowsDataDefault.bottomBar.data.edit.row : action.data
						}
					}
				}
			}
		}
		case ActionType.UPDATE_NEW_DATA: {
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
		case ActionType.ENABLE_EDIT: {
			let d = { ...state,
				bottomBar: {...state.bottomBar,
					state: EBottomBarState.Edit,
					data: { ...state.bottomBar.data,
						edit: action.data
					}
				}
			}
			/*if (d.bottomBar.canEditRef.current && d.bottomBar.canEditRef.current.value) {
				d.bottomBar.canEditRef.current.value = false
			}*/
			return d
		}
		case ActionType.CANCEL_EDIT: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					data: {
						...state.bottomBar.data,
						edit: rowsDataDefault.bottomBar.data.edit
					}
				}
			}
		}
		case ActionType.BB_OPEN_NEW: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					state: EBottomBarState.New
				}
			}
		}
		case ActionType.BB_OPEN_EDIT: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					state: EBottomBarState.Edit
				}
			}
		}
		case ActionType.BB_OPEN_FILTER: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					state: EBottomBarState.Filter
				}
			}
		}
		case ActionType.BB_CLOSE: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					state: EBottomBarState.Closed,
					error: ValidateError.none
				},
			}
		}
		case ActionType.BB_ERASE_DATA: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					data: state.bottomBar.state === EBottomBarState.Edit ? {
						...state.bottomBar.data,
						edit: rowsDataDefault.bottomBar.data.edit
					} : {
						...state.bottomBar.data,
						new: rowsDataDefault.bottomBar.data.new
					}
				}
			}
		}
		case ActionType.SET_ERROR: {
			return {
				...state,
				bottomBar: {
					...state.bottomBar,
					error: action.data
				}
			}
		}
		case ActionType.CLEAR_ERROR: {
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
		/*canEditRef: useRef({value: true}),*/
		data: {
			new: {site:"", email:"", password:"", username: ""} as NewRowData,
			edit: {
				cancelCallback: () => {},
				row: {} as Row
			} as cancelableEdit
		}
	}
}