import { IDeviceInfo as IDeviceInfoData } from '../content/state/state'
import IMessage from './IMessage'

export interface IDeviceInfo extends IMessage {
	type: 'deviceInfo'
	info: IDeviceInfoData
}

export function deviceInfo(numberType: string, heapFree: number): IDeviceInfo {
	return {
		type: 'deviceInfo',
		info: {
			numberType,
			heapFree,
		},
	}
}

export function isDeviceInfo(val: any): val is IDeviceInfo {
	if (!val) {
		return false
	}

	const typedVal = val as IDeviceInfo
	return typedVal.type === 'deviceInfo'
}
