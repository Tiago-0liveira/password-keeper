import { ValidateError } from "@src/enums"
import { invoke } from "@tauri-apps/api/core"

export const getRows = (): Promise<Row[]> => {
	return invoke<Row[]>("password_vault_get_all_rows")
}

export const getOne = (uuid: Number): Promise<Row | null> => {
	return invoke<Row | null>("password_vault_get_one", { uuid })
}

export const insertOne = (newRow: NewRowData): Promise<Row | ValidateError> => {
	return invoke<Row | ValidateError>("password_vault_validate_and_insert", { user: {...newRow, uuid: -1} })
}

export const deleteRow = (uuid: Number): Promise<{}> => {
	return invoke("password_vault_delete", { uuid })
}

export const updateRow = (row: Row): Promise<Row | ValidateError> => {
	return invoke<Row | ValidateError>("password_vault_update", {user: row})
}