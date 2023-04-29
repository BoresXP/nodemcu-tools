import {
	FileSystemError,
	OutputChannel,
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
import { IConfiguration, INodemcuTaskDefinition } from './INodemcuTask'
import { NodeMcuRepository } from '../nodemcu'
import { getConfig } from './ConfigFile'
import { getOutputChannel } from './getOutputChannel'
import path from 'path'

export default class NodemcuTaskProvider implements TaskProvider {
	static taskType = 'NodeMCU'
	outChannel: OutputChannel
	private _config: IConfiguration | undefined
	private _tasks: Task[] | undefined = void 0
	private readonly _configFile: string
	private readonly _rootFolder: string

	constructor() {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this._rootFolder = workspace.workspaceFolders![0].uri.fsPath
		this._configFile = path.join(this._rootFolder, '.nodemcutools')

		const fileWatcher = workspace.createFileSystemWatcher(this._configFile)
		fileWatcher.onDidChange(() => (this._tasks = void 0))
		fileWatcher.onDidCreate(() => (this._tasks = void 0))
		fileWatcher.onDidDelete(() => (this._tasks = void 0))

		tasks.onDidEndTask(event => this.endTaskHandler(event))
		this.outChannel = getOutputChannel()
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

		const nodemcuTaskDefinition: INodemcuTaskDefinition = {
			type: NodemcuTaskProvider.taskType,
			nodemcuTaskName: 'buildLfs',
			compilerExecutable: this._config.compilerExecutable,
			include: this._config.include,
			outDir: this._config.outDir,
			outFile: this._config.outFile,
		}
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const filesLFS = this.getFilesLFS(nodemcuTaskDefinition.include!)

		const commandLine = `${nodemcuTaskDefinition.compilerExecutable} -o ${nodemcuTaskDefinition.outDir}/${nodemcuTaskDefinition.outFile} -f -l ${filesLFS} > ${nodemcuTaskDefinition.outDir}/luaccross.log`

		const nodemcuTask = new Task(
			nodemcuTaskDefinition,
			TaskScope.Workspace,
			'Build LFS and upload to device via serial port',
			nodemcuTaskDefinition.type,
			new ShellExecution(commandLine),
		)
		nodemcuTask.group = TaskGroup.Build
		nodemcuTask.presentationOptions.reveal = TaskRevealKind.Silent

		nodemcuTasks.push(nodemcuTask)
		return nodemcuTasks
	}

	private getFilesLFS(include: string[]): string {
		return include.join(' ')
	}

	private async endTaskHandler(event: TaskEndEvent): Promise<void> {
		const taskDefinition = event.execution.task.definition
		if (taskDefinition.type !== NodemcuTaskProvider.taskType || !(NodeMcuRepository.allConnected.length > 0)) {
			return
		}

		const fileToUpload = Uri.joinPath(
			Uri.file(this._rootFolder),
			taskDefinition.outDir as string,
			taskDefinition.outFile as string,
		)
		try {
			await workspace.fs.stat(fileToUpload)
		} catch (err) {
			if (err instanceof FileSystemError) {
				this.outChannel.appendLine(`Uploading ${err.message}`)
				this.outChannel.show(true)
			}
			return
		}

		switch (taskDefinition.nodemcuTaskName) {
			case 'buildLfs':
				await commands.executeCommand('nodemcu-tools.uploadFileSetLfs', fileToUpload)
				break

			case 'compileFile':
				await commands.executeCommand('nodemcu-tools.uploadFile', fileToUpload, [fileToUpload])
				break

			default:
				this.outChannel.appendLine('Unknown nodemcu task name')
				this.outChannel.show(true)
		}

		const fileNewName = Uri.joinPath(
			Uri.file(this._rootFolder),
			taskDefinition.outDir as string,
			`${taskDefinition.outFile}.old`,
		)

		try {
			await workspace.fs.rename(fileToUpload, fileNewName, { overwrite: true })
		} catch (err) {
			if (err instanceof FileSystemError) {
				this.outChannel.appendLine(`Appending .old to the file name. ${err.message}`)
				this.outChannel.show(true)
			}
		}
	}
}
