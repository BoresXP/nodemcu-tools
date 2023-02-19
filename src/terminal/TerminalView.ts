import { ExtensionContext, Uri, ViewColumn, WebviewPanel, window, workspace } from 'vscode'

import IMessage from './messages/IMessage'
import { INodeMcu } from '../nodemcu'
import { deviceInfo } from './messages/DeviceInfo'
import { deviceState } from './messages/DeviceState'
import { initialSettings } from './content/state/state'
import { isDeviceInfoRequest } from './messages/DeviceInfoRequest'
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
		this._webViewPanel.webview.onDidReceiveMessage(msg => this.onMessage(msg as IMessage))
		this._webViewPanel.onDidDispose(() => this._device.disconnect())
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
	}

	public static create(context: ExtensionContext, device: INodeMcu): TerminalView {
		const wvPanel = window.createWebviewPanel(this._viewType, `NodeMCU@${device.path}`, ViewColumn.One, {
			enableScripts: true,
		})

		return new TerminalView(context, device, wvPanel)
	}

	public async show(): Promise<void> {
		await this.setConfiguration()
		this._webViewPanel.reveal()

		await this.updateDeviceInfo()
	}

	private async updateDeviceInfo(): Promise<void> {
		const info = await this._device.commands.getDeviceInfo()
		await this._webViewPanel.webview.postMessage(
			deviceInfo(info.numberType, info.freeHeap, info.ssl, info.modules, info.fsTotal, info.fsUsed, info.deviceArch),
		)
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

	private async setConfiguration(): Promise<void> {
		const configuration = workspace.getConfiguration('nodemcu-tools')
		const snippetsInspection = configuration.inspect<Record<string, string>>('snippets')
		const snippetsInWorkspace = snippetsInspection?.workspaceValue

		await this._webViewPanel.webview.postMessage(
			setConfiguration(
				configuration.get('terminal.scrollbackSize', initialSettings.scrollbackMaxLines),
				configuration.get('terminal.commandHistorySize', initialSettings.historyMaxLines),
				snippetsInWorkspace ?? configuration.get('snippets', initialSettings.snippets),
			),
		)
	}

	private async onMessage(msg: IMessage): Promise<void> {
		if (isTerminalCommand(msg)) {
			await this._device.fromTerminal(msg.text + '\n')
		} else if (isDeviceInfoRequest(msg)) {
			await this.updateDeviceInfo()
		}
	}
}
