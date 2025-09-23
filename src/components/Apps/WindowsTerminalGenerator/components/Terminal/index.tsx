import clsx from "clsx"
import "./styles.scss"
import { Orientation, Terminal } from "../Pane"
import ICONS from "@components/Icons"
import React from "react"

export type updateTerminalFunc = (terminalId: string, terminalArgs: Omit<Terminal, "id">) => void

export interface TerminalComponentProps extends Terminal {
	targetPaneId: string
	id: string
	splitPane: (targetPaneId: string, terminalId: string, orientation: Orientation, newTerminal: Terminal) => void
	updateTerminal: updateTerminalFunc
	closeTerminal: (targetPaneId: string) => void
	canSplit: boolean
}

//TODO: this should be a default on the settings page
const terminalString = "C:\\Users\\"

const TerminalComponent: React.FC<TerminalComponentProps> = (props) => {

	const onSpanInputChange = (argName: keyof Omit<Terminal, "id">) => (e: React.FormEvent<HTMLSpanElement>) => {
		const el = e.target as HTMLSpanElement
		console.log(el.textContent)
		props.updateTerminal(props.id, { [argName]: el.textContent })
	}
	

	return (
		<div className={clsx("windows-terminal-Terminal")}>
			<div className="terminal-line">
				<div className="line-content">
					<span suppressContentEditableWarning contentEditable="true" className="cwd" onBlur={onSpanInputChange("workingDir")}>{props.workingDir ?? terminalString}</span>
					<span className="prompt">&gt;</span>
					<span suppressContentEditableWarning contentEditable="true" className="command" onBlur={onSpanInputChange("startCmd")}>{props.startCmd ?? "echo hello"}</span>
				</div>
			</div>
			{
				props.canSplit && <span className="split">
					<span className="splitH" onClick={() => props.splitPane(props.targetPaneId, props.id, "h", { startCmd: "echo hello", id: crypto.randomUUID() })}>{ICONS.wtsetupgen.pane.horizontal}</span>
					<span className="splitV" onClick={() => props.splitPane(props.targetPaneId, props.id, "v", { startCmd: "echo hello", id: crypto.randomUUID() })}>{ICONS.wtsetupgen.pane.vertical}</span>
				</span>
			}
			<span className="close-button">
				<span onClick={() => { props.closeTerminal(props.id) }}>{ICONS.wtsetupgen.tab.delete}</span>
			</span>
		</div>
	)
}

export default React.memo(TerminalComponent)