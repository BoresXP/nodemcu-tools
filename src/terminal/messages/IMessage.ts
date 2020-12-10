export type MessageType = 'terminalLine' | 'terminalCommand' | 'deviceState' | 'setConfiguration' | 'deviceInfo'

export default interface IMessage {
	type: MessageType
}
