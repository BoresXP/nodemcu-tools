import { TerminalLineColor } from '../terminal/messages/TerminalLine'

export default interface IToTerminalData {
	color: TerminalLineColor
	data: string
}
