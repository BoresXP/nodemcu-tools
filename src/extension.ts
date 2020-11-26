import { ExtensionContext, Uri, commands, languages, window } from 'vscode'

import DeviceTreeItem from './tree/DeviceTreeItem'
import DeviceTreeProvider from './tree/DeviceTreeProvider'
import FileTreeItem from './tree/FileTreeItem'
import NodeMcuCompletionProvider from './completion/NodeMcuCompletionProvider'
import NodemcuTools from './NodemcuTools'
import TerminalView from './terminal/TerminalView'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext): void {
	try {
		const treeProvider = new DeviceTreeProvider()
		const treeView = window.createTreeView('nodemcu-tools.devices', { treeDataProvider: treeProvider })
		context.subscriptions.push(treeView)

		const tools = new NodemcuTools()

		context.subscriptions.push(
			languages.registerCompletionItemProvider({ language: 'lua' }, new NodeMcuCompletionProvider(), '.'),
		)

		context.subscriptions.push(
			commands.registerCommand('nodemcu-tools.connect', async (item: DeviceTreeItem) => {
				const device = await tools.connect(item.path)

				const wv = TerminalView.create(context, device)

				treeProvider.refresh()
				await treeView.reveal(item, { select: true, expand: true })

				await wv.show()
			}),
		)

		context.subscriptions.push(
			commands.registerCommand('nodemcu-tools.disconnect', async (item: DeviceTreeItem) => {
				await tools.disconnect(item.path)
				treeProvider.refresh()
			}),
		)

		context.subscriptions.push(commands.registerCommand('nodemcu-tools.refreshTreeView', () => treeProvider.refresh()))

		context.subscriptions.push(
			commands.registerCommand('nodemcu-tools.uploadFile', async (file: Uri) => {
				const deviceFileName = await tools.uploadFile(file)
				if (deviceFileName) {
					treeProvider.refresh()
				}
			}),
		)
		context.subscriptions.push(
			commands.registerCommand('nodemcu-tools.uploadFileCompile', async (file: Uri) => {
				const deviceFileName = await tools.uploadFileAndCompile(file)
				if (deviceFileName) {
					treeProvider.refresh()
				}
			}),
		)

		context.subscriptions.push(
			commands.registerCommand('nodemcu-tools.compileFile', async (item: FileTreeItem) => {
				await tools.compileFile(item.parent.path, item.name)
				treeProvider.refresh()
			}),
		)

		context.subscriptions.push(
			commands.registerCommand('nodemcu-tools.runFile', async (item: FileTreeItem) =>
				tools.runFile(item.parent.path, item.name),
			),
		)

		context.subscriptions.push(
			commands.registerCommand('nodemcu-tools.deleteFile', async (item: FileTreeItem) => {
				await tools.deleteFile(item.parent.path, item.name)
				treeProvider.refresh()
			}),
		)

		context.subscriptions.push(
			commands.registerCommand('nodemcu-tools.downloadFile', async (item: FileTreeItem) =>
				tools.downloadFile(item.parent.path, item.name),
			),
		)

		context.subscriptions.push(
			commands.registerCommand('nodemcu-tools.downloadFileAs', async (item: FileTreeItem) => {
				const oldName = item.name
				const dotPosition = oldName.lastIndexOf('.')
				const newName = await window.showInputBox({
					value: item.name,
					valueSelection: [0, dotPosition > 0 ? dotPosition : oldName.length],
					prompt: 'File will be saved under this name on host maschine',
				})

				if (!newName) {
					return
				}

				return tools.downloadFile(item.parent.path, oldName, newName)
			}),
		)
	} catch (ex) {
		console.error(ex) // eslint-disable-line no-console
		void window.showErrorMessage(`Error in nodemcu-tools: ${ex}`)
	}
}
