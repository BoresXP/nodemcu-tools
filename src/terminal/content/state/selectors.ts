import { IState } from './state'

export const getTerminalLines = (state: IState): string[] => state.terminalLines

export const getSnippets = (state: IState): Record<string, string> => state.snippets
