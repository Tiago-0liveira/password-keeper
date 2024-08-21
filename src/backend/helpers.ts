import { ValidateError } from "@shared/enums"

export const validateNewRow = <T extends Row | NewRowData>(data: T): OptionValue<T, ValidateError> => {
	const { site, email, password, username } = data

	if (site.length <= 3) {
		return {success: false, value: ValidateError.site}
	} else if (email.length <= 3) {
		return {success: false, value: ValidateError.emailLength}
	} else if (!/(.+)@(.+){2,}\.(.+){2,}/.test(email)) {
		return {success: false, value: ValidateError.emailFormat}
	} else if (password.length <= 3) {
		return {success: false, value: ValidateError.password}
	} else {
		return {success: true, value: data}
	}
}