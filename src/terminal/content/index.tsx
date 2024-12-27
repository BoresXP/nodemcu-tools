import * as Events from './state/events'

import App from './App/App'
import IMessage from '../messages/IMessage'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { isDeviceInfo } from '../messages/DeviceInfo'
import { isDeviceState } from '../messages/DeviceState'
import { isSetConfiguration } from '../messages/SetConfiguration'
import { isTerminalLine } from '../messages/TerminalLine'

// eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
createRoot(document.getElementById('root') as HTMLElement).render(<App />)

window.addEventListener('message', evt => {
	if (!evt.origin.startsWith('vscode-webview:')) {
		return
	}
	const message = evt.data as IMessage
	if (isTerminalLine(message)) {
		Events.terminalLineAdd({ text: message.text, lineColor: message.textColor })
	} else if (isDeviceState(message)) {
		Events.deviceIsBusy(message.isBusy)
	} else if (isSetConfiguration(message)) {
		Events.setSettings(message.configuration)
	} else if (isDeviceInfo(message)) {
		Events.setDeviceInfo(message.info)
	}
})
