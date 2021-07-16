import type { PasswordsComponentProps } from "./components/Apps/Passwords"
import type { Row } from "../electron/database/generated/client/index"

export type App = {
	label: string
	component: React.FC<PasswordsComponentProps>
}

export type Data = Row[] | Row
export type Error = { error: string }
export type NewRowData = {
	site: string,
	email: string,
	password: string,
	username: string | null,
}
export type PossibleData = null | Data
export type DataOrError = { data: Data, error: null } | { data: null, error: Error }
export type TgetRows = () => Promise<DataOrError>
export type TnewRow = (data: NewRowData) => Promise<DataOrError>
export type TDeleteRow = (data: { uuid: string }) => Promise<DataOrError>
export type TUpdateRow = (data: { uuid: string, newRowData: NewRowData }) => Promise<DataOrError>

/*export type Row = {
	uuid: string
	createdAt: string
	site: string
	email: string
	password: string
	username: string | null
}*/