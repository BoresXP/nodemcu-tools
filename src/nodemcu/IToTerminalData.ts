import { TerminalLineColor } from '../terminal/content/state/state'

export default interface IToTerminalData {
	color: TerminalLineColor
	data: string
}
