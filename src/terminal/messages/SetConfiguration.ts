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
): ISetConfiguration {
	return {
		type: 'setConfiguration',
		configuration: {
			scrollbackMaxLines,
			historyMaxLines,
			snippets,
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
