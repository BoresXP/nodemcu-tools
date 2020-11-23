export type TerminalLineType = 'out' | 'echo'

export interface ITerminalLine {
	text: string
	type: TerminalLineType
}

export interface IState {
	terminalLines: ITerminalLine[]
	terminalCommands: string[]
	currentHistoryIndex: number
	currentCommandText: string
	snippets: Record<string, string>
	isDeviceBusy: boolean
	settings: {
		scrollbackMaxLines: number
		historyMaxLines: number
	}
}

export const initialState: IState = {
	terminalLines: [],
	terminalCommands: [],
	currentHistoryIndex: 1,
	currentCommandText: '',
	snippets: {
		// TODO: shoud be configurable with this values as defaults
		// eslint-disable-next-line @typescript-eslint/naming-convention
		Restart: 'node.restart()',

		// eslint-disable-next-line @typescript-eslint/naming-convention
		Heap: '=node.heap()',

		// eslint-disable-next-line @typescript-eslint/naming-convention
		ChipID: '=node.chipid()',

		// eslint-disable-next-line @typescript-eslint/naming-convention
		'Wifi status': '=wifi.sta.status()',
	},
	isDeviceBusy: true,
	settings: {
		scrollbackMaxLines: 300,
		historyMaxLines: 50,
	},
}
