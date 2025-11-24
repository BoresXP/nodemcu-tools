import { EventEmitter, Uri, Event as VsEvent, commands, l10n, window, workspace } from 'vscode'

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
			this._outChannel.appendLine(l10n.t('The {0} config file does not exist', configFile))
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
				throw new Error(l10n.t('Mandatory option is missed'))
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
				this._outChannel.appendLine(l10n.t('Failed to parse ".nodemcutools". {0}', err.message))
				window.showWarningMessage(l10n.t('Failed to parse ".nodemcutools". {0}', err.message))
				return void 0
			}
		}

		this._outChannel.appendLine(l10n.t('The config file is OK.'))
		return this._config
	}

	private static async validateOption(opt: string, optVal: string | string[]): Promise<string | undefined> {
		const validate: ValidationMethod = {
			compilerExecutable: () => {
				if (typeof optVal !== 'string' || optVal.trimEnd() === '') {
					return l10n.t('No path to the luac.cross')
				}
			},
			include: async () => {
				if (typeof optVal !== 'object') {
					return l10n.t('The type of "Include" property must be an array of strings.')
				}
				for (const pattern of optVal) {
					let pathToCheck
					if (path.isAbsolute(pattern)) {
						pathToCheck = Uri.file(pattern)
					} else {
						pathToCheck = Uri.file(path.dirname(path.resolve(this._rootFolder.fsPath, pattern)))
					}
					if (!(await this.isExists(pathToCheck))) {
						return l10n.t('Include path "{0}" does not exist.', pathToCheck.path)
					}
				}
			},
			outDir: () => {
				if (typeof optVal !== 'string' || optVal.trimEnd() === '') {
					return l10n.t('Invalid folder name for "{0}".', opt)
				}
			},
			outFile: () => {
				if (typeof optVal !== 'string' || optVal.trimEnd() === '') {
					return l10n.t('Invalid file name for "{0}".', opt)
				}
			},
			resourceDir: async () => {
				if (typeof optVal !== 'string' || optVal.trimEnd() === '') {
					return l10n.t('Invalid folder name for "{0}".', opt)
				}
				const resourceFolder = Uri.joinPath(this._rootFolder, optVal)
				if (!(await ConfigFile.isExists(resourceFolder))) {
					return l10n.t('Path to the resource folder "{0}" was not found.', resourceFolder.path)
				}
			},
			default: () => l10n.t('Configuration has an unknown property "{0}".', opt),
		}

		return await (validate[opt] ?? validate.default)()
	}

	private static async createDirectory(folder: Uri): Promise<void> {
		try {
			await workspace.fs.createDirectory(folder)
			this._outChannel.appendLine(l10n.t('The {0} directory was created successfully.', folder.path))
		} catch {
			await window.showErrorMessage(l10n.t('Can not create the directory {0}', folder.path))
		}
	}
}
