import { TaskDefinition } from 'vscode'

interface INodemcuTaskDefinition extends TaskDefinition {
	nodemcuTaskName: string
}

export interface IConfiguration {
	[index: string]: string | string[]
	compilerExecutable: string
	include: string[]
	outDir: string
	outFile: string
	resourceDir: string
}

export type NodemcuTaskDefinition = INodemcuTaskDefinition &
	Pick<IConfiguration, 'compilerExecutable' | 'include' | 'outDir' | 'outFile'>
