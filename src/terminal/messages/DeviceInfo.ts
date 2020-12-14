import { IDeviceInfo as IDeviceInfoData } from '../content/state/state'
import IMessage from './IMessage'

export interface IDeviceInfo extends IMessage {
	type: 'deviceInfo'
	info: IDeviceInfoData
}

export function deviceInfo(
	numberType: string,
	heapFree: number,
	ssl: boolean,
	modules: string,
	fsTotal: number,
	fsUsed: number,
): IDeviceInfo {
	return {
		type: 'deviceInfo',
		info: {
			numberType,
			heapFree,
			ssl,
			modules,
			fsTotal,
			fsUsed,
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
