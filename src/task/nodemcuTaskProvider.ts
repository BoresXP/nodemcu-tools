import { IConfiguration, INodemcuTaskDefinition } from './INodemcuTask'
import { ShellExecution, Task, TaskEndEvent, TaskProvider, TaskScope, Uri, commands, tasks, workspace } from 'vscode'
import { NodeMcuRepository } from '../nodemcu'
import { getConfig } from './ConfigFile'
import path from 'path'

export default class NodemcuTaskProvider implements TaskProvider {
	static taskType = 'NodeMCU'
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
		const nodemcuTasks: Task[] = []

		if (!this._rootFolder) {
			return void 0
		}
		const config: IConfiguration | undefined = await getConfig(this._rootFolder, this._configFile)
		if (!config) {
			return nodemcuTasks
		}

		const definition: INodemcuTaskDefinition = {
			type: NodemcuTaskProvider.taskType,
			task: 'buildLfs',
			compilerExecutable: config.compilerExecutable,
			include: config.include,
			outDir: config.outDir,
			outFile: config.outFile,
		}
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const filesLFS = this.getFilesLFS(definition.include!)
		const commandLine = `${definition.compilerExecutable} -o ${definition.outDir}/${definition.outFile} -f -l ${filesLFS} > ${definition.outDir}/luaccross.log`

		const task = new Task(
			definition,
			TaskScope.Workspace,
			'Builds LFS and upload to device',
			definition.type,
			new ShellExecution(commandLine),
		)

		nodemcuTasks.push(task)
		return nodemcuTasks
	}

	private getFilesLFS(include: string[]): string {
		return include.join(' ')
	}

	private async endTaskHandler(event: TaskEndEvent): Promise<void> {
		const taskDefinition = event.execution.task.definition
		if (taskDefinition.type === NodemcuTaskProvider.taskType) {
			const lfsImg = Uri.joinPath(
				Uri.file(this._rootFolder),
				taskDefinition.outDir as string,
				taskDefinition.outFile as string,
			)

			if (NodeMcuRepository.allConnected.length > 0) {
				await commands.executeCommand('nodemcu-tools.uploadFileSetLfs', lfsImg)
			}
		}
	}
}
