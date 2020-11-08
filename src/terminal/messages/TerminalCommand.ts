import IMessage from './IMessage'

export interface ITerminalCommand extends IMessage {
	type: 'terminalCommand'
	text: string
}

export function terminalCommand(text: string): ITerminalCommand {
	return {
		type: 'terminalCommand',
		text,
	}
}

export function isTerminalCommand(val: any): val is ITerminalCommand {
	if (!val) {
		return false
	}

	const typedVal = val as ITerminalCommand
	return typedVal.type === 'terminalCommand'
}
