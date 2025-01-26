import * as Events from './state/events'
import * as l10n from '@vscode/l10n'

import App from './App/App'
import IMessage from '../messages/IMessage'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { isDeviceInfo } from '../messages/DeviceInfo'
import { isDeviceState } from '../messages/DeviceState'
import { isSetConfiguration } from '../messages/SetConfiguration'
import { isTerminalLine } from '../messages/TerminalLine'

declare const bundleUrl: string

// eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
const root = createRoot(document.getElementById('root') as HTMLElement)

void (async () => {
	if (bundleUrl !== 'undefined') {
		await l10n.config({ uri: bundleUrl })
	}
	root.render(<App />)
})()

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
