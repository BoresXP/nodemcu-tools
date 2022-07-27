import Fs from 'fs'
import Path from 'path'
import { extensions } from 'vscode'

const requireFunc: (name: string) => any = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require
const myExtId = 'boressoft.nodemcu-tools'

function loadSerialPort(): any {
	const myExtension = extensions.getExtension(myExtId)
	if (!myExtension?.extensionPath) {
		throw new Error(`Extension wit id ${myExtId} not found or path is empty`)
	}

	const fullPath = Path.join(myExtension.extensionPath, 'lib')

	const libDir = Fs.opendirSync(fullPath)
	try {
		let dirEntry: Fs.Dirent | null
		while (dirEntry = libDir.readSync()) { // eslint-disable-line no-cond-assign
			if (dirEntry.isFile() && dirEntry.name.endsWith('.node')) {
				try {
					console.log('Trying', dirEntry.name) // eslint-disable-line no-console
					const moduleFullPath = Path.join(fullPath, dirEntry.name)
					return requireFunc(moduleFullPath) // eslint-disable-line @typescript-eslint/no-unsafe-return
				} catch (e) {
					console.log('Failed to load', dirEntry.name, e) // eslint-disable-line no-console
				}
			}
		}
	} finally {
		libDir.closeSync()
	}

	console.error('Failed to load Serial Port Bindings') // eslint-disable-line no-console

	const errorFn = (): void => {
		throw new Error('SerialPort native binding not loaded')
	}
	return {
		open: errorFn,
		close: errorFn,
		read: errorFn,
		write: errorFn,
		update: errorFn,
		set: errorFn,
		get: errorFn,
		flush: errorFn,
		getBaudRate: errorFn,
		drain: errorFn,
		list: errorFn,
	}
}

export default function bindingsProxy(_path: string): any {
	return loadSerialPort()
}
