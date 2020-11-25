import { Event } from 'vscode'
import IToTerminalData from './IToTerminalData'
import NodeMcuCommands from './NodeMcuCommands'

export default interface INodeMcu {
	path: string
	commands: NodeMcuCommands

	toTerminal: Event<IToTerminalData>
	fromTerminal: (text: string) => Promise<void>

	onClose: Event<void>
	onBusyChanged: Event<boolean>

	connect: () => Promise<void>
	disconnect: () => Promise<void>
	waitToBeReady: () => Promise<void>
}
