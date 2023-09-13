import { ValidateError } from "./consts"

export const validateNewRow = (data: NewRowData): ValidateError | NewRowData => {
	const { site, email, password, username } = data

	if (site.length <= 3) {
		return ValidateError.site
	} else if (email.length <= 3) {
		return ValidateError.emailLength
	} else if (!/(.+)@(.+){2,}\.(.+){2,}/.test(email)) {
		return ValidateError.emailFormat
	} else if (password.length <= 3) {
		return ValidateError.password
	} else {
		return data
	}
}