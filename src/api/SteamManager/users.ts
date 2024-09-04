import { ValidateError } from "@src/enums"
import { invoke } from "@tauri-apps/api/core"

export const getSteamUsers = (): Promise<WindowsSteamUser[]> => {
	return invoke<WindowsSteamUser[]>("steam_users_get_all_rows")
}

export const getOne = (uuid: Number): Promise<WindowsSteamUser | null> => {
	return invoke<WindowsSteamUser | null>("steam_users_get_one", { uuid })
}

export const insertOne = (steam_id: String, windows_name: String): Promise<WindowsSteamUserNumbered | ValidateError> => {
	return invoke<WindowsSteamUserNumbered | ValidateError>("steam_users_validate_and_insert", { user: {
		uuid: -1,
		steam_id,
		windows_name,
		steam_name: "",
		avatar_path: "",
		last_fetch: -1
	}})
}

export const deleteSteamUser = (uuid: Number): Promise<void | ValidateError> => {
	return invoke("steam_users_delete", { uuid })
}
