import * as Actions from './actions'

import { ActionType, createReducer } from 'typesafe-actions'
import { IState, initialState } from './state'

import { terminalCommand } from '../../messages/TerminalCommand'
import vscode from './vscode'

type AllActions = ActionType<typeof Actions>

const reducer = createReducer<IState, AllActions>(initialState)
	.handleAction(Actions.setSettings, (state, action) => ({
		...state,
		settings: action.payload,
	}))
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

		const newCommands = state.terminalCommands
			.slice(Math.max(state.terminalCommands.length - state.settings.historyMaxLines, 0))
			.concat(action.payload)

		return {
			...state,
			currentHistoryIndex: newCommands.length,
			terminalCommands: newCommands,
		}
	})
	.handleAction(Actions.deviceIsBusy, (state, action) => ({
		...state,
		isDeviceBusy: action.payload,
	}))
	.handleAction(Actions.terminalLinesClear, state => ({
		...state,
		terminalLines: [],
	}))
	.handleAction(Actions.terminalCurrentCommandText, (state, action) => ({
		...state,
		currentCommandText: action.payload,
		currentHistoryIndex: state.terminalCommands.length,
	}))
	.handleAction(Actions.termialHistoryUp, state => {
		const newIndex = Math.max(--state.currentHistoryIndex, 0)
		return {
			...state,
			currentHistoryIndex: newIndex,
			currentCommandText: state.terminalCommands[newIndex],
		}
	})
	.handleAction(Actions.termialHistoryDown, state => {
		const newIndex = Math.min(++state.currentHistoryIndex, state.terminalCommands.length)
		return {
			...state,
			currentHistoryIndex: newIndex,
			currentCommandText:
				newIndex === state.terminalCommands.length ? state.currentCommandText : state.terminalCommands[newIndex],
		}
	})

export default reducer
