import { deviceIsBusy, terminalLineAdd } from './state/actions'

import App from './App/App'
import IMessage from '../messages/IMessage'
import { Provider } from 'react-redux'
import React from 'react'
import ReactDOM from 'react-dom'
import { isDeviceState } from '../messages/DeviceState'
import { isTerminalLine } from '../messages/TerminalLine'
import store from './state/store'

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('root'),
)

window.addEventListener('message', evt => {
	const message = evt.data as IMessage
	if (isTerminalLine(message)) {
		store.dispatch(terminalLineAdd({ text: message.text, type: message.textType }))
	} else if (isDeviceState(message)) {
		store.dispatch(deviceIsBusy(message.isBusy))
	}
})
