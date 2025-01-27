import { IDeviceInfo, ITerminalLine, ITerminalSettings } from './state'

import { createEvent } from 'effector'

export const terminalLineAdd = createEvent<ITerminalLine>()

export const terminalCommand = createEvent<string>()

export const deviceIsBusy = createEvent<boolean>()

export const terminalLinesClear = createEvent()

export const termialHistoryUp = createEvent()

export const termialHistoryDown = createEvent()

export const terminalCurrentCommandText = createEvent<string>()

export const terminalAutoscrollSet = createEvent<boolean>()

export const setSettings = createEvent<ITerminalSettings>()

export const setDeviceInfo = createEvent<IDeviceInfo>()
