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
	l10n,
	tasks,
	window,
	workspace,
} from 'vscode'

import { NodeMcuRepository } from '../nodemcu'
import { onResourceChange } from './MakeResource'

export interface INodemcuTaskDefinition extends TaskDefinition {
	taskName: string
	file?: string
}

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
		const commandLine = `${this._config.compilerExecutable} -o ${this._config.outDir}/${this._config.outFile} -f -l ${filesLFS} > ${this._config.outDir}/luaccross.log`

		const listTasks = [
			['buildLFSandUploadSerial', l10n.t('Build LFS and upload to device via serial port')],
			['buildLFS', l10n.t('Build LFS on host machine')],
		]
		const nodemcuTasks: Task[] = []

		listTasks.forEach(nextTask => {
			const nodemcuTaskDefinition: INodemcuTaskDefinition = {
				type: NodemcuTaskProvider.taskType,
				taskName: nextTask[0],
				file: this._config?.outFile,
			}

			const nodemcuTask = new Task(
				nodemcuTaskDefinition,
				TaskScope.Workspace,
				nextTask[1],
				NodemcuTaskProvider.taskType,
				new ShellExecution(commandLine),
			)
			nodemcuTask.group = TaskGroup.Build
			nodemcuTask.presentationOptions.reveal = TaskRevealKind.Silent

			nodemcuTasks.push(nodemcuTask)
		})

		return nodemcuTasks
	}

	private async endTaskHandler(event: TaskEndEvent): Promise<void> {
		const taskDefinition = event.execution.task.definition as INodemcuTaskDefinition
		if (NodeMcuRepository.allConnected.length <= 0 && taskDefinition.taskName.includes('Upload')) {
			window.showInformationMessage(l10n.t('No connected devices'))
			return
		}
		if (taskDefinition.type !== NodemcuTaskProvider.taskType || this._processExitCode !== 0 || !this._config) {
			return
		}

		const fileToUpload = Uri.joinPath(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			workspace.workspaceFolders![0].uri,
			this._config.outDir,
			taskDefinition.file ?? this._config.outFile,
		)

		switch (taskDefinition.taskName) {
			case 'buildLFSandUploadSerial':
				await commands.executeCommand('nodemcu-tools.uploadFileSetLfs', fileToUpload)
				break

			case 'compileFileAndUpload':
				await commands.executeCommand('nodemcu-tools.uploadFile', fileToUpload, [fileToUpload])
				break
		}
	}
}
