import { FileType, Uri, window, workspace } from 'vscode'
import { join, posix } from 'path'

import { IConfiguration } from './INodemcuTask'
import { displayError } from "./OutputChannel"

export async function makeResource(config: IConfiguration): Promise<Uri | undefined> {
	const [rootFolder] = workspace.workspaceFolders!
	const fileToWrite = Uri.joinPath(rootFolder.uri, config.outDir, 'resource.lua')
	const resourceFolder = Uri.joinPath(rootFolder.uri, config.resourceDir)
	const fileNames = await getFilesListFromFolder(resourceFolder)
	if (!fileNames) {
		return void 0
	}

	async function preprocessLua(listOfResourceFiles: string[]): Promise<Buffer | void> {
		let content = Buffer.from('--  luacheck: max line length 10000\nlocal arg = ...\n')
		const files = listOfResourceFiles.map(fileName =>
			workspace.fs.readFile(Uri.joinPath(rootFolder.uri, config.resourceDir, fileName)),
		)

		const data = await Promise.all(files)
		for (let i = 0; i < listOfResourceFiles.length; i++) {
			const fileName = listOfResourceFiles[i]
			// (if arg == "%s" then return %q end\n\n'):format(fileName, content)
			const bodyHead = Buffer.from(`if arg == "${fileName}" then return `)
			const body = emulateLuaQoption(data[i])
			const bodyTail = Buffer.from(' end\n\n')
			content = Buffer.concat([content, bodyHead, body, bodyTail])
		}

		// ('if arg == nil then return {%s} end\n'):format(filelist)
		const filesList = listOfResourceFiles.map(fn => `"${fn}"`).join(', ')
		const filesLFS = Buffer.from(`if arg == nil then return {${filesList}} end\n`)
		content = Buffer.concat([content, filesLFS])
		return content
	}

	try {
		const content = await preprocessLua(fileNames)
		if (content) {
			await workspace.fs.writeFile(fileToWrite, content)
			return fileToWrite
		}
	} catch (err) {
		try {
			await workspace.fs.stat(fileToWrite)
			await workspace.fs.delete(fileToWrite)
		} catch {
			return void 0
		}
		await displayError(err as Error)
		return void 0
	}
}

async function getFilesListFromFolder(folder: Uri): Promise<string[]> {
	const files: string[] = []
	const fType = (await workspace.fs.stat(folder)).type
	if (fType !== FileType.Directory) {
		return files
	}

	await dive(folder)
	return files

	async function dive(nextFolder: Uri, depth = 1): Promise<void> {
		const items = await workspace.fs.readDirectory(nextFolder)
		for (const [name, type] of items) {
			if (type === FileType.File) {
				const filePath = posix.join(nextFolder.path, name)
				const fileName = filePath.split('/').slice(-depth).join('/')
				files.push(fileName)
			} else if (type === FileType.Directory) {
				await dive(Uri.file(join(nextFolder.path, name)), ++depth)
				depth--
			} else if (type === FileType.SymbolicLink) {
				await window.showErrorMessage(`Symbolic links in the resource folder are not supported`)
			}
		}
	}
}


function emulateLuaQoption(data: Uint8Array): Buffer {
	let buf: Buffer
	let result = Buffer.from('"')
	for (let i = 0; i < data.length; i++) {
		const s = data[i]
		// It puts a backslash in front of the double quote character (hex 22), backslash itself (hex 5C), and newline (hex 0A).
		if (s === 0x22 || s === 0x5c || s === 0x0a) {
			buf = Buffer.from([0x5c, s])
		} else if ((s >= 0 && s <= 0x1f) || s === 0x7f) { // control characters
			const sStr = s.toString(10)
			if (!(data[i + 1] >= 0x30 && data[i + 1] <= 0x39)) { // next char is not digit
				buf = Buffer.from(`\\${sStr}`)
			} else {
				buf = Buffer.from('\\000')
				buf.write(sStr, buf.length - sStr.length)
			}
		} else {
			buf = Buffer.from([s])
		}
		result = Buffer.concat([result, buf])
	}
	result = Buffer.concat([result, Buffer.from('"')])
	return result
}
