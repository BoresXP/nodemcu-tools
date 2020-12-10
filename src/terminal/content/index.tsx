import * as Events from './state/events'

import App from './App/App'
import IMessage from '../messages/IMessage'
import React from 'react'
import ReactDOM from 'react-dom'
import { isDeviceInfo } from '../messages/DeviceInfo'
import { isDeviceState } from '../messages/DeviceState'
import { isSetConfiguration } from '../messages/SetConfiguration'
import { isTerminalLine } from '../messages/TerminalLine'

ReactDOM.render(<App />, document.getElementById('root'))

window.addEventListener('message', evt => {
	const message = evt.data as IMessage
	if (isTerminalLine(message)) {
		Events.terminalLineAdd({ text: message.text, type: message.textType })
	} else if (isDeviceState(message)) {
		Events.deviceIsBusy(message.isBusy)
	} else if (isSetConfiguration(message)) {
		Events.setSettings(message.configuration)
	} else if (isDeviceInfo(message)) {
		Events.setDeviceInfo(message.info)
	}
})
