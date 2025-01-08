import {
	EventEmitter,
	FileSystemWatcher,
	ShellExecution,
	Task,
	TaskEndEvent,
	TaskGroup,
	TaskProvider,
	TaskRevealKind,
	TaskScope,
	Uri,
	commands,
	tasks,
	workspace,
} from 'vscode'
import { IConfiguration, NodemcuTaskDefinition } from './INodemcuTask'

import { NodeMcuRepository } from '../nodemcu'
import { displayError } from './OutputChannel'
import { getConfig } from './ConfigFile'
import { makeResource } from './MakeResource'
import path from 'path'

export default class NodemcuTaskProvider implements TaskProvider {
	static readonly taskType = 'NodeMCU'
	private _config: IConfiguration | undefined
	private _tasks: Task[] | undefined = void 0
	private _processExitCode: number | undefined
	private readonly _configFile: string
	private readonly _rootFolder: string
	private _resourceFolderWatcher: FileSystemWatcher | undefined = void 0
	private readonly _evtResource = new EventEmitter<void>()
	private _fireSoonHandle?: NodeJS.Timeout

	constructor() {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this._rootFolder = workspace.workspaceFolders![0].uri.fsPath
		this._configFile = path.join(this._rootFolder, '.nodemcutools')

		const fileWatcher = workspace.createFileSystemWatcher(this._configFile)
		fileWatcher.onDidChange(() => this.rebuildConfig())
		fileWatcher.onDidCreate(() => this.rebuildConfig())
		fileWatcher.onDidDelete(() => this.rebuildConfig())

		tasks.onDidEndTaskProcess(event => (this._processExitCode = event.exitCode))
		tasks.onDidEndTask(event => this.endTaskHandler(event))
	}

	public get actualConfig(): IConfiguration | undefined {
		return this._config
	}

	public async init(): Promise<void> {
		this._config = await getConfig(this._rootFolder, this._configFile)
		this.setResourceWatcher()
		await this.rebuildResource()
	}

	public resolveTask(_task: Task): Task | undefined {
		return void 0
	}

	public async provideTasks(): Promise<Task[] | undefined> {
		if (!this._tasks) {
			this._tasks = await this.getTasks()
		}

		return this._tasks
	}

	private async getTasks(): Promise<Task[] | undefined> {
		if (!this._rootFolder || !this._config) {
			return void 0
		}

		const filesLFS = this._config.include.join(' ')
		if (filesLFS === '') {
			await displayError(new Error('Include-path is not specified in config file'))
		}

		const listTasks = [
			['buildLFSandUploadSerial', 'Build LFS and upload to device via serial port'],
			['buildLFS', 'Build LFS on host machine'],
		]
		const taskConfig = {
			compilerExecutable: this._config.compilerExecutable,
			include: this._config.include,
			outDir: this._config.outDir,
			outFile: this._config.outFile,
			type: NodemcuTaskProvider.taskType,
		}
		const nodemcuTasks: Task[] = []

		listTasks.forEach(nextTask => {
			const nodemcuTaskDefinition: NodemcuTaskDefinition = {
				...taskConfig,
				nodemcuTaskName: nextTask[0],
			}

			const commandLine = `${nodemcuTaskDefinition.compilerExecutable} -o ${nodemcuTaskDefinition.outDir}/${nodemcuTaskDefinition.outFile} -f -l ${filesLFS} > ${nodemcuTaskDefinition.outDir}/luaccross.log`

			const nodemcuTask = new Task(
				nodemcuTaskDefinition,
				TaskScope.Workspace,
				nextTask[1],
				nodemcuTaskDefinition.type,
				new ShellExecution(commandLine),
			)
			nodemcuTask.group = TaskGroup.Build
			nodemcuTask.presentationOptions.reveal = TaskRevealKind.Silent

			nodemcuTasks.push(nodemcuTask)
		})

		return nodemcuTasks
	}

	private setResourceWatcher(): void {
		if (this._config?.resourceDir) {
			this._resourceFolderWatcher = workspace.createFileSystemWatcher(
				path.join(this._rootFolder, this._config.resourceDir) + '/**',
			)
			this._resourceFolderWatcher.onDidChange(() => this.fireSoon())
			this._resourceFolderWatcher.onDidCreate(() => this.fireSoon())
			this._resourceFolderWatcher.onDidDelete(() => this.fireSoon())

			this._evtResource.event(() => this.rebuildResource())
		}
	}

	private fireSoon(): void {
		if (this._fireSoonHandle) {
			clearTimeout(this._fireSoonHandle)
		}

		this._fireSoonHandle = setTimeout(() => {
			this._evtResource.fire()
		}, 250)
	}

	private async rebuildConfig(): Promise<void> {
		this._tasks = void 0
		if (this._resourceFolderWatcher) {
			this._resourceFolderWatcher.dispose()
		}
		this._config = await getConfig(this._rootFolder, this._configFile)
		if (this._config) {
			this.setResourceWatcher()
			await this.rebuildResource()
			await this.provideTasks()
		}
	}

	private async rebuildResource(): Promise<void> {
		if (this._config?.resourceDir) {
			const resourceFile = await makeResource(this._config)
			// add resource.lua to LFS image build
			if (resourceFile) {
				const relativeResourceFilePath = workspace.asRelativePath(resourceFile)
				if (!this._config.include.includes(relativeResourceFilePath)) {
					this._config.include.push(relativeResourceFilePath)
				}
			}
		}
	}

	private async endTaskHandler(event: TaskEndEvent): Promise<void> {
		const taskDefinition = event.execution.task.definition
		if (
			taskDefinition.type !== NodemcuTaskProvider.taskType ||
			NodeMcuRepository.allConnected.length <= 0 ||
			this._processExitCode !== 0
		) {
			return
		}

		const fileToUpload = Uri.joinPath(
			Uri.file(this._rootFolder),
			taskDefinition.outDir as string,
			taskDefinition.outFile as string,
		)

		switch (taskDefinition.nodemcuTaskName) {
			case 'buildLFSandUploadSerial':
				await commands.executeCommand('nodemcu-tools.uploadFileSetLfs', fileToUpload)
				break

			case 'compileFileAndUpload':
				await commands.executeCommand('nodemcu-tools.uploadFile', fileToUpload, [fileToUpload])
				break
		}
	}
}
