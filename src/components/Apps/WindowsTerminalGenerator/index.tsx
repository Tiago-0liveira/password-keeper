import { useCallback, useMemo, useState } from "react"
import "./styles.scss"
import NavTabComponent, { NavTitleUpdateFunc } from "./components/NavTab"
import PaneComponent, { IsController, Orientation, PaneController, Terminal } from "./components/Pane"
import clsx from "clsx"
import ICONS from "@components/Icons"
import { generateWindowsTerminalScript } from "@src/utils/windowsTerminalHelpers"
import { promptDialogAndSaveCmdFile } from "@src/utils/misc"
import { updateTerminalFunc } from "./components/Terminal"

export type WindowsTerminalGeneratorComponentProps = {

}

export type TabT = {
	name: string,
	id: string,
	pane: PaneController
}

const removeTerminalFromPane = (
	pane: PaneController,
	terminalId: string
): PaneController | Terminal | null => {
	const newChilds: (Terminal | PaneController)[] = [];

	for (const child of pane.childs) {
		if (IsController(child)) {
			const res = removeTerminalFromPane(child, terminalId);
			if (res === null) {
				// child removed entirely -> skip
				continue;
			}
			// res may be PaneController or Terminal
			newChilds.push(res);
		} else {
			// Terminal
			if (child.id === terminalId) {
				// remove this terminal
				continue;
			}
			newChilds.push(child);
		}
	}

	if (newChilds.length === 0) {
		// nothing left in this pane -> remove it
		return null;
	}

	if (newChilds.length === 1) {
		// collapse: return the single child (could be Terminal or PaneController)
		return newChilds[0];
	}

	// 2 or more children -> keep as a PaneController (preserve id/orientation)
	return {
		...pane,
		childs: newChilds,
	};
};

const updatePane = (
	pane: PaneController,
	targetPaneId: string,
	terminalId: string,
	orientation: Orientation,
	newTerminal: Terminal
): PaneController => {
	if (pane.id === targetPaneId) {
		if (pane.childs.length === 1) {
			return {
				...pane,
				orientation,
				childs: [...pane.childs, newTerminal],
			};
		} else if (pane.childs.length === 2) {
			const [first, second] = pane.childs;

			const getId = (c: Terminal | PaneController) => c.id

			if (terminalId === getId(first)) {
				return {
					...pane,
					childs: [
						{
							id: crypto.randomUUID(),
							orientation,
							childs: [first, newTerminal],
						},
						second,
					],
				};
			}

			if (terminalId === getId(second)) {
				return {
					...pane,
					childs: [
						first,
						{
							id: crypto.randomUUID(),
							orientation,
							childs: [second, newTerminal],
						},
					],
				};
			}

			throw new Error("Target terminal not found in this pane.");
		} else {
			throw new Error("PaneController should only ever have 1 or 2 children.");
		}
	}

	// Recurse deeper - only recurse into PaneController children, not Terminal children
	return {
		...pane,
		childs: pane.childs.map((c) =>
			'childs' in c // Check if it's a PaneController by looking for childs property
				? updatePane(c, targetPaneId, terminalId, orientation, newTerminal)
				: c
		),
	};
};

const makeNewTab = (): TabT => {
	return {
		id: crypto.randomUUID(),
		name: "yarn build",
		pane: {
			orientation: "h",
			id: crypto.randomUUID(),
			childs: [{
				workingDir: "C:\\Users\\",/* Default working dir could be inside settings page */
				id: crypto.randomUUID(),
			}]
		}
	} satisfies TabT;
}

