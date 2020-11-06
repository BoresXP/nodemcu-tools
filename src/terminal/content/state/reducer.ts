import * as Actions from './actions'

import { ActionType, createReducer } from 'typesafe-actions'
import { IState, initialState } from './state'

type AllActions = ActionType<typeof Actions>

const reducer = createReducer<IState, AllActions>(initialState).handleAction(
	Actions.terminalLineAdd,
	(state, action) => ({
		...state,
		terminalLines: state.terminalLines.concat([action.payload]),
	}),
)

export default reducer
