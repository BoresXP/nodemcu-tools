export interface ITerminalSettings {
	scrollbackMaxLines: number
	historyMaxLines: number
	snippets: Record<string, string>
}

interface ISettings {
	minifyEnabled: boolean
	minifyJSONenabled: boolean
	overwriteSnippets: boolean
	deviceFilterActive: boolean
	connectionDelay: number
}

export const initialTerminalSettings: ITerminalSettings = {
	scrollbackMaxLines: 300,
	historyMaxLines: 30,
	snippets: {},
}

export const initialSettings: ISettings = {
	minifyEnabled: false,
	minifyJSONenabled: true,
	overwriteSnippets: true,
	deviceFilterActive: true,
	connectionDelay: 100,
}
