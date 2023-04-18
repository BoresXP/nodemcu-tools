import { IConfiguration, INodemcuTaskDefinition } from './INodemcuTask'
import { OutputChannel, Uri, window, workspace } from 'vscode'
import path = require('path')

let outChannel: OutputChannel

export async function getConfig(rootFolder: string, configFile: string): Promise<IConfiguration | undefined> {
	outChannel = getOutputChannel()

	if (!(await isExists(configFile))) {
		return void 0
	}

	const definition: IConfiguration = {
		compilerExecutable: '',
		include: ['./lfs/*.lua'],
		outDir: 'out',
		outFile: 'lfs.img',
	}

	let userConfig: INodemcuTaskDefinition

	try {
		const configData = await workspace.fs.readFile(Uri.file(configFile))
		const readStr = Buffer.from(configData).toString('utf8')

		userConfig = <INodemcuTaskDefinition>JSON.parse(readStr)

		if (!('compilerExecutable' in userConfig)) {
			await displayError(new Error('.nodemcutools: No path to the luac.cross'))
			return void 0
		}
		definition.compilerExecutable = userConfig.compilerExecutable

		if ('outDir' in userConfig) {
			definition.outDir = userConfig.outDir as string
		}
		if (
			!(await isExists(path.join(rootFolder, definition.outDir))) &&
			!(await createDirectory(path.join(rootFolder, definition.outDir)))
		) {
			return void 0
		}

		if ('include' in userConfig) {
			definition.include = userConfig.include as string[]
		}
		for (const pattern of definition.include) {
			const pathToCheck = path.dirname(path.resolve(rootFolder, pattern))
			if (!(await isExists(pathToCheck))) {
				await displayError(new Error(`.nodemcutools: Include path "${pathToCheck}" is not found.`))
				return void 0
			}
		}

		if ('outFile' in userConfig) {
			definition.outFile = userConfig.outFile as string
		}
	} catch (error) {
		await displayError(new Error('.nodemcutools: Error in config file'))

		return void 0
	}

	return definition
}

async function isExists(f: string): Promise<boolean> {
	try {
		await workspace.fs.stat(Uri.file(f))
		return true
	} catch (err) {
		outChannel.appendLine(`.nodemcutools: The "${f}" does not exists.`)
		outChannel.show(true)
		return false
	}
}

async function createDirectory(folder: string): Promise<boolean> {
	try {
		await workspace.fs.createDirectory(Uri.file(folder))
		outChannel.appendLine(`The "${folder}" directory was created successfully.`)
		outChannel.show(true)
		return true
	} catch (err) {
		await displayError(new Error(`Can not create the directory "${folder}"`))
		return false
	}
}

function getOutputChannel(): OutputChannel {
	if (!outChannel) {
		outChannel = window.createOutputChannel('nodemcu-tools')
	}

	return outChannel
}

async function showGenericErrorNotification(): Promise<void> {
	await window.showWarningMessage(
		'An Error occurred in the nodemcu-tools extension. See the output for more information.',
		'Go to output',
	)

	getOutputChannel().show(true)
}

async function displayError(errorThrown: Error): Promise<void> {
	const { message } = errorThrown

	outChannel.appendLine(message)
	await showGenericErrorNotification()
}
