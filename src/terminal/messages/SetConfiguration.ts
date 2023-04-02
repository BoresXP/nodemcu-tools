import IMessage from './IMessage'
import { ISettings } from '../content/state/state'

export interface ISetConfiguration extends IMessage {
	type: 'setConfiguration'
	configuration: ISettings
}

export function setConfiguration(
	scrollbackMaxLines: number,
	historyMaxLines: number,
	snippets: Record<string, string>,
	minifyEnabled: boolean
): ISetConfiguration {
	return {
		type: 'setConfiguration',
		configuration: {
			scrollbackMaxLines,
			historyMaxLines,
			snippets,
			minifyEnabled,
		},
	}
}

export function isSetConfiguration(val: any): val is ISetConfiguration {
	if (!val) {
		return false
	}

	const typedVal = val as ISetConfiguration
	return typedVal.type === 'setConfiguration'
}
