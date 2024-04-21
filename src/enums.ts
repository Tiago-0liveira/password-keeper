export enum ValidateError {
	site = "Site name must be at least 3 characters long",
	emailLength = "Email must be at least 3 characters long",
	emailFormat = "Email must be a valid email address",
	password = "Password must be at least 3 characters long",
	rowSelect = "Cannot select more than 1 row to edit",
	none = ""
}

export enum EBottomBarState {
	Closed,
	New,
	Edit,
	Filter,
	LAST
}

export enum ActionType {
	INITIAL_LOAD,
	NEW,
	DELETE,
	EDIT,
	UPDATE_EDIT_DATA,
	UPDATE_NEW_DATA,
	ENABLE_EDIT,
	CANCEL_EDIT,
	BB_OPEN_NEW,
	BB_OPEN_EDIT,
	BB_OPEN_FILTER,
	BB_CLOSE,
	BB_ERASE_DATA,
	SET_ERROR,
	CLEAR_ERROR
}