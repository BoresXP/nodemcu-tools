import ConfigFile, { IConfig } from './ConfigFile'
import {
	ShellExecution,
	Task,
	TaskDefinition,
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
import { onResourceChange } from './MakeResource'

interface INodemcuTaskDefinition extends TaskDefinition {
	nodemcuTaskName: string
}

export type NodemcuTaskDefinition = INodemcuTaskDefinition &
	Pick<IConfig, 'compilerExecutable' | 'include' | 'outDir' | 'outFile'>

export default class NodemcuTaskProvider implements TaskProvider {
	static readonly taskType = 'NodeMCU'
	private _tasks: Task[] | undefined = void 0
	private _processExitCode: number | undefined
	private _config: IConfig | undefined = void 0
	private _resourceFile: string | undefined = void 0

	constructor() {
		tasks.onDidEndTaskProcess(event => (this._processExitCode = event.exitCode))
		tasks.onDidEndTask(event => this.endTaskHandler(event))

		ConfigFile.onConfigChange(config => {
			this._config = config
			this._tasks = void 0
			this.provideTasks()
		})

		onResourceChange()(resourceFile => {
			this._resourceFile = resourceFile
			this._tasks = void 0
			this.provideTasks()
		})
	}

	public resolveTask(_task: Task): Task | undefined {
		return void 0
	}

	public provideTasks(): Task[] | undefined {
		if (!this._tasks && this._config) {
			this._tasks = this.getTasks()
		}

		return this._tasks
	}

	private getTasks(): Task[] | undefined {
		if (!this._config) {
			return void 0
		}

		const filesLFS = this._resourceFile
			? this._config.include.join(' ') + ' ' + this._resourceFile // add resource.lua to LFS image build
			: this._config.include.join(' ')

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

	private async endTaskHandler(event: TaskEndEvent): Promise<void> {
		const taskDefinition = event.execution.task.definition as NodemcuTaskDefinition
		if (
			taskDefinition.type !== NodemcuTaskProvider.taskType ||
			NodeMcuRepository.allConnected.length <= 0 ||
			this._processExitCode !== 0
		) {
			return
		}

		const fileToUpload = Uri.joinPath(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			workspace.workspaceFolders![0].uri,
			taskDefinition.outDir,
			taskDefinition.outFile,
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
