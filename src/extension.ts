import { ExtensionContext, ProgressLocation, Uri, commands, languages, window, workspace } from 'vscode'

import DeviceTreeItem from './tree/DeviceTreeItem'
import DeviceTreeProvider from './tree/DeviceTreeProvider'
import FileTreeItem from './tree/FileTreeItem'
import NodeMcuCompletionProvider from './completion/NodeMcuCompletionProvider'
import { NodeMcuRepository } from './nodemcu'
import TerminalView from './terminal/TerminalView'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext): void {
	try {
		const treeProvider = new DeviceTreeProvider()
		const treeView = window.createTreeView('nodemcu-tools.devices', { treeDataProvider: treeProvider })
		context.subscriptions.push(treeView)

		let disposable = commands.registerCommand('nodemcu-tools.connect', async (item: DeviceTreeItem) => {
			const device = NodeMcuRepository.getOrCreate(item.path)

			const wv = TerminalView.create(context, device)

			await device.connect()

			treeProvider.refresh()
			await treeView.reveal(item, { select: true, expand: true })
			await commands.executeCommand('setContext', 'nodemcu-tools:isConnected', true)

			wv.show()
		})
		context.subscriptions.push(disposable)

		disposable = commands.registerCommand('nodemcu-tools.disconnect', async (item: DeviceTreeItem) => {
			const device = NodeMcuRepository.getOrCreate(item.path)

			await device.disconnect()

			treeProvider.refresh()
			await commands.executeCommand(
				'setContext',
				'nodemcu-tools:isConnected',
				NodeMcuRepository.allConnected.length > 0,
			)
		})
		context.subscriptions.push(disposable)

		disposable = commands.registerCommand('nodemcu-tools.refreshTreeView', () => {
			treeProvider.refresh()
		})
		context.subscriptions.push(disposable)

		disposable = commands.registerCommand('nodemcu-tools.uploadFile', async (file: Uri) => {
			await uploadFile(file)
			treeProvider.refresh()
		})
		context.subscriptions.push(disposable)

		disposable = commands.registerCommand('nodemcu-tools.compileFile', async (item: FileTreeItem) => {
			const device = NodeMcuRepository.getOrCreate(item.parent.path)
			await device.commands.compile(item.name)
			await device.commands.delete(item.name)

			treeProvider.refresh()
		})
		context.subscriptions.push(disposable)

		disposable = commands.registerCommand('nodemcu-tools.runFile', async (item: FileTreeItem) => {
			const device = NodeMcuRepository.getOrCreate(item.parent.path)
			await device.commands.run(item.name)
		})
		context.subscriptions.push(disposable)

		disposable = commands.registerCommand('nodemcu-tools.deleteFile', async (item: FileTreeItem) => {
			const device = NodeMcuRepository.getOrCreate(item.parent.path)
			await device.commands.delete(item.name)
			treeProvider.refresh()
		})
		context.subscriptions.push(disposable)

		disposable = commands.registerCommand('nodemcu-tools.downloadFile', async (item: FileTreeItem) => {
			const device = NodeMcuRepository.getOrCreate(item.parent.path)

			await window.withProgress(
				{
					location: ProgressLocation.Notification,
					cancellable: false,
					title: `Downloading ${item.name} from NodeMCU@${device.path}`,
				},
				async progress => {
					let prevPercent = 0
					const fileData = await device.commands.download(item.name, percent => {
						progress.report({ increment: percent - prevPercent })
						prevPercent = percent
					})
					const array = new Uint8Array(
						fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength),
					)

					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					const [rootFolder] = workspace.workspaceFolders!
					await workspace.fs.writeFile(Uri.joinPath(rootFolder.uri, item.name), array)
				},
			)
		})
		context.subscriptions.push(disposable)

		disposable = languages.registerCompletionItemProvider({ language: 'lua' }, new NodeMcuCompletionProvider(), '.')
		context.subscriptions.push(disposable)
	} catch (ex) {
		console.error(ex) // eslint-disable-line no-console
		void window.showErrorMessage(`Error in nodemcu-tools: ${ex}`)
	}
}

async function uploadFile(file: Uri): Promise<void> {
	const allConnected = NodeMcuRepository.allConnected.map(d => d.path)
	let path: string | undefined
	if (allConnected.length > 1) {
		path = await window.showQuickPick(allConnected, { canPickMany: false })
		if (!path) {
			return
		}
	} else {
		[path] = allConnected
	}

	const device = NodeMcuRepository.getOrCreate(path)

	const [fileName] = file.path.split('/').slice(-1)
	await window.withProgress(
		{ location: ProgressLocation.Notification, cancellable: false, title: `Uploading ${fileName} to NodeMCU@${path}` },
		async progress => {
			const fileData = await workspace.fs.readFile(file)
			const fileBuff = Buffer.from(fileData)
			let prevPercent = 0
			await device.commands.upload(fileBuff, fileName, percent => {
				progress.report({ increment: percent - prevPercent })
				prevPercent = percent
			})
		},
	)
}
