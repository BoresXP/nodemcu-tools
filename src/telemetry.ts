import TelemetryReporter from 'vscode-extension-telemetry'
import { extensions } from 'vscode'

interface PackageJson {
	name: string
	publisher: string
	displayName: string
	description: string
	version: string
	author: {
		name: string
		email: string
	}
	license: string
}

const myExtId = 'boressoft.nodemcu-tools'
const tmKey = 'ZDU3MjQxZjktZDJlZi00Zjg2LWFlODUtMzQ3ZjU0M2MzYzdm'
let telemetryReporter: TelemetryReporter

export function getTelemetryReporter(): TelemetryReporter {
	if (!telemetryReporter) {
		const myExtension = extensions.getExtension(myExtId)
		const packageJson = myExtension?.packageJSON as PackageJson

		const tmKeyClear = Buffer.from(tmKey, 'base64').toString()

		telemetryReporter = new TelemetryReporter(myExtId, packageJson.version, tmKeyClear)
	}

	return telemetryReporter
}
