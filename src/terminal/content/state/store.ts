import { IState, initialState } from './state'

import { createStore } from 'redux'
import reducer from './reducer'
import vscode from './vscode'

const savedState = vscode.getState() as IState
const store = createStore(reducer, savedState ? savedState : initialState)

store.subscribe(() => {
	const state = store.getState()
	vscode.setState(state)
})

export default store
