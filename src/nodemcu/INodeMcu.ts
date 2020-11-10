import { Event } from 'vscode'
import NodeMcuCommands from './NodeMcuCommands'

export default interface INodeMcu {
	path: string
	commands: NodeMcuCommands

	toTerminal: Event<string>
	fromTerminal: (text: string) => Promise<void>

	onClose: Event<void>

	connect: () => Promise<void>
	disconnect: () => Promise<void>
	waitToBeReady: () => Promise<void>
}
