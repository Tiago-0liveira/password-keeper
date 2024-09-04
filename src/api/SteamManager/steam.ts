import { invoke } from "@tauri-apps/api/core";

export const getInitLoad = (): Promise<SteamAppState> => {
	return invoke("steam_get_initial_load")
}

export const launch_steam_as = (user: String): Promise<SteamProcess> => {
	return invoke("steam_launch_as", {user})
}

export const shutdown_steam = (): Promise<void> => {
	return invoke("steam_shutdown")
}