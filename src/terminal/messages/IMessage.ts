export type MessageType = 'terminalLine' | 'terminalCommand'

export default interface IMessage {
	type: MessageType
}
