export type MessageType = 'terminalLine' | 'terminalCommand' | 'deviceState' | 'setConfiguration'

export default interface IMessage {
	type: MessageType
}
