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
import { displayError, getConfig } from './ConfigFile'

import { NodeMcuRepository } from '../nodemcu'
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
		const listTasks = [
			['buildLfsAndUploadSerial', 'Build LFS and upload to device via serial port'],
			['buildLfs', 'Build LFS on host machine'],
		]

		listTasks.forEach(nextTask => {
			if (!this._config) {
				return nodemcuTasks
			}
			const nodemcuTaskDefinition: INodemcuTaskDefinition = {
				type: NodemcuTaskProvider.taskType,
				nodemcuTaskName: nextTask[0],
				compilerExecutable: this._config.compilerExecutable,
				include: this._config.include,
				outDir: this._config.outDir,
				outFile: this._config.outFile,
			}
			const filesLFS = this.getFilesLFS(nodemcuTaskDefinition.include!)

			if (filesLFS === '') {
				void (async () => {
					await displayError(new Error('Include path is not specified in config file'))
				})()
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

	private getFilesLFS(include: string[]): string {
		return include.join(' ')
	}

	private async rebuildConfig(): Promise<void> {
		this._tasks = void 0
		this._config = await getConfig(this._rootFolder, this._configFile)
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
			case 'buildLfsAndUploadSerial':
				await commands.executeCommand('nodemcu-tools.uploadFileSetLfs', fileToUpload)
				break

			case 'compileFileAndUpload':
				await commands.executeCommand('nodemcu-tools.uploadFile', fileToUpload, [fileToUpload])
				break
		}
	}
}
