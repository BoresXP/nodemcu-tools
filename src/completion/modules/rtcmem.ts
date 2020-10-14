import { CompletionItem, CompletionItemKind } from 'vscode'

export const rtcmem: CompletionItem[] = [
	{
		kind: CompletionItemKind.Function,
		label: 'read32',
		detail: 'read32(idx [, num])',
		documentation: 'Reads one or more 32bit values from RTC user memory.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'write32',
		detail: 'write32(idx, val [, val2, ...])',
		documentation: 'Writes one or more values to RTC user memory, starting at index \'idx\'.',
	},
]
