import IMessage from './IMessage'

export type TerminalLineColor = 'default' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan'

export interface ITerminalLine extends IMessage {
	type: 'terminalLine'
	textColor: TerminalLineColor
	text: string
}

export function terminalLine(textColor: TerminalLineColor, text: string): ITerminalLine {
	return {
		type: 'terminalLine',
		textColor,
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
