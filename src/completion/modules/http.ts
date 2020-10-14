import { CompletionItem, CompletionItemKind } from 'vscode'

export const http: CompletionItem[] = [
	{
		kind: CompletionItemKind.Function,
		label: 'delete',
		detail: 'delete(url, headers, body, callback)',
		documentation: 'Executes a HTTP DELETE request. Note that concurrent requests are not supported.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'get',
		detail: 'get(url, headers, callback)',
		documentation: 'Executes a HTTP GET request. Note that concurrent requests are not supported.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'post',
		detail: 'post(url, headers, body, callback)',
		documentation: 'Executes a HTTP POST request. Note that concurrent requests are not supported.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'put',
		detail: 'put(url, headers, body, callback)',
		documentation: 'Executes a HTTP PUT request. Note that concurrent requests are not supported.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'request',
		detail: 'request(url, method, headers, body, callback)',
		documentation: 'Execute a custom HTTP request for any HTTP method. Note that concurrent requests are not supported.',
	},
]
