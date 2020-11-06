import { Event } from 'vscode'

export default interface ITerminalConnectable {
	toTerminal: Event<string>
	onClose: Event<void>
	fromTerminal(text: string): void
}
