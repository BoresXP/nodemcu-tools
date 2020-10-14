import { CompletionItem, CompletionItemKind } from 'vscode'

export const hx711: CompletionItem[] = [
	{
		kind: CompletionItemKind.Function,
		label: 'init',
		detail: 'init(clk, data)',
		documentation: 'Initialize io pins for hx711 clock and data.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'read',
		detail: 'read(mode)',
		documentation: 'Read digital loadcell ADC value.',
	},
]
