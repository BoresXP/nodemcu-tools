import * as Actions from './state/actions'

import App from './App/App'
import IMessage from '../messages/IMessage'
import { Provider } from 'react-redux'
import React from 'react'
import ReactDOM from 'react-dom'
import { isDeviceState } from '../messages/DeviceState'
import { isSetConfiguration } from '../messages/SetConfiguration'
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
		store.dispatch(Actions.terminalLineAdd({ text: message.text, type: message.textType }))
	} else if (isDeviceState(message)) {
		store.dispatch(Actions.deviceIsBusy(message.isBusy))
	} else if (isSetConfiguration(message)) {
		store.dispatch(Actions.setSettings(message.configuration))
	}
})
