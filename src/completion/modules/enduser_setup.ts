import { CompletionItem, CompletionItemKind } from 'vscode'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const enduser_setup: CompletionItem[] = [
	{
		kind: CompletionItemKind.Function,
		label: 'manual',
		detail: 'manual([on_off])',
		documentation: 'Controls whether manual AP configuration is used.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'start',
		detail: 'start([onConnected()], [onError(err_num, string)], [onDebug(string)])',
		documentation: 'Starts the captive portal.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'stop',
		detail: 'stop()',
		documentation: 'Stops the captive portal.',
	},
];
