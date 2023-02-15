import IToTerminalData from './IToTerminalData'
import NodeMcuCommands from './NodeMcuCommands'
import { Event as VsEvent } from 'vscode'

export default interface INodeMcu {
	path: string
	commands: NodeMcuCommands

	toTerminal: VsEvent<IToTerminalData>
	fromTerminal: (text: string) => Promise<void>

	onClose: VsEvent<void>
	onBusyChanged: VsEvent<boolean>

	connect: () => Promise<void>
	disconnect: () => Promise<void>
	waitToBeReady: () => Promise<void>
	detectArch: () => Promise<void>
}
