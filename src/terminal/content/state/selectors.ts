import { IDeviceInfo, IState, ITerminalLine } from './state'

import { rootStore } from './store'
import { useStoreMap } from 'effector-react'

export function useRootStore<T>(selector: (state: IState) => T): T {
	return useStoreMap({ store: rootStore, keys: [], fn: selector })
}

export const getTerminalLines = (state: IState): ITerminalLine[] => state.terminalLines

export const getTerminalAutoscrollEnabled = (state: IState): boolean => state.terminalAutoscrollEnabled

export const getSnippets = (state: IState): Record<string, string> => state.terminalSettings.snippets

export const getDeviceBusy = (state: IState): boolean => state.isDeviceBusy

export const getCurrentCommandText = (state: IState): string => state.currentCommandText

export const getDeviceInfo = (state: IState): IDeviceInfo => state.deviceInfo
