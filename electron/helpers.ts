import { ValidateError } from "./consts"

export const validateNewRow = (data: Row): OptionValue<Row, ValidateError> => {
	const { site, email, password, username } = data

	if (site.length <= 3) {
		return {isValid: false, value: ValidateError.site}
	} else if (email.length <= 3) {
		return {isValid: false, value: ValidateError.emailLength}
	} else if (!/(.+)@(.+){2,}\.(.+){2,}/.test(email)) {
		return {isValid: false, value: ValidateError.emailFormat}
	} else if (password.length <= 3) {
		return {isValid: false, value: ValidateError.password}
	} else if (data.uuid !== undefined && data.uuid < 0) {
		return {isValid: false, value: ValidateError.invalidUuid}
	} else {
		return {isValid: true, value: data}
	}
}