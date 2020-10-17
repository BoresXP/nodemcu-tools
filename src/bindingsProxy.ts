import bindings, { BindingOptions } from 'bindings'

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
					console.log('Trying', dirEntry.name)
					const moduleFullPath = Path.join(fullPath, dirEntry.name)
					return requireFunc(moduleFullPath) // eslint-disable-line @typescript-eslint/no-unsafe-return
				} catch (e) {
					console.log('Failed to load', dirEntry.name, e)
				}
			}
		}

		throw new Error('No compatible serialport binary module found')
	} finally {
		libDir.closeSync()
	}
}

export function bindingsProxy(opts: string | BindingOptions): any {
	if (typeof opts === 'string' && opts === 'bindings.node') {
		return loadSerialPort() // eslint-disable-line @typescript-eslint/no-unsafe-return
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
	return bindings(opts)
}
