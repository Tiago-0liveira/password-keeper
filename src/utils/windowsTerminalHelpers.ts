import { TabT } from "@components/Apps/WindowsTerminalGenerator";
import { IsController, Orientation, PaneController, Terminal } from "@components/Apps/WindowsTerminalGenerator/components/Pane";

const windowsTerminalScriptBaseFileContent = ["@echo off", "echo Launching Windows Terminal Script -- by Tiago Oliveira -- Password-Keeper-v3"]

export function generateWindowsTerminalScript(tabs: TabT[]): string {
	const commands: string[] = [];

	for (let i = 0; i < tabs.length; i++) {
		const tab = tabs[i];
		let comeBack = IsController(tab.pane.childs[0])
		let firstTerminal = comeBack ? (tab.pane.childs[0] as PaneController).childs[0] as Terminal : tab.pane.childs[0]

		// Create the first terminal for this tab
		const newTabCommand = `new-tab --title "${tab.name}"${terminalToParameters(firstTerminal)}`;
		commands.push(newTabCommand);

		if (tab.pane.childs.length > 1) {
			if (IsController(tab.pane.childs[1])) {
				const controller = tab.pane.childs[1] as PaneController
				for (let j = 0; j < controller.childs.length; j++) {
					commands.push(splitTerminalToCommand(controller.childs[j] as Terminal, j === 0 ? tab.pane.orientation : controller.orientation))
				}
			} else {
				commands.push(splitTerminalToCommand(tab.pane.childs[1], tab.pane.orientation))
			}
		}
		// leave the second child for last because of focus changes
		if (comeBack) {
			commands.push("move-focus first")
			commands.push(splitTerminalToCommand((tab.pane.childs[0] as PaneController).childs[1] as Terminal, (tab.pane.childs[0] as PaneController).orientation))
		}
	}

	return windowsTerminalScriptBaseFileContent.join("\n") + `\n\nwt ${commands.join(' ^\n    ; ')}`;
}

function terminalToParameters(terminal: Terminal): string {
	let cmd = "";
	if (terminal.workingDir) {
		cmd += ` --startingDirectory "${terminal.workingDir}"`;
	}
	if (terminal.startCmd) {
		cmd += ` cmd /k "${terminal.startCmd}"`;
	} else {
		cmd += ' cmd';
	}
	return cmd;
}

function splitTerminalToCommand(terminal: Terminal, splitOrientation: Orientation): string {
	return `split-pane -${splitOrientation.toUpperCase()}${terminalToParameters(terminal)}`;
}