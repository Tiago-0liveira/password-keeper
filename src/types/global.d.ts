import type React from "react";
import type { PasswordsComponentProps } from "../components/Apps/Passwords";

declare global {
    type Row = {
        uuid: number
        site: string
        email: string
        password: string
        username: string
    }
    type Filter = string
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
    }
    type Data = Row[] | Row
    type NewRowData = {
        site: string,
        email: string,
        password: string,
        username: string,
    }
    type PossibleData = null | Data
    type DataOrError = { data: Data, error: null } | { data: null, error: { error: string } }
    type TgetRows = () => Promise<Row[]>
    type TnewRow = (data: NewRowData) => Promise<void>
    type TDeleteRow = (data: { uuid: number }) => Promise<{ uuid: number }>
    type TUpdateRow = (data: { uuid: number, newRowData: NewRowData }) => Promise<Row>
    type WindowsProcess = {
        running: boolean,
        PID?: number,
        USERNAME?: string
    }
}

/*export type TgetRow = (uuid: string, resolve: (value: Row | PromiseLike<Row>) => void, reject: (reason?: any) => void) => void*/
