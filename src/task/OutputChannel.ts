import { OutputChannel, window } from 'vscode'

let outChannel: OutputChannel

export function getOutputChannel(): OutputChannel {
	if (!outChannel) {
		outChannel = window.createOutputChannel('nodemcu-tools')
	}

	return outChannel
}
