interface ISettings {
	minifyLuaEnabled: boolean
	minifyJSONenabled: boolean
	overwriteSnippets: boolean
	deviceFilterActive: boolean
	connectionDelay: number
}

export const initialSettings: ISettings = {
	minifyLuaEnabled: false,
	minifyJSONenabled: false,
	overwriteSnippets: true,
	deviceFilterActive: true,
	connectionDelay: 100,
}
