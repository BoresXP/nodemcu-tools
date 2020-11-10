import { IState, ITerminalLine } from './state'

export const getTerminalLines = (state: IState): ITerminalLine[] => state.terminalLines

export const getSnippets = (state: IState): Record<string, string> => state.snippets

export const getDeviceBusy = (state: IState): boolean => state.isDeviceBusy
