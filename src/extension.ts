import { ExtensionContext, ProgressLocation, Terminal, Uri, commands, languages, window, workspace } from 'vscode'

import DeviceTerminal from './terminal/DeviceTerminal'
import DeviceTreeItem from './tree/DeviceTreeItem'
import DeviceTreeProvider from './tree/DeviceTreeProvider'
import FileTreeItem from './tree/FileTreeItem'
import NodeMcuCompletionProvider from './completion/NodeMcuCompletionProvider'
import NodeMcuRepository from './nodemcu/NodeMcuRepository'
import TerminalConnectable from './terminal/TerminalConnectable'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext): void {
	const treeProvider = new DeviceTreeProvider()
	const treeView = window.createTreeView('nodemcu-tools.devices', { treeDataProvider: treeProvider })
	context.subscriptions.push(treeView)

	let disposable = commands.registerCommand('nodemcu-tools.connect', async (item: DeviceTreeItem) => {
		const device = NodeMcuRepository.getOrCreate(item.path)

		const terminal = await createTerminal(device, item.path)
		context.subscriptions.push(terminal)

		await device.connect()

		treeProvider.refresh()
		await treeView.reveal(item, { select: true, expand: true })
		await commands.executeCommand('setContext', 'nodemcu-tools:isConnected', true)

		terminal.show(true)
	})
	context.subscriptions.push(disposable)

	disposable = commands.registerCommand('nodemcu-tools.disconnect', async (item: DeviceTreeItem) => {
		const device = NodeMcuRepository.getOrCreate(item.path)

		await device.disconnect()

		treeProvider.refresh()
		await commands.executeCommand('setContext', 'nodemcu-tools:isConnected', NodeMcuRepository.allConnected.length > 0)
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
		await device.compile(item.name)
		await device.delete(item.name)

		treeProvider.refresh()
	})
	context.subscriptions.push(disposable)

	disposable = commands.registerCommand('nodemcu-tools.runFile', async (item: FileTreeItem) => {
		const device = NodeMcuRepository.getOrCreate(item.parent.path)
		await device.run(item.name)
	})
	context.subscriptions.push(disposable)

	disposable = commands.registerCommand('nodemcu-tools.deleteFile', async (item: FileTreeItem) => {
		const device = NodeMcuRepository.getOrCreate(item.parent.path)
		await device.delete(item.name)
		treeProvider.refresh()
	})
	context.subscriptions.push(disposable)

	disposable = commands.registerCommand('nodemcu-tools.downloadFile', async (item: FileTreeItem) => {
		const device = NodeMcuRepository.getOrCreate(item.parent.path)

		await window.withProgress(
			{ location: ProgressLocation.Notification, cancellable: false, title: `Downloading ${item.name} from NodeMCU@${device.path}` },
			async progress => {
				const fileData = await device.download(item.name)
				const array = new Uint8Array(fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength))

				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const [rootFolder] = workspace.workspaceFolders!
				await workspace.fs.writeFile(Uri.joinPath(rootFolder.uri, item.name), array)
				progress.report({ increment: 100 })
			})
	})
	context.subscriptions.push(disposable)

	disposable = commands.registerCommand('nodemcu-tools.reset', async (item: FileTreeItem) => {
		const device = NodeMcuRepository.getOrCreate(item.parent.path)
		await device.reset()
	})
	context.subscriptions.push(disposable)

	disposable = languages.registerCompletionItemProvider({ language: 'lua' }, new NodeMcuCompletionProvider(), '.')
	context.subscriptions.push(disposable)
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
			await device.upload(
				fileBuff,
				fileName,
				percent => progress.report({ increment: percent }))
		})
}

function createTerminal(termConn: TerminalConnectable, path: string): Promise<Terminal> {
	return new Promise(resolve => {
		const devTerminal = new DeviceTerminal(termConn)
		let terminal: Terminal | undefined = void 0

		devTerminal.onReady(() => {
			resolve(terminal)
		})

		terminal = window.createTerminal({ name: `NodeMCU@${path}`, pty: devTerminal })
	})
}
