export interface IState {
	terminalLines: string[]
	snippets: Record<string, string>
}

export const initialState: IState = {
	terminalLines: [],
	snippets: {},
}
