import IMessage from './IMessage'

interface IDeviceInfoRequest extends IMessage {
	type: 'deviceInfoRequest'
}

export function deviceInfoRequest(): IDeviceInfoRequest {
	return {
		type: 'deviceInfoRequest',
	}
}

export function isDeviceInfoRequest(val: any): val is IDeviceInfoRequest {
	if (!val) {
		return false
	}

	const typedVal = val as IDeviceInfoRequest
	return typedVal.type === 'deviceInfoRequest'
}
