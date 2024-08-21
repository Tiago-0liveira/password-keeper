import { exec } from "child_process"

export const getWindowsUsers = () => new Promise<string[]>((resolve, reject) => {
	exec("wmic useraccount get name,sid", (err, stdout, stderr) => {
		if (err) reject(err)
		const lines = stdout.split("\r\r\n").slice(1)
		const users: string[] = []
		lines.forEach(line => {
			const splitted = line.split(/\s{2,}/)
			if (splitted.length !== 3) return
			const split2 = splitted[1].split("-")
			const number = Number(split2[split2.length-1])
			if (number > 1000) {
				users.push(splitted[0])
			}
		})
		resolve(users)
	})
})