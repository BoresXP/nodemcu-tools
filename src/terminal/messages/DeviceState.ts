import IMessage from './IMessage'

export interface IDeviceState extends IMessage {
	type: 'deviceState'
	isBusy: boolean
}

export function deviceState(isBusy: boolean): IDeviceState {
	return {
		type: 'deviceState',
		isBusy,
	}
}

export function isDeviceState(val: any): val is IDeviceState {
	if (!val) {
		return false
	}

	const typedVal = val as IDeviceState
	return typedVal.type === 'deviceState'
}
