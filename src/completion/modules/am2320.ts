import { CompletionItem, CompletionItemKind } from 'vscode'

export const am2320: CompletionItem[] = [
	{
		kind: CompletionItemKind.Function,
		label: 'init',
		detail: 'model, version, serial = init(sda, scl)',
		documentation: 'Initializes the module and sets the pin configuration. Returns model, version, serial but is seams these where all zero on my model.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'read',
		detail: 'read()',
		documentation: 'Samples the sensor and returns the relative humidity in % and temperature in celsius, as an integer multiplied with 10.',
	},
]
