import IMessage from './IMessage'

export interface ITerminalLine extends IMessage {
	type: 'terminalLine'
	text: string
}

export function terminalLine(text: string): ITerminalLine {
	return {
		type: 'terminalLine',
		text,
	}
}

export function isTerminalLine(val: any): val is ITerminalLine {
	if (!val) {
		return false
	}

	const typedVal = val as ITerminalLine
	return typedVal.type === 'terminalLine'
}
