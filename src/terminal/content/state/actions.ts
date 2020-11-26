import { ISettings, ITerminalLine } from './state'

import { createAction } from 'typesafe-actions'

export const terminalLineAdd = createAction('terminal/addLine')<ITerminalLine>()

export const terminalCommand = createAction('terminal/command')<string>()

export const deviceIsBusy = createAction('device/isBusy')<boolean>()

export const terminalLinesClear = createAction('terminal/clearLines')()

export const termialHistoryUp = createAction('terminal/historyUp')()

export const termialHistoryDown = createAction('terminal/historyDown')()

export const terminalCurrentCommandText = createAction('terminal/currentCommandText')<string>()

export const setSettings = createAction('settings/set')<ISettings>()
