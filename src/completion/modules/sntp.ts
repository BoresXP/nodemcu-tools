import { CompletionItem, CompletionItemKind } from 'vscode'

export const sntp: CompletionItem[] = [
	{
		kind: CompletionItemKind.Function,
		label: 'sync',
		detail: 'sync([server_ip], [callback], [errcallback])',
		documentation: 'Attempts to obtain time synchronization.',
	},
]
