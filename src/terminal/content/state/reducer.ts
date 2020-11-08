import * as Actions from './actions'

import { ActionType, createReducer } from 'typesafe-actions'
import { IState, initialState } from './state'

import { terminalCommand } from '../../messages/TerminalCommand'

type AllActions = ActionType<typeof Actions>

const vscode = acquireVsCodeApi()

const reducer = createReducer<IState, AllActions>(initialState)
	.handleAction(Actions.terminalLineAdd, (state, action) => ({
		...state,
		terminalLines: state.terminalLines.concat([action.payload]),
	}))
	.handleAction(Actions.terminalCommand, (state, action) => {
		vscode.postMessage(terminalCommand(action.payload))
		return state
	})

export default reducer
