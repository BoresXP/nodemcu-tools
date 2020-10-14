import { CompletionItem, CompletionItemKind } from 'vscode'

export const apa102: CompletionItem[] = [
	{
		kind: CompletionItemKind.Function,
		label: 'write',
		detail: 'write(data_pin, clock_pin, string)',
		documentation: 'Send ABGR data in 8 bits to a APA102 chain.',
	},
]
