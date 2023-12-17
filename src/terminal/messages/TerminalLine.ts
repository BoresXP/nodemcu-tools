import IMessage from './IMessage'
import { TerminalLineColor } from '../content/state/state'

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
