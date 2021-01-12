import * as Events from './events'

import { IState, initialState } from './state'

import { createStore } from 'effector'
import { terminalCommand } from '../../messages/TerminalCommand'
import vscode from './vscode'

const savedState = vscode.getState() as IState
export const rootStore = createStore<IState>(savedState ?? initialState)
	.on(Events.setSettings, (state, params) => ({
		...state,
		settings: params,
	}))
	.on(Events.terminalLineAdd, (state, params) => {
		let newLines = state.terminalLines.concat(params)
		newLines = newLines.slice(Math.max(newLines.length - state.settings.scrollbackMaxLines, 0))

		return {
			...state,
			terminalLines: newLines,
		}
	})
	.on(Events.terminalCommand, (state, params) => {
		if (state.isDeviceBusy) {
			return state
		}

		vscode.postMessage(terminalCommand(params))

		let newCommands = state.terminalCommands.concat(params)
		newCommands = newCommands.slice(Math.max(newCommands.length - state.settings.historyMaxLines, 0))

		return {
			...state,
			currentHistoryIndex: newCommands.length,
			terminalCommands: newCommands,
		}
	})
	.on(Events.deviceIsBusy, (state, params) => ({
		...state,
		isDeviceBusy: params,
	}))
	.on(Events.terminalLinesClear, state => ({
		...state,
		terminalLines: [],
	}))
	.on(Events.terminalCurrentCommandText, (state, params) => ({
		...state,
		currentCommandText: params,
		currentHistoryIndex: state.terminalCommands.length,
	}))
	.on(Events.termialHistoryUp, state => {
		const newIndex = Math.max(--state.currentHistoryIndex, 0)
		return {
			...state,
			currentHistoryIndex: newIndex,
			currentCommandText: state.terminalCommands[newIndex],
		}
	})
	.on(Events.termialHistoryDown, state => {
		const newIndex = Math.min(++state.currentHistoryIndex, state.terminalCommands.length)
		return {
			...state,
			currentHistoryIndex: newIndex,
			currentCommandText:
				newIndex === state.terminalCommands.length ? state.currentCommandText : state.terminalCommands[newIndex],
		}
	})
	.on(Events.setDeviceInfo, (state, params) => ({
		...state,
		deviceInfo: params,
	}))
	.on(Events.terminalAutoscrollSet, (state, params) => ({
		...state,
		terminalAutoscrollEnabled: params,
	}))

rootStore.watch(state => vscode.setState(state))

export const terminalLinesStore = rootStore.map(s => s.terminalLines)

export const snippetsStore = rootStore.map(s =>
	Object.keys(s.settings.snippets).map(k => ({ name: k, command: s.settings.snippets[k] })),
)
