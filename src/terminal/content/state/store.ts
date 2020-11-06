import { createStore } from 'redux'
import { initialState } from './state'
import reducer from './reducer'

const store = createStore(reducer, initialState)
export default store
