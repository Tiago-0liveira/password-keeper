import { SteamAppActionType, SteamUserState } from "@src/enums";
import { Reducer } from "react"

export const steamUsersReducer: Reducer<SteamAppState, SteamAppAction> = (state, action) => {
	switch (action.type) {
		case SteamAppActionType.INITIAL_LOAD: {
			return action.data
		}
		case SteamAppActionType.NEW: {
			const user = action.data
			return {
				...state,
				users: [...state.users, user],
				windows_users: state.windows_users.map(row => row.name === user.windows_name ? {...row, in_use: true} : row)
			}
		}
		case SteamAppActionType.DELETE: {
			const user = state.users.find(row => row.uuid === action.data.uuid)
			return {
				...state,
				users: state.users.filter(row => row.uuid !== action.data.uuid),
				active: state.active.uuid === action.data.uuid ? steamUsersDefault.active : state.active,
				windows_users: state.windows_users.map(row => row.name === user?.windows_name ? {...row, in_use: false} : row)
			}
		}
		case SteamAppActionType.EDIT: {
			return {
				...state,
				users: state.users.map(row => row.uuid === action.data.uuid ? action.data : row)
			}
		}
		case SteamAppActionType.SET_RUNNING: {
			const res = {...state}
			res.active.state = SteamUserState.Running
			return res
		}
		case SteamAppActionType.SET_LAUNCHING: {
			const res = {
				...state,
				active: state.users.find(row => row.uuid === action.data.uuid) as WindowsSteamUserNumbered
			}
			if (res.active)
				res.active.state = SteamUserState.Launching
			return res
		}
		case SteamAppActionType.SET_STOPPED: {
			const res = {...state}
			res.active.state = SteamUserState.Stopped
			res.active = steamUsersDefault.active
			return res
		}
		case SteamAppActionType.API_KEY_UPDATE: {
			return {
				...state,
				api_keys: state.api_keys.map((key, i) => i === action.data.index ? {...key, api_key:action.data.value.toUpperCase()} : key)
			}
		}
		case SteamAppActionType.API_KEY_SAVE: {
			return {
				...state,
				api_keys: state.api_keys.map((key, i) => i === action.data.index ? action.data.key : key)
			}
		}
		case SteamAppActionType.API_KEY_DELETE: {
			return {
				...state,
				api_keys: state.api_keys.map(key => key.uuid === action.data.uuid ? {uuid: -1, api_key: "", checked: false} : key)
			}
		}
		default: {
			throw Error('Unknown action: ' + action);
	  	}
	}
}

export const steamUsersDefault: SteamAppState = {
	users: [],
	active: {uuid: -1, windows_name: "", steam_name: "", state: SteamUserState.Stopped, steam_id: "", last_fetch: -1, avatar_path: ""},
	windows_users: [],
	api_keys: []
}