import type { PasswordsComponentProps } from "./components/Apps/Passwords"

export type Row = {
	uuid: number
	site: string
	email: string
	password: string
	username: string
}

export type App = {
	label: string
	component: React.FC<PasswordsComponentProps>
	extraLabel: boolean
}
export type Data = Row[] | Row
export type Error = { error: string }
export type NewRowData = {
	site: string,
	email: string,
	password: string,
	username: string,
}
export type PossibleData = null | Data
export type DataOrError = { data: Data, error: null } | { data: null, error: Error }
export type TgetRows = () => Promise<Row[]>
export type TnewRow = (data: NewRowData) => Promise<void>
export type TDeleteRow = (data: { uuid: number }) => Promise<{ uuid: number }>
export type TUpdateRow = (data: { uuid: number, newRowData: NewRowData }) => Promise<Row>

/*export type TgetRow = (uuid: string, resolve: (value: Row | PromiseLike<Row>) => void, reject: (reason?: any) => void) => void*/
