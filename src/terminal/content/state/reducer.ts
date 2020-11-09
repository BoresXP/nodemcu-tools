import * as Actions from './actions'

import { ActionType, createReducer } from 'typesafe-actions'
import { IState, ITerminalLine, initialState } from './state'

import { terminalCommand } from '../../messages/TerminalCommand'

type AllActions = ActionType<typeof Actions>

const vscode = acquireVsCodeApi()

function addTerminalLine(state: IState, newLine: ITerminalLine): ITerminalLine[] {
	if (state.terminalLines.length === state.settings.scrollbackMaxLines) {
		state.terminalLines.shift()
	}

	return state.terminalLines.concat([newLine])
}

const reducer = createReducer<IState, AllActions>(initialState)
	.handleAction(Actions.terminalLineAdd, (state, action) => ({
		...state,
		terminalLines: addTerminalLine(state, action.payload),
	}))
	.handleAction(Actions.terminalCommand, (state, action) => {
		vscode.postMessage(terminalCommand(action.payload))
		return {
			...state,
			terminalLines: addTerminalLine(state, { text: action.payload, type: 'echo' }),
		}
	})

export default reducer
