import IMessage from './IMessage'

interface ISendLineRequest extends IMessage {
	type: 'sendLineRequest'
}

export function sendLineRequest(): ISendLineRequest {
	return {
		type: 'sendLineRequest',
	}
}

export function isSendLineRequest(val: any): val is ISendLineRequest {
	if (!val) {
		return false
	}

	const typedVal = val as ISendLineRequest
	return typedVal.type === 'sendLineRequest'
}
