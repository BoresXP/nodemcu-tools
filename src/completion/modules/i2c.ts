import { CompletionItem, CompletionItemKind } from 'vscode'

export const i2c: CompletionItem[] = [
	{
		kind: CompletionItemKind.Enum,
		label: 'TRANSMITTER',
		detail: 'TRANSMITTER',
		documentation: 'Transmitter mode',
	},
	{
		kind: CompletionItemKind.Enum,
		label: 'RECEIVER',
		detail: 'RECEIVER',
		documentation: 'Receiver mode',
	},
	{
		kind: CompletionItemKind.Enum,
		label: 'SLOW',
		detail: 'SLOW',
		documentation: 'Slow speed mode',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'address',
		detail: 'address(id, device_addr, direction)',
		documentation: 'Setup I²C address and read/write mode for the next transfer.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'read',
		detail: 'read(id, len)',
		documentation: 'Read data for variable number of bytes.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'setup',
		detail: 'setup(id, pinSDA, pinSCL, speed)',
		documentation: 'Initialize the I²C module.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'start',
		detail: 'start(id)',
		documentation: 'Send an I²C start condition.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'stop',
		detail: 'stop(id)',
		documentation: 'Send an I²C stop condition.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'write',
		detail: 'i2c.write(id, data1[, data2[, ..., datan]])',
		documentation: 'Write data to I²C bus. Data items can be multiple numbers, strings or lua tables.',
	},
]
