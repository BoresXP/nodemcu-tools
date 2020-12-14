import { TerminalLineType } from '../../messages/TerminalLine'

export interface ITerminalLine {
	text: string
	type: TerminalLineType
}

export interface ISettings {
	scrollbackMaxLines: number
	historyMaxLines: number
	snippets: Record<string, string>
}

export interface IDeviceInfo {
	numberType?: string
	heapFree?: number
	ssl?: boolean
	modules?: string
	fsTotal?: number
	fsUsed?: number
}

export interface IState {
	terminalLines: ITerminalLine[]
	terminalCommands: string[]
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
}

export const initialState: IState = {
	terminalLines: [],
	terminalCommands: [],
	currentHistoryIndex: 1,
	currentCommandText: '',
	isDeviceBusy: true,
	settings: initialSettings,
	deviceInfo: {},
}
