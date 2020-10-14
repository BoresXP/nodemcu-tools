import { CompletionItem, CompletionItemKind } from 'vscode'

export const rtcfifo: CompletionItem[] = [
	{
		kind: CompletionItemKind.Function,
		label: 'dsleep_until_sample',
		detail: '',
		documentation: 'When the rtcfifo module is compiled in together with the rtctime module, this convenience function is available. It allows for some measure of separation of concerns, enabling writing of modularized Lua code where a sensor reading abstraction may not need to be aware of the sample frequency (which is largely a policy decision, rather than an intrinsic of the sensor). Use of this function is effectively equivalent to [\'rtctime.dsleep_aligned(interval_us, minsleep_us)\'](rtctime.md#rtctimedsleep_aligned) where \'interval_us\' is what was given to [\'rtcfifo.prepare()\'](#rtcfifoprepare).',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'peek',
		detail: '',
		documentation: 'Reads a sample from the rtcfifo. An offset into the rtcfifo may be specified, but by default it reads the first sample (offset 0).',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'pop',
		detail: '',
		documentation: 'Reads the first sample from the rtcfifo, and removes it from there.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'prepare',
		detail: '',
		documentation: 'Initializes the rtcfifo module for use.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'put',
		detail: '',
		documentation: 'Puts a sample into the rtcfifo.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'ready',
		detail: '',
		documentation: 'Returns non-zero if the rtcfifo has been prepared and is ready for use, zero if not.',
	},
]
