import { OutputChannel, Uri, commands, window, workspace } from 'vscode'
import { displayError, getOutputChannel } from './OutputChannel'

import { IConfiguration } from './INodemcuTask'
import path from 'path'

let outChannel: OutputChannel

export async function getConfig(
	rootFolder: string,
	configFileName: string,
	revealMessage = true,
): Promise<IConfiguration | undefined> {
	outChannel = getOutputChannel()
	await commands.executeCommand('setContext', 'nodemcu-tools:isConfig', false)

	if (!(await isExists(configFileName, revealMessage))) {
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

		for (const prop in userConfig) {
			if (prop in config && userConfig[prop]) {
				config[prop] = userConfig[prop]
			}

			switch (prop) {
				case 'compilerExecutable':
					if (config.compilerExecutable.trimEnd() === '') {
						await displayError(new Error('No path to the luac.cross'))
						return void 0
					}
					break
				case 'outDir': {
					if (config.outDir.trimEnd() === '') {
						await displayError(new Error(`Invalid folder name for '${prop}'`))
						return void 0
					}
					break
				}
				case 'outFile':
					if (config.outFile.trimEnd() === '') {
						await displayError(new Error(`Invalid file name for '${prop}'`))
						return void 0
					}
					break
				case 'include':
					for (const pattern of config.include) {
						const pathToCheck = path.dirname(path.resolve(rootFolder, pattern))
						if (!(await isExists(pathToCheck))) {
							await displayError(new Error(`Include path '${pathToCheck}' is not found.`))
							return void 0
						}
					}
					break
				case 'resourceDir':
					if (config.resourceDir.trimEnd() === '') {
						await displayError(new Error(`Invalid folder name for '${prop}'`))
						return void 0
					}
					if (!(await isExists(path.join(rootFolder, config.resourceDir)))) {
						await displayError(new Error(`Path to the resource folder '${config.resourceDir}' is not found.`))
						return void 0
					}
					break
				default:
					await displayError(new Error(`Unknown property '${prop}' in config file`))
					break
			}

			if (!(await isExists(path.join(rootFolder, config.outDir)))) {
				try {
					await createDirectory(path.join(rootFolder, config.outDir))
				} catch {
					await displayError(new Error(`Can not create the directory '${config.outDir}'`))
					return void 0
				}
			}
		}
	} catch (error) {
		await window.showErrorMessage(`Failed to parse ".nodemcutools". ${error}`)
		return void 0
	}

	await commands.executeCommand('setContext', 'nodemcu-tools:isConfig', true)
	return config
}

async function isExists(f: string, revealMessage = true): Promise<boolean> {
	try {
		await workspace.fs.stat(Uri.file(f))
		return true
	} catch (ignoreErr) {
		if (revealMessage) {
			outChannel.appendLine(`No such file or directory '${f}'`)
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
	} catch (ignoreErr) {
		return false
	}
}
