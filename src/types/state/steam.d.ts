declare global {
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

}

export { };