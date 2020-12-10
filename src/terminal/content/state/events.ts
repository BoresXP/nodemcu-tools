import { IDeviceInfo, ISettings, ITerminalLine } from './state'

import { createEvent } from 'effector'

export const terminalLineAdd = createEvent<ITerminalLine>()

export const terminalCommand = createEvent<string>()

export const deviceIsBusy = createEvent<boolean>()

export const terminalLinesClear = createEvent()

export const termialHistoryUp = createEvent()

export const termialHistoryDown = createEvent()

export const terminalCurrentCommandText = createEvent<string>()

export const setSettings = createEvent<ISettings>()

export const setDeviceInfo = createEvent<IDeviceInfo>()
