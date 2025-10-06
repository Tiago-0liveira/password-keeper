import { config as PasswordApp } from "./Passwords"
import { config as SettingsApp } from "./Settings"
import { config as SteamManager } from "./SteamManager"
import { config as WindowsTerminalGenerator } from "./WindowsTerminalGenerator"
import { config as Secrets } from "./Secrets"

export default [
	PasswordApp,
	SteamManager,
	WindowsTerminalGenerator,
	Secrets,
	SettingsApp
] as App[]