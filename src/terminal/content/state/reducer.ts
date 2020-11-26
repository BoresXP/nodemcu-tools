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
	.handleAction(Actions.terminalLineAdd, (state, action) => {
		let newLines = state.terminalLines.concat(action.payload)
		newLines = newLines.slice(Math.max(newLines.length - state.settings.scrollbackMaxLines, 0))

		return {
			...state,
			terminalLines: newLines,
		}
	})
	.handleAction(Actions.terminalCommand, (state, action) => {
		if (state.isDeviceBusy) {
			return state
		}

		vscode.postMessage(terminalCommand(action.payload))

		let newCommands = state.terminalCommands.concat(action.payload)
		newCommands = newCommands.slice(Math.max(newCommands.length - state.settings.historyMaxLines, 0))

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
