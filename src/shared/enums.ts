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

export enum PasswordsAppActionType {
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

	BB_TOGGLE_NEW,
	BB_TOGGLE_FILTER,
	BB_TOGGLE_EDIT,

	BB_CLOSE,
	BB_ERASE_DATA,
	FILTER_SEARCH_UPDATE,
	FILTER_CHECKBOXES_UPDATE,
	FILTER_RESET,
	SET_ERROR,
	CLEAR_ERROR
}

export enum SteamAppActionType {
	INITIAL_LOAD,
	
	NEW,
	DELETE,
	EDIT,
	
	SET_RUNNING,
	SET_LAUNCHING,
	SET_STOPPED,

	API_KEY_UPDATE,
	API_KEY_SAVE,
	API_KEY_DELETE
}

export enum SteamUserState {
	Running,
	Stopped,
	Launching
}

/*export enum SteamGame {
	Cs2,
	RocketLeague,
	AmongUs,
	Satisfactory,
	ForzaHorizon5,
	NoMansSky,
	ScrapMechanic,
	RaimbowSixSiege,
	Aseprite,
	ArkSurivalEvolved,
	Unrailed,
	EscapeSimulator,
}*/