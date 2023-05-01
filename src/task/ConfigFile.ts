import { IConfiguration, INodemcuTaskDefinition } from './INodemcuTask'
import { OutputChannel, Uri, commands, window, workspace } from 'vscode'
import { getOutputChannel } from './getOutputChannel'
import path = require('path')

let outChannel: OutputChannel

export async function getConfig(
	rootFolder: string,
	configFile: string,
	revealMessage = true,
): Promise<IConfiguration | undefined> {
	outChannel = getOutputChannel()
	await commands.executeCommand('setContext', 'nodemcu-tools:isConfig', false)

	if (!(await isExists(configFile, revealMessage))) {
		return void 0
	}

	const config: IConfiguration = {
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
			await displayError(new Error('No path to the luac.cross'))
			return void 0
		}
		config.compilerExecutable = userConfig.compilerExecutable

		if ('outDir' in userConfig) {
			config.outDir = userConfig.outDir as string
		}
		if (
			!(await isExists(path.join(rootFolder, config.outDir))) &&
			!(await createDirectory(path.join(rootFolder, config.outDir)))
		) {
			return void 0
		}

		if ('include' in userConfig) {
			config.include = userConfig.include as string[]
		}
		for (const pattern of config.include) {
			const pathToCheck = path.dirname(path.resolve(rootFolder, pattern))
			if (!(await isExists(pathToCheck))) {
				await displayError(new Error(`Include path '${pathToCheck}' is not found.`))
				return void 0
			}
		}

		if ('outFile' in userConfig) {
			config.outFile = userConfig.outFile as string
		}
	} catch (error) {
		await displayError(new Error('Error in config file'))

		return void 0
	}

	await commands.executeCommand('setContext', 'nodemcu-tools:isConfig', true)
	return config
}

async function isExists(f: string, revealMessage = true): Promise<boolean> {
	try {
		await workspace.fs.stat(Uri.file(f))
		return true
	} catch (err) {
		if (revealMessage) {
			outChannel.appendLine(`Error: no such file or directory '${f}'`)
			outChannel.show(true)
		}
		return false
	}
}

async function createDirectory(folder: string): Promise<boolean> {
	try {
		await workspace.fs.createDirectory(Uri.file(folder))
		outChannel.appendLine(`The '${folder}' directory was created successfully.`)
		outChannel.show(true)
		return true
	} catch (err) {
		await displayError(new Error(`Can not create the directory '${folder}'`))
		return false
	}
}

async function showGenericErrorNotification(): Promise<void> {
	await window.showWarningMessage(
		'An Error occurred in the nodemcu-tools extension. See the output for more information.',
		'Go to output',
	)

	outChannel.show(true)
}

async function displayError(errorThrown: Error): Promise<void> {
	const { message } = errorThrown

	outChannel.appendLine(message)
	await showGenericErrorNotification()
}
