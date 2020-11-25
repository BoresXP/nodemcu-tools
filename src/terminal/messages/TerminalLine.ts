import IMessage from './IMessage'

export type TerminalLineType = 'echo' | 'output'

export interface ITerminalLine extends IMessage {
	type: 'terminalLine'
	textType: 'echo' | 'output'
	text: string
}

export function terminalLine(textType: TerminalLineType, text: string): ITerminalLine {
	return {
		type: 'terminalLine',
		textType,
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
