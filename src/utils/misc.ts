import { save } from "@tauri-apps/plugin-dialog"
import { writeFile } from "@tauri-apps/plugin-fs";


export const promptDialogAndSaveCmdFile = async (defaultName: string, content: string) => {
	const path = await save({
		defaultPath: defaultName,
		filters: [
			{ name: 'Command Files', extensions: ['cmd'] },
			{ name: 'All Files', extensions: ['*'] },
		],
	});

	if (path) {
		await writeFile(path, new TextEncoder().encode(content));
	}
};
