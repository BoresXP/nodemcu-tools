import IMessage from './IMessage'

interface ISendBlockRequest extends IMessage {
	type: 'sendBlockRequest'
}

export function sendBlockRequest(): ISendBlockRequest {
	return {
		type: 'sendBlockRequest',
	}
}

export function isSendBlockRequest(val: any): val is ISendBlockRequest {
	if (!val) {
		return false
	}

	const typedVal = val as ISendBlockRequest
	return typedVal.type === 'sendBlockRequest'
}
