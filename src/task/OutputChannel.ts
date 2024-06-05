import { OutputChannel, window } from 'vscode'

let outChannel: OutputChannel

export function getOutputChannel(): OutputChannel {
	if (!outChannel) {
		outChannel = window.createOutputChannel('nodemcu-tools')
	}

	return outChannel
}

async function showGenericErrorNotification(): Promise<void> {
	await window.showWarningMessage(
		'An error occurred in the nodemcu-tools extension. See the output for more information.',
		'Go to output',
	)

	outChannel.show(true)
}

export async function displayError(errorThrown: Error): Promise<void> {
	const { message } = errorThrown

	outChannel.appendLine(message)
	await showGenericErrorNotification()
}
