import { ExtensionContext, Uri, ViewColumn, WebviewPanel, window } from 'vscode'

export default class TerminalView {
	private static readonly _viewType = 'nodemcu-tools-terminal'

	private readonly _context: ExtensionContext
	private readonly _webViewPanel: WebviewPanel

	private constructor(context: ExtensionContext, webViewPanel: WebviewPanel) {
		this._context = context
		this._webViewPanel = webViewPanel

		this._webViewPanel.webview.html = this.getHtml(this._context.extensionUri)
		context.subscriptions.push(this._webViewPanel)
	}

	public static create(context: ExtensionContext, path: string): TerminalView {
		const wvPanel = window.createWebviewPanel(
			this._viewType,
			`NodeMCU@${path}`,
			ViewColumn.One,
			{
				enableScripts: true,
			}
		)

		return new TerminalView(context, wvPanel)
	}

	public show(): void {
		this._webViewPanel.reveal()
	}

	private getHtml(extensionUri: Uri): string {
		const onDiskPath = Uri.joinPath(
			extensionUri, 'out', 'terminal.js'
		)
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
}
