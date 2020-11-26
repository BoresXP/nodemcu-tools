import { ExtensionContext, Uri, ViewColumn, WebviewPanel, window, workspace } from 'vscode'

import IMessage from './messages/IMessage'
import { INodeMcu } from '../nodemcu'
import { deviceState } from './messages/DeviceState'
import { initialSettings } from './content/state/state'
import { isTerminalCommand } from './messages/TerminalCommand'
import { setConfiguration } from './messages/SetConfiguration'
import { terminalLine } from './messages/TerminalLine'

export default class TerminalView {
	private static readonly _viewType = 'nodemcu-tools-terminal'

	private readonly _context: ExtensionContext
	private readonly _device: INodeMcu
	private readonly _webViewPanel: WebviewPanel

	private constructor(context: ExtensionContext, device: INodeMcu, webViewPanel: WebviewPanel) {
		this._context = context
		this._device = device
		this._webViewPanel = webViewPanel

		this._webViewPanel.webview.html = this.getHtml(this._context.extensionUri)
		this._webViewPanel.webview.onDidReceiveMessage(msg => this.onMessage(msg))
		context.subscriptions.push(this._webViewPanel)

		this._device.onClose(() => {
			this._webViewPanel.dispose()
		})
		this._device.toTerminal(async data => {
			await this._webViewPanel.webview.postMessage(terminalLine(data.type, data.data))
		})
		this._device.onBusyChanged(async isBusy => {
			await this._webViewPanel.webview.postMessage(deviceState(isBusy))
		})

		const configuration = workspace.getConfiguration('nodemcu-tools')
		void this._webViewPanel.webview.postMessage(
			setConfiguration(
				configuration.get('terminal.scrollbackSize', initialSettings.scrollbackMaxLines),
				configuration.get('terminal.commandHistorySize', initialSettings.historyMaxLines),
				configuration.get('snippets', initialSettings.snippets),
			),
		)
	}

	public static create(context: ExtensionContext, device: INodeMcu): TerminalView {
		const wvPanel = window.createWebviewPanel(this._viewType, `NodeMCU@${device.path}`, ViewColumn.One, {
			enableScripts: true,
		})

		return new TerminalView(context, device, wvPanel)
	}

	public show(): void {
		this._webViewPanel.reveal()
	}

	private getHtml(extensionUri: Uri): string {
		const onDiskPath = Uri.joinPath(extensionUri, 'out', 'terminal.js')
		const srcPath = this._webViewPanel.webview.asWebviewUri(onDiskPath)

		return `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
	</head>
	<body>
		<div id="root"></div>
		<script src="${srcPath}"></script>
	</body>
</html>`
	}

	private async onMessage(msg: IMessage): Promise<void> {
		if (isTerminalCommand(msg)) {
			await this._device.fromTerminal(msg.text + '\n')
		}
	}
}
