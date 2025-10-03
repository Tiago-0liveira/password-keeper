declare global {
	type PasswordsContext = {
		data: Row[],
		add: (data: Row) => void,
		remove: (uuid: number) => void
	}

	interface Row extends NewRowData, UUIDD { }

	type Data = ArrayOrSingle<Row>
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
	type TnewRow = (data: NewRowData) => Promise<Row>
	type TDeleteRow = (data: UUIDD) => Promise<UUIDD>
	type TUpdateRow = (data: Row) => Promise<Row>

	type FilterObject = {
		site: boolean
		email: boolean
		username: boolean
		password: boolean
		matchcase: boolean
		active: boolean
	}
	type Filter = {
		options: FilterObject
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

	type cancelableEdit = {
		row: Row,
		cancelCallback: () => void
	}

	type BottomBarState = {
		state: EBottomBarState
		error: ValidateError
		data: {
			new: NewRowData,
			edit: cancelableEdit,
		}
	}

	type PasswordAppState = {
		rows: Row[],
		filter: Filter,
		//eventually sort: Sort
		bottomBar: BottomBarState
	}
	
}

export { };