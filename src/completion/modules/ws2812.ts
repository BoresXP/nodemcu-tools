import { CompletionItem, CompletionItemKind } from 'vscode'

export const ws2812: CompletionItem[] = [
	{
		kind: CompletionItemKind.Function,
		label: 'init',
		detail: '',
		documentation: 'Initialize UART1 and GPIO2, should be called once and before write()',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'write',
		detail: 'write(string)',
		documentation: 'Send data to a led strip using its native format which is generally Green,Red,Blue for RGB strips and Green,Red,Blue,White for RGBW strips.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'newBuffer',
		detail: 'newBuffer(numberOfLeds, bytesPerLed)',
		documentation: 'Allocate a new memory buffer to store led values.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'buffer:get',
		detail: 'buffer:get(index)',
		documentation: 'Return the value at the given position',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'buffer:set',
		detail: 'buffer:set(index, color)',
		documentation: 'Set the value at the given position',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'buffer:size',
		detail: 'buffer:size()',
		documentation: 'Return the size of the buffer in number of leds',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'buffer:fill',
		detail: 'buffer:fill(color)',
		documentation: 'Fill the buffer with the given color. The number of given bytes must match the number of bytesPerLed of the buffer',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'buffer:fade',
		detail: 'buffer:fade(value)',
		documentation: 'Divide each byte of each led by the given value. Useful for a fading effect',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'buffer:write',
		detail: 'buffer:write()',
		documentation: 'Output the buffer to the led strip',
	},
]
