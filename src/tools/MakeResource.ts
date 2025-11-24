import ConfigFile, { IConfig } from './ConfigFile'
import {
	EventEmitter,
	FileSystemWatcher,
	FileType,
	RelativePattern,
	Uri,
	Event as VsEvent,
	l10n,
	window,
	workspace,
} from 'vscode'
import path, { posix } from 'path'

import { getOutputChannel } from './OutputChannel'

type NonUndefined<T> = { [K in keyof T]: Exclude<T[K], undefined> }
type ResourceConfig = Pick<NonUndefined<IConfig>, 'outDir' | 'resourceDir'>

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const rootFolder = workspace.workspaceFolders![0].uri
const evtResourceChange = new EventEmitter<void>()
const evtResourceReady = new EventEmitter<string | undefined>()
const outChannel = getOutputChannel()
let fireSoonHandle: NodeJS.Timeout
let resourceFolderWatcher: FileSystemWatcher | undefined = void 0
let currentResourceDir: string | undefined = void 0

export function makeResourceInit(): void {
	ConfigFile.onConfigChange(config => buildResource(config))
}

export function onResourceChange(): VsEvent<string | undefined> {
	return evtResourceReady.event
}

async function buildResource(config: IConfig | undefined): Promise<void> {
	if (!config || config.resourceDir === currentResourceDir) {
		return
	}
	currentResourceDir = config.resourceDir
	if (resourceFolderWatcher) {
		resourceFolderWatcher.dispose()
	}
	if (!config.resourceDir) {
		evtResourceReady.fire(void 0)
		return
	}

	setResourceWatcher(config as ResourceConfig)
	evtResourceChange.event(() => rebuildResource(config as ResourceConfig))
	await rebuildResource(config as ResourceConfig)
}

function setResourceWatcher(config: ResourceConfig): void {
	const pathToResourceFolder = Uri.joinPath(rootFolder, config.resourceDir)
	const resourcePattern = new RelativePattern(pathToResourceFolder, '**')
	resourceFolderWatcher = workspace.createFileSystemWatcher(resourcePattern)
	resourceFolderWatcher.onDidChange(() => fireSoon())
	resourceFolderWatcher.onDidCreate(() => fireSoon())
	resourceFolderWatcher.onDidDelete(() => fireSoon())
}

function fireSoon(): void {
	if (fireSoonHandle) {
		clearTimeout(fireSoonHandle)
	}
	fireSoonHandle = setTimeout(() => {
		evtResourceChange.fire()
	}, 250)
}

async function rebuildResource(config: ResourceConfig): Promise<void> {
	const resourceFile = await makeResource(config)
	evtResourceReady.fire(resourceFile)
}

async function makeResource(config: ResourceConfig): Promise<string | undefined> {
	const relativeResourceFileName = path.join(config.outDir, 'resource.lua')
	const fileToWrite = Uri.joinPath(rootFolder, relativeResourceFileName)
	const resourceFolder = Uri.joinPath(rootFolder, config.resourceDir)

	try {
		if (!(await ConfigFile.isExists(Uri.joinPath(resourceFolder)))) {
			outChannel.appendLine(l10n.t('Path to the resource folder "{0}" was not found.', resourceFolder.path))
			return void 0
		}
		const fileNames = await getFilesListFromFolder(resourceFolder)
		const content = await preprocessLua(resourceFolder, fileNames)
		await workspace.fs.writeFile(fileToWrite, content)
	} catch (err) {
		if (err instanceof Error) {
			window.showWarningMessage(err.message)
		}
		return void 0
	}

	return relativeResourceFileName
}

async function getFilesListFromFolder(nextFolder: Uri, depth = 1, files: string[] = []): Promise<string[]> {
	const items = await workspace.fs.readDirectory(nextFolder)
	for (const [name, type] of items) {
		if (type === FileType.File) {
			const filePath = posix.join(nextFolder.path, name)
			const fileName = filePath.split('/').slice(-depth).join('/')
			files.push(fileName)
		} else if (type === FileType.Directory) {
			await getFilesListFromFolder(Uri.joinPath(nextFolder, name), ++depth, files)
			depth--
		} else if (type === FileType.SymbolicLink) {
			window.showErrorMessage(l10n.t('Symbolic links in the resource folder are not supported'))
		}
	}

	return files
}

async function preprocessLua(resourceFolder: Uri, listOfResourceFiles: string[]): Promise<Buffer> {
	let content = Buffer.from('--  luacheck: max line length 10000\nlocal arg = ...\n')
	const files = listOfResourceFiles.map(fileName => workspace.fs.readFile(Uri.joinPath(resourceFolder, fileName)))

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

function emulateLuaQoption(data: Uint8Array): Buffer {
	let buf: Buffer
	let result = Buffer.from('"')
	for (let i = 0; i < data.length; i++) {
		const s = data[i]
		// It puts a backslash in front of the double quote character (hex 22), backslash itself (hex 5C), and newline (hex 0A).
		if (s === 0x22 || s === 0x5c || s === 0x0a) {
			buf = Buffer.from([0x5c, s])
		} else if ((s >= 0 && s <= 0x1f) || s === 0x7f) {
			// control characters
			const sStr = s.toString(10)
			if (!(data[i + 1] >= 0x30 && data[i + 1] <= 0x39)) {
				// next char is not digit
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
