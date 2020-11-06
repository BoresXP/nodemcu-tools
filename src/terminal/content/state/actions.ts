import { createAction } from 'typesafe-actions'

export const terminalLineAdd = createAction('terminal/addLine')<string>()
