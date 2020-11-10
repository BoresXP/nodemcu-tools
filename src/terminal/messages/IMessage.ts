export type MessageType = 'terminalLine' | 'terminalCommand' | 'deviceState'

export default interface IMessage {
	type: MessageType
}
