import { IDeviceInfo as IDeviceInfoData } from '../content/state/state'
import IMessage from './IMessage'

interface IDeviceInfo extends IMessage {
	type: 'deviceInfo'
	info: IDeviceInfoData
}

export function deviceInfoView(infoData: IDeviceInfoData): IDeviceInfo {
	return {
		type: 'deviceInfo',
		info: {
			numberType: infoData.numberType,
			freeHeap: infoData.freeHeap,
			ssl: infoData.ssl,
			modules: infoData.modules,
			fsTotal: infoData.fsTotal,
			fsUsed: infoData.fsUsed,
			chipArch: infoData.chipArch,
			chipModel: infoData.chipModel,
			chipID: infoData.chipID,
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
