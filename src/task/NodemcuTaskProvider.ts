import { IConfiguration, INodemcuTaskDefinition } from './INodemcuTask'
import {
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

import { NodeMcuRepository } from '../nodemcu'
import { displayError } from "./OutputChannel"
import { getConfig } from './ConfigFile'
import { makeResource } from './MakeResource'
import path from 'path'

export default class NodemcuTaskProvider implements TaskProvider {
	static taskType = 'NodeMCU'
	private _config: IConfiguration | undefined
	private _tasks: Task[] | undefined = void 0
	private _processExitCode: number | undefined
	private readonly _configFile: string
	private readonly _rootFolder: string

	constructor() {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this._rootFolder = workspace.workspaceFolders![0].uri.fsPath
		this._configFile = path.join(this._rootFolder, '.nodemcutools')

		const fileWatcher = workspace.createFileSystemWatcher(this._configFile)
		fileWatcher.onDidChange(() => this.rebuildConfig())
		fileWatcher.onDidCreate(() => {
			this._tasks = void 0
			this._config = void 0
		})
		fileWatcher.onDidDelete(() => this.rebuildConfig())

		tasks.onDidEndTaskProcess(event => (this._processExitCode = event.exitCode))
		tasks.onDidEndTask(event => this.endTaskHandler(event))
	}

	public get actualConfig(): IConfiguration | undefined {
		return this._config
	}

	public async init(): Promise<void> {
		this._config = await getConfig(this._rootFolder, this._configFile, false)
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
		if (!this._rootFolder) {
			return void 0
		}

		const nodemcuTasks: Task[] = []
		this._config = await getConfig(this._rootFolder, this._configFile)
		if (!this._config) {
			return nodemcuTasks
		}

		if (this._config.resourceDir) {
			const resourceFolderWatcher = workspace.createFileSystemWatcher(path.join(this._rootFolder, this._config.resourceDir) + '/**')
			resourceFolderWatcher.onDidChange(() => this.rebuildResource(this._config!))
			resourceFolderWatcher.onDidCreate(() => this.rebuildResource(this._config!))
			resourceFolderWatcher.onDidDelete(() => this.rebuildResource(this._config!))

			const resourceFile = await makeResource(this._config)
			// add resource.lua in LFS img
			if (resourceFile) {
				const relativeResourceFilePath = workspace.asRelativePath(resourceFile)
				if (!(this._config.include.includes(relativeResourceFilePath))) {
					this._config.include.push(relativeResourceFilePath)
				}
			}
		}

		const filesLFS = this._config.include.join(' ')
		if (filesLFS === '') {
			await displayError(new Error('Include-path is not specified in config file'))
		}

		const listTasks = [
			['buildLFSandUploadSerial', 'Build LFS and upload to device via serial port'],
			['buildLFS', 'Build LFS on host machine'],
		]

		listTasks.forEach(nextTask => {
			if (!this._config) {
				return nodemcuTasks
			}

			const nodemcuTaskDefinition: INodemcuTaskDefinition = {
				compilerExecutable: this._config.compilerExecutable,
				include: this._config.include,
				outDir: this._config.outDir,
				outFile: this._config.outFile,
				type: NodemcuTaskProvider.taskType,
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

	private async rebuildConfig(): Promise<void> {
		this._tasks = void 0
		this._config = await getConfig(this._rootFolder, this._configFile)
	}

	private async rebuildResource(config: IConfiguration): Promise<void> {
		await makeResource(config)
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
