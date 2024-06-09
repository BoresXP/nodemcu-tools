import {
	FileType,
	ProgressLocation,
	ShellExecution,
	Task,
	TaskRevealKind,
	TaskScope,
	Uri,
	commands,
	tasks,
	window,
	workspace,
} from 'vscode'
import { INodeMcu, NodeMcuRepository } from './nodemcu'

import { INodemcuTaskDefinition } from './task/INodemcuTask'
import NodemcuTaskProvider from './task/NodemcuTaskProvider'
import { initialSettings } from './terminal/content/state/state'
import luamin from 'luamin'
import { posix } from 'path'

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

	private static async uploadFileInternal(
		devicePath: string,
		file: Uri,
		deviceFileName?: string,
	): Promise<string | undefined> {
		const device = NodeMcuRepository.getOrCreate(devicePath)

		const fileName = deviceFileName ?? file.path.split('/').slice(-1)[0]
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
		await device.detectEspType()

		await commands.executeCommand('setContext', 'nodemcu-tools:isConnected', true)

		return device
	}

	public async disconnect(devicePath: string): Promise<void> {
		const device = NodeMcuRepository.getOrCreate(devicePath)

		await device.disconnect()

		await commands.executeCommand('setContext', 'nodemcu-tools:isConnected', NodeMcuRepository.allConnected.length > 0)
	}

	public async uploadFolder(folder: Uri, withPath: boolean): Promise<string | undefined> {
		const devicePath = await NodemcuTools.selectConnectedDevice()
		if (!devicePath) {
			return void 0
		}

		for (const [name, type] of await workspace.fs.readDirectory(folder)) {
			if (type === FileType.File) {
				const filePath = posix.join(folder.path, name)
				const deviceFileName = withPath ? filePath.split('/').slice(-2).join('/') : filePath.split('/').slice(-1)[0]
				const file = folder.with({ path: posix.join(folder.path, name) })

				const fileName = await NodemcuTools.uploadFileInternal(devicePath, file, deviceFileName)
				if (!fileName) {
					throw new Error(`Error uploading ${filePath}`)
				}
			}
		}

		return 'ok_folder'
	}

	public async uploadFile(file: Uri, deviceFileName?: string): Promise<string | undefined> {
		const devicePath = await NodemcuTools.selectConnectedDevice()
		if (!devicePath) {
			return void 0
		}

		return NodemcuTools.uploadFileInternal(devicePath, file, deviceFileName)
	}

	public async uploadBundle(files: Uri[]): Promise<string | undefined> {
		const devicePath = await NodemcuTools.selectConnectedDevice()
		if (!devicePath) {
			return void 0
		}

		for (const file of files) {
			const [pathEnd] = file.path.split('/').slice(-1)
			const fileName = await NodemcuTools.uploadFileInternal(devicePath, file)
			if (!fileName) {
				throw new Error(`Error uploading ${pathEnd}`)
			}
		}

		return 'ok_bundle'
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

	public async compileFileAndUpload(
		file: Uri,
		taskProvider: NodemcuTaskProvider,
		upload: boolean,
	): Promise<string | undefined> {
		const devicePath = await NodemcuTools.selectConnectedDevice()
		const config = taskProvider.actualConfig
		if (!devicePath || !config) {
			return void 0
		}

		const [fileBasename] = file.path.split('/').slice(-1)
		const [fileBasenameNoExtension] = fileBasename.split('.').slice(-2)

		const nodemcuTaskDefinition: INodemcuTaskDefinition = {
			type: NodemcuTaskProvider.taskType,
			nodemcuTaskName: upload ? 'compileFileAndUpload' : 'crossCompile',
			compilerExecutable: config.compilerExecutable,
			include: config.include,
			outDir: config.outDir,
			outFile: `${fileBasenameNoExtension}.lc`,
		}

		const commandLine = `${nodemcuTaskDefinition.compilerExecutable} -o ${nodemcuTaskDefinition.outDir}/${nodemcuTaskDefinition.outFile} -l ${file.fsPath} > ${nodemcuTaskDefinition.outDir}/luaccross.log`

		const nodemcuTask = new Task(
			nodemcuTaskDefinition,
			TaskScope.Workspace,
			upload ? 'Compile and upload to device' : 'Compile on host machine',
			nodemcuTaskDefinition.type,
			new ShellExecution(commandLine),
		)
		nodemcuTask.presentationOptions.reveal = TaskRevealKind.Silent
		await tasks.executeTask(nodemcuTask)

		return void 0
	}

	public async uploadFileAndRun(file: Uri): Promise<string | undefined> {
		const devicePath = await NodemcuTools.selectConnectedDevice()
		if (!devicePath) {
			return void 0
		}

		const deviceFileName = await NodemcuTools.uploadFileInternal(devicePath, file)
		if (deviceFileName) {
			await this.runFile(devicePath, deviceFileName, true)
		}

		return deviceFileName
	}

	public async uploadFileAndSetLfs(file: Uri, newName?: string): Promise<string | undefined> {
		const devicePath = await NodemcuTools.selectConnectedDevice()
		if (!devicePath) {
			return void 0
		}

		const deviceFileName = await NodemcuTools.uploadFileInternal(devicePath, file, newName)
		if (deviceFileName) {
			await this.setFileLfs(devicePath, deviceFileName)
		}

		return deviceFileName
	}

	public async compileFile(devicePath: string, deviceFileName: string): Promise<void> {
		const device = NodeMcuRepository.getOrCreate(devicePath)
		await device.commands.compile(deviceFileName)
		await device.commands.delete(deviceFileName)
	}

	public async runFile(devicePath: string, deviceFileName: string, deleteAfter?: boolean): Promise<void> {
		const device = NodeMcuRepository.getOrCreate(devicePath)
		await device.commands.run(deviceFileName, deleteAfter)
	}

	public async deleteFile(devicePath: string, deviceFileName: string): Promise<void> {
		const device = NodeMcuRepository.getOrCreate(devicePath)
		await device.commands.delete(deviceFileName)
	}

	public async setFileLfs(devicePath: string, deviceFileName: string): Promise<void> {
		const device = NodeMcuRepository.getOrCreate(devicePath)
		await device.commands.setLfs(deviceFileName)
	}

	public async downloadFile(devicePath: string, deviceFileName: string, hostFileName?: string): Promise<void> {
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

				const contentArray = new Uint8Array(
					fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength),
				)

				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const [rootFolder] = workspace.workspaceFolders!
				await workspace.fs.writeFile(Uri.joinPath(rootFolder.uri, hostFileName ?? deviceFileName), contentArray)
			},
		)
	}

	public async sendLine(line: string): Promise<void> {
		const devicePath = await NodemcuTools.selectConnectedDevice()
		if (!devicePath) {
			return void 0
		}
		const device = NodeMcuRepository.getOrCreate(devicePath)

		const minifyEnabled = workspace
			.getConfiguration()
			.get('nodemcu-tools.minify.enabled', initialSettings.minifyEnabled)

		if (minifyEnabled) {
			try {
				const minifiedLine = luamin.minify(line)
				await device.fromTerminal(minifiedLine)
			} catch (err) {
				if (err instanceof Error) {
					await window.showWarningMessage(`${err.message}`)
				}
			}
		} else {
			await device.fromTerminal(line.trim())
		}
	}

	public async sendBlock(block: string): Promise<void> {
		const devicePath = await NodemcuTools.selectConnectedDevice()
		if (!devicePath) {
			return void 0
		}
		const device = NodeMcuRepository.getOrCreate(devicePath)

		const minifyEnabled = workspace
			.getConfiguration()
			.get('nodemcu-tools.minify.enabled', initialSettings.minifyEnabled)

		if (minifyEnabled) {
			try {
				const minifiedBlock = luamin.minify(block)
				await device.commands.sendChunk(minifiedBlock)
			} catch (err) {
				if (err instanceof Error) {
					await window.showWarningMessage(`${err.message}`)
				}
			}
		} else {
			const trimmedBlock = block.replace(/^[\t ]+/gm, '')
			await device.commands.sendChunk(trimmedBlock)
		}
	}
}
