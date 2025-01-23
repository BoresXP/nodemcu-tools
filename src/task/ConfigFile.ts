import { EventEmitter, Uri, Event as VsEvent, commands, window, workspace } from 'vscode'

import { getOutputChannel } from './OutputChannel'
import { makeResourceInit } from './MakeResource'
import path from 'path'

type IConfigFile = Record<string, string | string[]>
type ValidationMethod = Record<string, () => undefined | string | Promise<undefined | string>>

export interface IConfig {
	compilerExecutable: string
	include: string[]
	outDir: string
	outFile: string
	resourceDir: string | undefined
}

export default class ConfigFile {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	private static readonly _rootFolder = workspace.workspaceFolders![0].uri
	private static readonly _evtConfigChange = new EventEmitter<IConfig | undefined>()
	private static readonly _outChannel = getOutputChannel()
	private static _fireSoonHandle: NodeJS.Timeout
	private static _config: IConfig = {
		compilerExecutable: '',
		include: [],
		outDir: 'out',
		outFile: 'lfs.img',
		resourceDir: void 0,
	}

	public static get actualConfig(): IConfig | undefined {
		return this._config
	}

	public static get onConfigChange(): VsEvent<IConfig | undefined> {
		return this._evtConfigChange.event
	}

	public static async isExists(f: Uri): Promise<boolean> {
		try {
			await workspace.fs.stat(f)
			return true
		} catch {
			return false
		}
	}

	public static async initConfig(): Promise<void> {
		makeResourceInit()

		const configFileName = path.join(this._rootFolder.fsPath, '.nodemcutools')
		const fileWatcher = workspace.createFileSystemWatcher(configFileName)
		fileWatcher.onDidChange(configFile => this.fireSoon(configFile))
		fileWatcher.onDidCreate(configFile => this.fireSoon(configFile))
		fileWatcher.onDidDelete(configFile => this.fireSoon(configFile))

		await this.rebuildConfig(Uri.file(configFileName))
	}

	private static fireSoon(configFile: Uri): void {
		if (this._fireSoonHandle) {
			clearTimeout(this._fireSoonHandle)
		}

		this._fireSoonHandle = setTimeout(() => {
			void (async () => await this.rebuildConfig(configFile))()
		}, 150)
	}

	private static async rebuildConfig(configFile: Uri): Promise<void> {
		await commands.executeCommand('setContext', 'nodemcu-tools:hasConfig', false)
		const configContent = await this.getConfig(configFile)
		if (configContent) {
			const outDir = Uri.joinPath(this._rootFolder, this._config.outDir)
			if (!(await this.isExists(outDir))) {
				await this.createDirectory(outDir)
			}

			await commands.executeCommand('setContext', 'nodemcu-tools:hasConfig', true)
		}

		this._evtConfigChange.fire(configContent)
	}

	private static async getConfig(configFile: Uri): Promise<IConfig | undefined> {
		if (!(await this.isExists(configFile))) {
			this._outChannel.appendLine(`'${configFile}' config file does not exist`)
			return void 0
		}

		this._config = {
			compilerExecutable: '',
			include: [],
			outDir: 'out',
			outFile: 'lfs.img',
			resourceDir: void 0,
		}
		try {
			const data = await workspace.fs.readFile(configFile)
			const userConfig = JSON.parse(Buffer.from(data).toString('utf8')) as IConfigFile

			if (!('compilerExecutable' in userConfig && 'include' in userConfig)) {
				throw new Error('Mandatory option is missed')
			}

			for (const [option, optionValue] of Object.entries(userConfig)) {
				const errorMessage = await this.validateOption(option, optionValue)
				if (errorMessage) {
					throw new Error(errorMessage)
				}
				this._config[option as keyof IConfig] = optionValue as never
			}
		} catch (err) {
			if (err instanceof Error) {
				this._outChannel.appendLine(`Failed to parse ".nodemcutools". ${err.message}`)
				window.showWarningMessage(`Failed to parse ".nodemcutools". ${err.message}`)
				return void 0
			}
		}

		this._outChannel.appendLine('The config file is OK.')
		return this._config
	}

	private static async validateOption(opt: string, optVal: string | string[]): Promise<string | undefined> {
		const validate: ValidationMethod = {
			compilerExecutable: () => {
				if (typeof optVal !== 'string' || optVal.trimEnd() === '') {
					return 'No path to the luac.cross'
				}
			},
			include: async () => {
				if (typeof optVal !== 'object') {
					return 'The "Include" property type must be an array of strings.'
				}
				for (const pattern of optVal) {
					let pathToCheck
					if (path.isAbsolute(pattern)) {
						pathToCheck = Uri.file(pattern)
					} else {
						pathToCheck = Uri.file(path.dirname(path.resolve(this._rootFolder.fsPath, pattern)))
					}
					if (!(await this.isExists(pathToCheck))) {
						return `Include path '${pathToCheck.path}' does not exist.`
					}
				}
			},
			outDir: () => {
				if (typeof optVal !== 'string' || optVal.trimEnd() === '') {
					return `Invalid folder name for '${opt}.'`
				}
			},
			outFile: () => {
				if (typeof optVal !== 'string' || optVal.trimEnd() === '') {
					return `Invalid file name for '${opt}'.`
				}
			},
			resourceDir: async () => {
				if (typeof optVal !== 'string' || optVal.trimEnd() === '') {
					return `Invalid folder name for '${opt}'.`
				}
				const resourceFolder = Uri.joinPath(this._rootFolder, optVal)
				if (!(await ConfigFile.isExists(resourceFolder))) {
					return `Path to the resource folder '${resourceFolder.path}' was not found.`
				}
			},
			default: () => `Configuration has an unknown property '${opt}'.`,
		}

		return await (validate[opt] ?? validate.default)()
	}

	private static async createDirectory(folder: Uri): Promise<void> {
		try {
			await workspace.fs.createDirectory(folder)
			this._outChannel.appendLine(`The '${folder.path}' directory was created successfully.`)
		} catch {
			await window.showErrorMessage(`Can not create the directory '${folder.path}'`)
		}
	}
}
