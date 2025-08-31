type MessageType =
	'terminalLine' |
	'terminalCommand' |
	'deviceState' |
	'setConfiguration' |
	'deviceInfo' |
	'deviceInfoRequest' |
	'formatRequest' |
	'sendLineRequest' |
	'sendBlockRequest'

export default interface IMessage {
	type: MessageType
}
