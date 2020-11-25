export default interface IToTerminalData {
	type: 'echo' | 'output'
	data: string
}
