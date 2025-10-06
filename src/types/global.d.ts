import type React from "react";
import { PasswordsAppActionType, EBottomBarState, ValidateError, SteamUserState, SteamAppActionType } from "@src/enums";

declare module "*.svg" {
	const content: string;
	export default content;
}

declare global {
	type OptionValue<T, U> =
		{ success: true, value: T } |
		{ success: false, value: U }

	type ArrayOrSingle<T> = T[] | T

	type UUIDD = {
		uuid: number
	}

	type AppBaseProps = {
		setExtraLabel: React.Dispatch<React.SetStateAction<string>>
	}
	type App = {
		label: string
		component: React.FC<AppBaseProps>
		extraLabel: boolean
		sidebarBottom?: boolean
		icon?: JSX.Element
	}
	
}

/*export type TgetRow = (uuid: string, resolve: (value: Row | PromiseLike<Row>) => void, reject: (reason?: any) => void) => void*/
