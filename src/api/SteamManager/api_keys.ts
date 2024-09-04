import { ValidateError } from "@src/enums"
import { invoke } from "@tauri-apps/api/core"

export const getApiKeys = (): Promise<SteamApiKey[]> => {
	return invoke<SteamApiKey[]>("steam_api_keys_get_all_rows")
}

export const getOne = (uuid: Number): Promise<SteamApiKey | null> => {
	return invoke<SteamApiKey | null>("steam_api_keys_get_one", { uuid })
}

export const insertOne = (key: String): Promise<SteamApiKey> => {
	return invoke<SteamApiKey>("steam_api_keys_validate_and_insert", { key })
}

export const deleteApiKey = (uuid: Number): Promise<void | ValidateError> => {
	return invoke("steam_api_keys_delete", { uuid })
}
