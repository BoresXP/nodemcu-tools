export interface IState {
	terminalLines: string[]
	snippets: Record<string, string>
}

export const initialState: IState = {
	terminalLines: [],
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
}
