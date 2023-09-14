import type React from "react";
import type { PasswordsComponentProps } from "../components/Apps/Passwords/index";
import { ValidateError } from "../consts";

export interface IElectronAPI {
    getRows: (query: string, sort: boolean) => Promise<Row[]>,
    newRow: (data: NewRowData) => Promise<Row>,
    deleteRow: (uuid: number) => Promise<Row>,
    updateRow: (uuid: number, newRowData: NewRowData) => Promise<Row>,
    steamActiveUser: () => Promise<WindowsProcess>,
    steamChangeUser: (username: string) => Promise<void>,
    steamShutdown: () => Promise<void>,
    validateNewRow: (row: NewRowData) => Promise<ValidateError | NewRowData>
}
declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
    type PasswordsContext = {
        data: Row[],
        add: (data: Row) => void,
        remove: (uuid: number) => void
    }
    interface Row extends NewRowData {
        uuid: number
    }

    type FilterObject = {
        site: string
        email: string
        username: string
        password: string
    }
    type Filter = {
        active: boolean
        data: FilterObject
        search: string
    }
    type ModalData = {
        active: boolean,
        updateData: Row | undefined,
        updating: boolean
    }
    type DataToDataLists = {
        sites: string[]
        mails: string[]
        usernames: string[]
    }
    type App = {
        label: string
        component: React.FC<PasswordsComponentProps>
        extraLabel: boolean
		sidebarBottom?: boolean
    }
    type Data = Row[] | Row
    type NewRowData = {
        site: string,
        email: string,
        password: string,
        username: string,
    }
    type GetRowsData = {
        query: string,
        sort: boolean
    }
    type PossibleData = null | Data
    type DataOrError = { data: Data, error: null } | { data: null, error: { error: string } }
    type TgetRows = (query: string, sort: boolean) => Promise<Row[]>
    type TnewRow = (data: NewRowData) => Promise<void>
    type TDeleteRow = (data: { uuid: number }) => Promise<{ uuid: number }>
    type TUpdateRow = (data: { uuid: number, newRowData: NewRowData }) => Promise<Row>
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
}

/*export type TgetRow = (uuid: string, resolve: (value: Row | PromiseLike<Row>) => void, reject: (reason?: any) => void) => void*/
