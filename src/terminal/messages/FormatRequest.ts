import IMessage from './IMessage'

export interface IFormatRequest extends IMessage {
	type: 'formatRequest'
}

export function formatRequest(): IFormatRequest {
	return {
		type: 'formatRequest',
	}
}

export function isFormatRequest(val: any): val is IFormatRequest {
	if (!val) {
		return false
	}

	const typedVal = val as IFormatRequest
	return typedVal.type === 'formatRequest'
}
