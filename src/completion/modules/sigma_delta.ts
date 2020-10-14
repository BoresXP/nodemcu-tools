import { CompletionItem, CompletionItemKind } from 'vscode'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const sigma_delta: CompletionItem[] = [
	{
		kind: CompletionItemKind.Function,
		label: 'close',
		detail: 'close(pin)',
		documentation: 'Stops signal generation and reenables GPIO functionality at the specified pin.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'setprescale',
		detail: 'setprescale(value)',
		documentation: 'Sets the prescale value.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'setpwmduty',
		detail: 'setpwmduty(ratio)',
		documentation: 'Operate the sigma-delta module in PWM-like mode with fixed base frequency.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'settarget',
		detail: 'settarget(value)',
		documentation: 'Sets the target value.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'setup',
		detail: 'setup(pin)',
		documentation: 'Stops the signal generator and routes it to the specified pin.',
	},
]
