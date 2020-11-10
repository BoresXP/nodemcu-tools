import * as Actions from './actions'

import { ActionType, createReducer } from 'typesafe-actions'
import { IState, initialState } from './state'

import { terminalCommand } from '../../messages/TerminalCommand'

type AllActions = ActionType<typeof Actions>

const vscode = acquireVsCodeApi()

const reducer = createReducer<IState, AllActions>(initialState)
	.handleAction(Actions.terminalLineAdd, (state, action) => ({
		...state,
		terminalLines: state.terminalLines
			.slice(Math.max(state.terminalLines.length - state.settings.scrollbackMaxLines, 0))
			.concat(action.payload),
	}))
	.handleAction(Actions.terminalCommand, (state, action) => {
		if (state.isDeviceBusy) {
			return state
		}

		vscode.postMessage(terminalCommand(action.payload))
		return {
			...state,
			terminalLines: state.terminalLines
				.slice(Math.max(state.terminalLines.length - state.settings.scrollbackMaxLines, 0))
				.concat({ text: action.payload, type: 'echo' }),
			terminalCommands: state.terminalCommands
				.slice(Math.max(state.terminalCommands.length - state.settings.historyMaxLines, 0))
				.concat(action.payload),
		}
	})
	.handleAction(Actions.deviceIsBusy, (state, action) => ({
		...state,
		isDeviceBusy: action.payload,
	}))

export default reducer
