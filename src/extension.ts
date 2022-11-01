import { ExtensionContext, Uri, commands, languages, window, workspace } from 'vscode'

import DeviceTreeItem from './tree/DeviceTreeItem'
import DeviceTreeProvider from './tree/DeviceTreeProvider'
import FileTreeItem from './tree/FileTreeItem'
import NodeMcuCompletionProvider from './completion/NodeMcuCompletionProvider'
import NodemcuTools from './NodemcuTools'
import TerminalView from './terminal/TerminalView'
import { initialSettings } from './terminal/content/state/state'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext): void {
	try {
		const configuration = workspace.getConfiguration('nodemcu-tools')
		const treeProvider = new DeviceTreeProvider()
		const treeView = window.createTreeView('nodemcu-tools.devices', { treeDataProvider: treeProvider })
		context.subscriptions.push(treeView)

		const tools = new NodemcuTools()

		const completionEnabled = configuration.get('nodemcu-tools.completion.enabled', initialSettings.completionEnabled)
		if (completionEnabled) {
			context.subscriptions.push(
				languages.registerCompletionItemProvider({ language: 'lua' }, new NodeMcuCompletionProvider(), '.'),
			)
		}

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
			commands.registerCommand('nodemcu-tools.uploadFileAs', async (file: Uri) => {
				const newName = await renameFile(file, 'File will be saved under this name on device')
				if (!newName) {
					return
				}

				const deviceFileName = await tools.uploadFile(file, newName)
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
			commands.registerCommand('nodemcu-tools.uploadFileRun', async (file: Uri) => {
				await tools.uploadFileAndRun(file)
			})
		)
		context.subscriptions.push(
			commands.registerCommand('nodemcu-tools.uploadFileSetLfs', async (file: Uri) => {
				await tools.uploadFileAndSetLfs(file)
			})
		)
		context.subscriptions.push(
			commands.registerCommand('nodemcu-tools.uploadFileSetLfsAs', async (file: Uri) => {
				const newName = await renameFile(file, 'File will be saved under this name on device')
				if (!newName) {
					return
				}

				await tools.uploadFileAndSetLfs(file, newName)
			})
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
				const newName = await renameFile(item.name, 'File will be saved under this name on host machine')
				if (!newName) {
					return
				}

				return tools.downloadFile(item.parent.path, item.name, newName)
			}),
		)
	} catch (ex) {
		console.error(ex) // eslint-disable-line no-console
		void window.showErrorMessage(`Error in nodemcu-tools: ${ex}`)
	}
}

async function renameFile(file: string | Uri, prompt: string): Promise<string | undefined> {
	const oldName = typeof file === 'string' ? file : file.path.split('/').slice(-1)[0]
	const dotPosition = oldName.lastIndexOf('.')
	return window.showInputBox({
		value: oldName,
		valueSelection: [0, dotPosition > 0 ? dotPosition : oldName.length],
		prompt,
	})
}
