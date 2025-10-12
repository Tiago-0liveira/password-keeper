import { invoke } from "@tauri-apps/api/core"

export const getSecrets = (): Promise<Secret[]> => {
	return invoke<Secret[]>("secrets_get_all_rows")
}

export const insertOne = (secret: Secret): Promise<Secret> => {
	return invoke<Secret>("secrets_validate_and_insert", { secret })
}

export const deleteSecret = (uuid: Number): Promise<void> => {
	return invoke("secrets_delete", { uuid })
}

export const updateSecret = (secret: Secret): Promise<void> => {
	return invoke<void>("secrets_update", { secret })
}