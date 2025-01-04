import { OutputChannel, Uri, commands, window, workspace } from 'vscode'
import { displayError, getOutputChannel } from './OutputChannel'

import { IConfiguration } from './INodemcuTask'
import path from 'path'

type ValidationMethod = Record<string, () => void | Promise<void>>

class ValidationError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ValidationError'
	}
}

let outChannel: OutputChannel

export async function getConfig(rootFolder: string, configFileName: string): Promise<IConfiguration | undefined> {
	outChannel = getOutputChannel()
	await commands.executeCommand('setContext', 'nodemcu-tools:hasConfig', false)

	if (!(await isExists(configFileName))) {
		outChannel.appendLine(`No config file '${configFileName}'`)
		return void 0
	}

	const config: IConfiguration = {
		compilerExecutable: '',
		include: [],
		outDir: 'out',
		outFile: 'lfs.img',
		resourceDir: '',
	}

	try {
		const data = await workspace.fs.readFile(Uri.file(configFileName))
		const userConfig = JSON.parse(Buffer.from(data).toString('utf8')) as IConfiguration

		for (const option in userConfig) {
			await validateOption(userConfig, option, rootFolder)
			config[option] = userConfig[option]
		}
	} catch (error) {
		if (error instanceof ValidationError) {
			await window.showErrorMessage(`Failed to parse ".nodemcutools". ${error.message}`)
			return void 0
		}
		await displayError(error as Error)
		return void 0
	}

	await createDirectory(path.join(rootFolder, config.outDir))
	await commands.executeCommand('setContext', 'nodemcu-tools:hasConfig', true)
	return config
}

async function isExists(f: string): Promise<boolean> {
	try {
		await workspace.fs.stat(Uri.file(f))
		return true
	} catch {
		return false
	}
}

async function createDirectory(folder: string): Promise<void> {
	if (await isExists(folder)) {
		return
	}

	try {
		await workspace.fs.createDirectory(Uri.file(folder))
		outChannel.appendLine(`The '${folder}' directory was created successfully.`)
		outChannel.show(true)
	} catch {
		await displayError(new Error(`Can not create the directory '${folder}'`))
	}
}

async function validateOption(userConfig: IConfiguration, option: string, rootFolder: string): Promise<void> {
	let errMessage = ''

	const validate: ValidationMethod = {
		compilerExecutable: () => {
			if (userConfig.compilerExecutable.trimEnd() === '') {
				errMessage = 'No path to the luac.cross'
			}
		},
		include: async () => {
			for (const pattern of userConfig.include) {
				const pathToCheck = path.dirname(path.resolve(rootFolder, pattern))
				if (!(await isExists(pathToCheck))) {
					errMessage = `Include path '${pathToCheck}' is not found.`
				}
			}
		},
		outDir: () => {
			if (userConfig.outDir.trimEnd() === '') {
				errMessage = `Invalid folder name for '${option}'`
			}
		},
		outFile: () => {
			if (userConfig.outFile.trimEnd() === '') {
				errMessage = `Invalid file name for '${option}'`
			}
		},
		resourceDir: async () => {
			if (userConfig.resourceDir.trimEnd() === '') {
				errMessage = `Invalid folder name for '${option}'`
			}
			if (!(await isExists(path.join(rootFolder, userConfig.resourceDir)))) {
				errMessage = `Path to the resource folder '${userConfig.resourceDir}' is not found.`
			}
		},
		default: () => {
			errMessage = `Unknown property '${option}' in config file`
		},
	}

	await (validate[option] ?? validate.default)()
	if (errMessage) {
		throw new ValidationError(errMessage)
	}
}
