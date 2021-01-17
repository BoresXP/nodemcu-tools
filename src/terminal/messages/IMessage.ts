export type MessageType = 'terminalLine' | 'terminalCommand' | 'deviceState' | 'setConfiguration' | 'deviceInfo' | 'deviceInfoRequest'

export default interface IMessage {
	type: MessageType
}
