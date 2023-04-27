import { TaskDefinition } from 'vscode'

export interface INodemcuTaskDefinition extends TaskDefinition {
	nodemcuTaskName: string
	compilerExecutable: string
	include?: string[]
	outDir?: string
	outFile?: string
}

export interface IConfiguration {
	compilerExecutable: string
	include: string[]
	outDir: string
	outFile: string
}
