import { TerminalLineType } from '../../messages/TerminalLine'

export interface ITerminalLine {
	text: string
	type: TerminalLineType
}

export interface ISettings {
	scrollbackMaxLines: number
	historyMaxLines: number
	snippets: Record<string, string>
	minifyEnabled: boolean
}

export interface IDeviceInfo {
	numberType?: string
	heapFree?: number
	ssl?: boolean
	modules?: string
	fsTotal?: number
	fsUsed?: number
	chipArch?: string
	chipID?: string
}

export interface IState {
	terminalLines: ITerminalLine[]
	terminalCommands: string[]
	terminalAutoscrollEnabled: boolean
	currentHistoryIndex: number
	currentCommandText: string
	isDeviceBusy: boolean
	settings: ISettings
	deviceInfo: IDeviceInfo
}

export const initialSettings: ISettings = {
	scrollbackMaxLines: 300,
	historyMaxLines: 30,
	snippets: {},
	minifyEnabled: true,
}

export const initialState: IState = {
	terminalLines: [],
	terminalCommands: [],
	terminalAutoscrollEnabled: true,
	currentHistoryIndex: 1,
	currentCommandText: '',
	isDeviceBusy: true,
	settings: initialSettings,
	deviceInfo: {},
}
