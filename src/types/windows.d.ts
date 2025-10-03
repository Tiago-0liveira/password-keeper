declare global {


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

	type WindowsSteamUser = {
		steam_id: String,
		windows_name: String,
		steam_name: String,
		avatar_path: String,
		last_fetch: Number,
		state: SteamUserState
	}
	interface WindowsSteamUserNumbered extends WindowsSteamUser, UUIDD { }
	type WindowsUser = {
		name: string
		in_use: boolean
	}

	
}

export { };