export type TerminalLineColor = 'default' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan'

export interface ITerminalLine {
	text: string
	lineColor: TerminalLineColor
}

export interface ISettings {
	scrollbackMaxLines: number
	historyMaxLines: number
	snippets: Record<string, string>
	minifyEnabled?: boolean
	overwriteSnippets?: boolean
	deviceFilterActive?: boolean
	connectionDelay?: number
}

export interface IDeviceInfo {
	numberType: string
	freeHeap: number
	ssl: boolean
	modules: string
	fsTotal: number
	fsUsed: number
	chipArch: string
	chipModel: string
	chipID: string
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
	minifyEnabled: false,
	overwriteSnippets: true,
	deviceFilterActive: true,
	connectionDelay: 100,
}

export const initialState: IState = {
	terminalLines: [],
	terminalCommands: [],
	terminalAutoscrollEnabled: true,
	currentHistoryIndex: 1,
	currentCommandText: '',
	isDeviceBusy: true,
	settings: initialSettings,
	deviceInfo: {
		numberType: '',
		freeHeap: 0,
		ssl: false,
		modules: '',
		fsTotal: 0,
		fsUsed: 0,
		chipArch: '',
		chipModel: '',
		chipID: '',
	},
}
