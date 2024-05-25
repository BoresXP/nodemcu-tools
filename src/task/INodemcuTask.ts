import { TaskDefinition } from 'vscode'

export interface INodemcuTaskDefinition extends TaskDefinition {
	nodemcuTaskName: string
	compilerExecutable: string
	include?: string[]
	outDir?: string
	outFile?: string
}

export interface IConfiguration {
	[index: string]: string | string[]
	compilerExecutable: string
	include: string[]
	outDir: string
	outFile: string
}
