import { CompletionItem, CompletionItemKind } from 'vscode'

export const gpio: CompletionItem[] = [
	{
		kind: CompletionItemKind.Enum,
		label: 'OUTPUT',
		detail: 'OUTPUT',
		documentation: 'Output mode',
	},
	{
		kind: CompletionItemKind.Enum,
		label: 'OPENDRAIN',
		detail: 'OPENDRAIN',
		documentation: 'Opendrain mode',
	},
	{
		kind: CompletionItemKind.Enum,
		label: 'INPUT',
		detail: 'INPUT',
		documentation: 'Input mode',
	},
	{
		kind: CompletionItemKind.Enum,
		label: 'INT',
		detail: 'INT',
		documentation: 'Interrupt mode',
	},
	{
		kind: CompletionItemKind.Enum,
		label: 'PULLUP',
		detail: 'PULLUP',
		documentation: 'Weak pullup resistor mode',
	},
	{
		kind: CompletionItemKind.Enum,
		label: 'FLOAT',
		detail: 'FLOAT',
		documentation: 'Default resistor mode',
	},
	{
		kind: CompletionItemKind.Enum,
		label: 'HIGH',
		detail: 'HIGH',
		documentation: 'Pin high mode',
	},
	{
		kind: CompletionItemKind.Enum,
		label: 'LOW',
		detail: 'LOW',
		documentation: 'Pin low mode',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'mode',
		detail: 'mode(pin, mode [, pullup])',
		documentation: 'Initialize pin to GPIO mode, set the pin in/out direction, and optional internal weak pull-up.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'read',
		detail: 'read(pin)',
		documentation: 'Read digital GPIO pin value.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'serout',
		detail: 'serout(pin, start_level, delay_times [, repeat_num])',
		documentation: 'Serialize output based on a sequence of delay-times. After each delay, the pin is toggled.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'trig',
		detail: 'trig(pin, [type [, callback_function]])',
		documentation: 'Establish or clear a callback function to run on interrupt for a pin.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'write',
		detail: 'write(pin, level)',
		documentation: 'Set digital GPIO pin value.',
	},
]
