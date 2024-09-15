import { ITerminalSettings, initialTerminalSettings } from '../../../settings'

export type TerminalLineColor = 'default' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan'

export interface ITerminalLine {
	text: string
	lineColor: TerminalLineColor
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
	terminalSettings: ITerminalSettings
	deviceInfo: IDeviceInfo
}

export const initialState: IState = {
	terminalLines: [],
	terminalCommands: [],
	terminalAutoscrollEnabled: true,
	currentHistoryIndex: 1,
	currentCommandText: '',
	isDeviceBusy: true,
	terminalSettings: initialTerminalSettings,
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
