import { CompletionItem, CompletionItemKind } from 'vscode'

export const spi: CompletionItem[] = [
	{
		kind: CompletionItemKind.Enum,
		label: 'MASTER',
		detail: 'MASTER',
		documentation: 'Master',
	},
	{
		kind: CompletionItemKind.Enum,
		label: 'SLAVE',
		detail: 'SLAVE',
		documentation: 'Not supported',
	},
	{
		kind: CompletionItemKind.Enum,
		label: 'CPOL_LOW',
		detail: 'CPOL_LOW',
		documentation: 'Low clock polarity',
	},
	{
		kind: CompletionItemKind.Enum,
		label: 'CPOL_HIGH',
		detail: 'CPOL_HIGH',
		documentation: 'High clock polarity',
	},
	{
		kind: CompletionItemKind.Enum,
		label: 'CPHA_LOW',
		detail: 'CPHA_LOW',
		documentation: 'Low clock phase',
	},
	{
		kind: CompletionItemKind.Enum,
		label: 'CPHA_HIGH',
		detail: 'CPHA_HIGH',
		documentation: 'High clock phase',
	},
	{
		kind: CompletionItemKind.Enum,
		label: 'HALFDUPLEX',
		detail: 'HALFDUPLEX',
		documentation: 'Half duplex',
	},
	{
		kind: CompletionItemKind.Enum,
		label: 'FULLDUPLEX',
		detail: 'FULLDUPLEX',
		documentation: 'Full duplex',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'recv',
		detail: 'recv(id, size[, default_data])',
		documentation: 'Receive data from SPI.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'send',
		detail: 'send(id, data1[, data2[, ..., datan]])',
		documentation: 'Send data via SPI in half-duplex mode. Send & receive data in full-duplex mode.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'setup',
		detail: 'setup(id, mode, cpol, cpha, databits, clock_div[, duplex_mode])',
		documentation: 'Set up the SPI configuration. Refer to [Serial Peripheral Interface Bus](https://en.wikipedia.org/wiki/Serial_Peripheral_Interface_Bus#Clock_polarity_and_phase) for details regarding the clock polarity and phase definition.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'get_miso',
		detail: 'get_miso(id, offset, bitlen, num)',
		documentation: 'Extract data items from MISO buffer after \'spi.transaction()\'.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'set_mosi',
		detail: 'set_mosi(id, offset, bitlen, data1[, data2[, ..., datan]])',
		documentation: 'Insert data items into MOSI buffer for \'spi.transaction()\'.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'transaction',
		detail: 'transaction(id, cmd_bitlen, cmd_data, addr_bitlen, addr_data, mosi_bitlen, dummy_bitlen, miso_bitlen)',
		documentation: 'Start an SPI transaction, consisting of up to 5 phases:',
	},
]
