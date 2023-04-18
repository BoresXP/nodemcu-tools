import { TaskDefinition } from 'vscode'

export interface INodemcuTaskDefinition extends TaskDefinition {
	task: string
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
