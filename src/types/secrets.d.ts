declare global {

	interface Secret extends UUIDD {
		name: string,
		secret: string,
	}

}

export { };