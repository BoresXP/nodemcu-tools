import { INodeMcu, NodeMcuRepository } from './nodemcu'
import { ProgressLocation, Uri, commands, window, workspace } from 'vscode'

export default class NodemcuTools {
	private static async selectConnectedDevice(): Promise<string | undefined> {
		const allConnected = NodeMcuRepository.allConnected.map(d => d.path)
		let path: string | undefined
		if (allConnected.length > 1) {
			path = await window.showQuickPick(allConnected, { canPickMany: false })
			if (!path) {
				return void 0
			}
		} else {
			[path] = allConnected
		}

		return path
	}

	private static async uploadFileInternal(devicePath: string, file: Uri): Promise<string | undefined> {
		const device = NodeMcuRepository.getOrCreate(devicePath)

		const [fileName] = file.path.split('/').slice(-1)
		await window.withProgress(
			{
				location: ProgressLocation.Notification,
				cancellable: false,
				title: `Uploading ${fileName} to NodeMCU@${devicePath}`,
			},
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

		return fileName
	}

	public async connect(devicePath: string): Promise<INodeMcu> {
		const device = NodeMcuRepository.getOrCreate(devicePath)
		await device.connect()

		await commands.executeCommand('setContext', 'nodemcu-tools:isConnected', true)

		return device
	}

	public async disconnect(devicePath: string): Promise<void> {
		const device = NodeMcuRepository.getOrCreate(devicePath)

		await device.disconnect()

		await commands.executeCommand('setContext', 'nodemcu-tools:isConnected', NodeMcuRepository.allConnected.length > 0)
	}

	public async uploadFile(file: Uri): Promise<string | undefined> {
		const devicePath = await NodemcuTools.selectConnectedDevice()
		if (!devicePath) {
			return void 0
		}

		return NodemcuTools.uploadFileInternal(devicePath, file)
	}

	public async uploadFileAndCompile(file: Uri): Promise<string | undefined> {
		const devicePath = await NodemcuTools.selectConnectedDevice()
		if (!devicePath) {
			return void 0
		}

		const deviceFileName = await NodemcuTools.uploadFileInternal(devicePath, file)
		if (deviceFileName) {
			await this.compileFile(devicePath, deviceFileName)
		}

		return deviceFileName
	}

	public async compileFile(devicePath: string, deviceFileName: string): Promise<void> {
		const device = NodeMcuRepository.getOrCreate(devicePath)
		await device.commands.compile(deviceFileName)
		await device.commands.delete(deviceFileName)
	}

	public async runFile(devicePath: string, deviceFileName: string): Promise<void> {
		const device = NodeMcuRepository.getOrCreate(devicePath)
		await device.commands.run(deviceFileName)
	}

	public async deleteFile(devicePath: string, deviceFileName: string): Promise<void> {
		const device = NodeMcuRepository.getOrCreate(devicePath)
		await device.commands.delete(deviceFileName)
	}

	public async downloadFile(devicePath: string, deviceFileName: string): Promise<void> {
		const device = NodeMcuRepository.getOrCreate(devicePath)

		await window.withProgress(
			{
				location: ProgressLocation.Notification,
				cancellable: false,
				title: `Downloading ${deviceFileName} from NodeMCU@${devicePath}`,
			},
			async progress => {
				let prevPercent = 0
				const fileData = await device.commands.download(deviceFileName, percent => {
					progress.report({ increment: percent - prevPercent })
					prevPercent = percent
				})

				const array = new Uint8Array(
					fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength),
				)

				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const [rootFolder] = workspace.workspaceFolders!
				await workspace.fs.writeFile(Uri.joinPath(rootFolder.uri, deviceFileName), array)
			},
		)
	}
}
