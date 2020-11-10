import { ITerminalLine } from './state'
import { createAction } from 'typesafe-actions'

export const terminalLineAdd = createAction('terminal/addLine')<ITerminalLine>()

export const terminalCommand = createAction('terminal/command')<string>()

export const deviceIsBusy = createAction('device/isBusy')<boolean>()
