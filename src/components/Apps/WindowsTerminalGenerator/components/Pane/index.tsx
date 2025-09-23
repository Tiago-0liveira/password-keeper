import clsx from "clsx"
import "./styles.scss"
import TerminalComponent, { updateTerminalFunc } from "../Terminal";
import React from "react";

export type Terminal = {
	workingDir?: string;
	startCmd?: string;
	id: string;
}

export type Orientation = "h" | "v"

export type PaneController = {
	childs: (Terminal | PaneController)[]
	orientation: Orientation
	id: string;
}

export interface PaneComponentProps extends PaneController {
	depth: number
	splitPane: (targetPaneId: string, terminalId: string, orientation: Orientation, newTerminal: Terminal) => void
	closeTerminal: (terminalId: string) => void
	updateTerminal: updateTerminalFunc
}

export function IsController(child: Terminal | PaneController): child is PaneController {
	return "childs" in child;
}

const PaneComponent: React.FC<PaneComponentProps> = (props) => {
	return (
		<div className={clsx("windows-terminal-Pane", props.orientation)}>
			{props.childs.map(child => {
				if (IsController(child)) {
					return <PaneComponent updateTerminal={props.updateTerminal} splitPane={props.splitPane} depth={props.depth + 1} closeTerminal={props.closeTerminal} key={child.id} id={child.id} childs={child.childs} orientation={child.orientation} />
				}
				return <TerminalComponent updateTerminal={props.updateTerminal} canSplit={props.depth === 0 || (props.depth < 1 && props.childs.length < 3)} key={child.id} {...child} closeTerminal={props.closeTerminal} splitPane={props.splitPane} targetPaneId={props.id} />
			})}
		</div>
	)
}

export default React.memo(PaneComponent)