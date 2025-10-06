import { invoke } from "@tauri-apps/api/core"

export const getSecrets = (): Promise<Secret[]> => {
	return invoke<Secret[]>("secrets_get_all_rows")
}

export const insertOne = (name: string, secret: string): Promise<Secret> => {
	return invoke<Secret>("secrets_validate_and_insert", {
		uuid: -1,
		name, secret
	})
}

export const deleteSecret = (uuid: Number): Promise<void> => {
	return invoke("secrets_delete", { uuid })
}

export const updateSecret = (secret: Secret): Promise<void> => {
	return invoke<void>("secrets_update", { ...secret })
}