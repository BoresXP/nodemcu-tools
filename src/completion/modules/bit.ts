import { CompletionItem, CompletionItemKind } from 'vscode'

export const bit: CompletionItem[] = [
	{
		kind: CompletionItemKind.Function,
		label: 'arshift',
		detail: 'bit.arshift(value, shift)',
		documentation: 'Arithmetic right shift a number equivalent to \'value >> shift\' in C.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'band',
		detail: 'bit.band(val1, val2 [, ... valn])',
		documentation: 'Bitwise AND, equivalent to \'val1 & val2 & ... & valn\' in C.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'bit',
		detail: 'bit.bit(position)',
		documentation: 'Generate a number with a 1 bit (used for mask generation). Equivalent to \'1 << position\' in C.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'bnot',
		detail: 'bit.bnot(value)',
		documentation: 'Bitwise negation, equivalent to \'~value in C.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'bor',
		detail: 'bit.bor(val1, val2 [, ... valn])',
		documentation: 'Bitwise OR, equivalent to \'val1 | val2 | ... | valn\' in C.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'bxor',
		detail: 'bit.bxor(val1, val2 [, ... valn])',
		documentation: 'Bitwise XOR, equivalent to \'val1 ^ val2 ^ ... ^ valn\' in C.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'clear',
		detail: 'bit.clear(value, pos1 [, ... posn])',
		documentation: 'Clear bits in a number.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'isclear',
		detail: 'bit.isclear(value, position)',
		documentation: 'Test if a given bit is cleared.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'isset',
		detail: 'bit.isset(value, position)',
		documentation: 'Test if a given bit is set.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'lshift',
		detail: 'bit.lshift(value, shift)',
		documentation: 'Left-shift a number, equivalent to \'value << shift\' in C.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'rshift',
		detail: 'bit.rshift(value, shift)',
		documentation: 'Logical right shift a number, equivalent to \'( unsigned )value >> shift\' in C.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'set',
		detail: 'bit.set(value, pos1 [, ... posn ])',
		documentation: 'Set bits in a number.',
	},
]
