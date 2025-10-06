declare global {

	interface Secret extends UUIDD {
		name: String,
		secret: String,
	}

}

export { };