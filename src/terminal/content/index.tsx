import App from './App/App'
import IMessage from '../messages/IMessage'
import { Provider } from 'react-redux'
import React from 'react'
import ReactDOM from 'react-dom'
import { isTerminalLine } from '../messages/TerminalLine'
import store from './state/store'
import { terminalLineAdd } from './state/actions'

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('root'),
)

window.addEventListener('message', evt => {
	const message = evt.data as IMessage
	if (isTerminalLine(message)) {
		store.dispatch(terminalLineAdd({ text: message.text, type: 'out' }))
	}
})
