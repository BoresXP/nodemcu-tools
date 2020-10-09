import { Event } from 'vscode'

export default interface TerminalConnectable {
	toTerminal: Event<string>
	onClose: Event<void>
	fromTerminal(text: string): void
}
