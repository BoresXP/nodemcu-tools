import { CompletionItem, CompletionItemKind } from 'vscode'

export const perf: CompletionItem[] = [
	{
		kind: CompletionItemKind.Function,
		label: 'start',
		detail: 'start([start[, end[, nbins[, offset]]]])',
		documentation: 'Starts a performance monitoring session.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'stop',
		detail: 'total, outside, histogram, binsize = stop()',
		documentation: 'Terminates a performance monitoring session and returns the histogram.',
	},
]
