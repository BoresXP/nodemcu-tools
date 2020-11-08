import { createAction } from 'typesafe-actions'

export const terminalLineAdd = createAction('terminal/addLine')<string>()

export const terminalCommand = createAction('terminal/command')<string>()
