export type MessageType = 'terminalLine' | 'terminalCommand' | 'deviceState' | 'setConfiguration' | 'deviceInfo' | 'deviceInfoRequest' | 'formatRequest'

export default interface IMessage {
	type: MessageType
}