const WindowsTerminalGeneratorComponent: React.FC<WindowsTerminalGeneratorComponentProps> = () => {
	const [state, setState] = useState<{ selectedIdx: number, tabs: TabT[] }>({ selectedIdx: 0, tabs: [makeNewTab()] })
	const selectedTab = useMemo(() => state.tabs[state.selectedIdx], [state])

	const clickTab = useCallback(
		(i: number) => () => { setState((currState) => { return { ...currState, selectedIdx: i } }) },
		[],
	)

	const createTab = useCallback(() => {
		setState(currState => {
			return {
				selectedIdx: currState.tabs.length,
				tabs: [...currState.tabs, makeNewTab()]
			}
		})
	}, [])


	const deleteTab = useCallback((tabId: string) => {
		setState(currState => {
			const newTabs = currState.tabs.filter(tab => tab.id !== tabId)
			let newSelectedIdx = currState.selectedIdx

			// If selectedIdx points past the end, move it left
			if (newSelectedIdx >= newTabs.length) {
				newSelectedIdx = newTabs.length - 1
			}

			return {
				tabs: newTabs,
				selectedIdx: newSelectedIdx >= 0 ? newSelectedIdx : 0 // avoid negative index
			}
		})

	}, [])


	const generateScript = useCallback(() => {
		console.log(state)
		const wtScriptContent = generateWindowsTerminalScript(state.tabs)
		promptDialogAndSaveCmdFile("wt-setup", wtScriptContent)
	}, [state])


	function closeTerminal(terminalId: string) {
		setState((currState) => {
			const newTabs: TabT[] = [];

			for (const tab of currState.tabs) {
				const res = removeTerminalFromPane(tab.pane, terminalId);

				if (res === null) {
					continue;
				}

				if (IsController(res)) {
					newTabs.push({
						...tab,
						pane: res,
					});
				} else {
					newTabs.push({
						...tab,
						pane: {
							id: crypto.randomUUID(),
							orientation: tab.pane.orientation ?? "h",
							childs: [res],
						},
					});
				}
			}

			return { selectedIdx: currState.selectedIdx, tabs: newTabs };
		});
	}



	const splitPane = (targetPaneId: string, terminalId: string, orientation: Orientation, newTerminal: Terminal): void => {
		setState(currState => {
			return {
				selectedIdx: currState.selectedIdx,
				tabs: currState.tabs.map((tab) => {
					if (tab.id !== selectedTab.id) return tab;

					return {
						...tab,
						pane: updatePane(tab.pane, targetPaneId, terminalId, orientation, newTerminal),
					};
				})
			}
		});
	}
	const updateTerminal: updateTerminalFunc = (terminalId, terminalArgs) => {
		setState(currState => {
			const foundTerminal = currState.tabs
				.flatMap(tab =>
					tab.pane.childs.flatMap(child => {
						if (IsController(child)) {
							return child.childs.find((child2: Terminal) => child2.id === terminalId) || []
						} else {
							return child.id === terminalId ? [child] : []
						}
					})
				)
				.find(Boolean)
			if (foundTerminal && !IsController(foundTerminal)) {
				if (terminalArgs.startCmd) {
					foundTerminal.startCmd = terminalArgs.startCmd
				}
				if (terminalArgs.workingDir) {
					foundTerminal.workingDir = terminalArgs.workingDir
				}
			}
			return {
				selectedIdx: currState.selectedIdx,
				tabs: currState.tabs
			}
		})
	}

	const updateNavTitle: NavTitleUpdateFunc = (tabId: string, newTitle: string) => {
		setState(currState => {
			return {
				selectedIdx: currState.selectedIdx,
				tabs: currState.tabs.map(tab => tab.id === tabId ? { ...tab, name: newTitle } : tab)
			}
		})
	}

	return <div className="windowsTerminalGeneratorTab">
		<header>
			<h1>Windows Terminal Project Setup</h1>
		</header>
		<main className="windows-terminal">
			<nav>
				<div className={clsx("windows-terminal-nav-tab create-script")} onClick={() => generateScript()}>
					<span>{ICONS.wtsetupgen.code}</span>
					<span>Save Script</span>
				</div>
				{state.tabs.map((tab, i) => <NavTabComponent updateTitle={updateNavTitle} disabled={false} selected={i === state.selectedIdx} id={tab.id} name={tab.name} key={i} onClick={clickTab(i)} onDelete={() => deleteTab(tab.id)} onCreate={createTab} />)}
				<NavTabComponent updateTitle={() => { }} id="" name="" disabled={Boolean(selectedTab)} selected={false} create={true} onClick={createTab} onCreate={() => { }} />
			</nav>
			<main className={clsx("tab", { "no-tabs": state.tabs.length === 0 || !selectedTab })}>
				{selectedTab ?
					<PaneComponent updateTerminal={updateTerminal} depth={0} closeTerminal={closeTerminal} splitPane={splitPane} childs={selectedTab.pane.childs} orientation={selectedTab.pane.orientation} id={selectedTab.pane.id} />
					: <div className="no-tabs">
						<span>Click the</span> <span>{ICONS.wtsetupgen.tab.create}</span> <span>to create a new tab</span>
						{state.tabs.length !== 0 && !selectedTab && <div>
							<span>Or open one of the created tabs</span>
						</div>}
					</div>
				}
			</main>
		</main>
	</div>
}

export default WindowsTerminalGeneratorComponent
export const config: App = {
	label: "wt setup generator",
	component: WindowsTerminalGeneratorComponent,
	extraLabel: false
}