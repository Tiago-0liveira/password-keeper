declare global {

	interface SteamApiKey extends UUIDD {
		api_key: string
		checked: boolean
	}
	type SteamAppState = {
		users: WindowsSteamUserNumbered[]
		active: WindowsSteamUserNumbered
		windows_users: WindowsUser[]
		api_keys: SteamApiKey[]
	}
	type SteamProcess = {
		state: SteamUserState
		win_username: String
	}

}

export { };