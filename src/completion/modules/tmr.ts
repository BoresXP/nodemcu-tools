import { CompletionItem, CompletionItemKind } from 'vscode'

export const tmr: CompletionItem[] = [
	{
		kind: CompletionItemKind.Enum,
		label: 'ALARM_SINGLE',
		detail: 'ALARM_SINGLE',
		documentation: 'A one-shot alarm (and no need to call tmr.unregister())',
	},
	{
		kind: CompletionItemKind.Enum,
		label: 'ALARM_SEMI',
		detail: 'ALARM_SEMI',
		documentation: 'Manually repeating alarm (call tmr.start() to restart)',
	},
	{
		kind: CompletionItemKind.Enum,
		label: 'ALARM_AUTO',
		detail: 'ALARM_AUTO',
		documentation: 'Automatically repeating alarm',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'alarm',
		detail: 'alarm(id, interval_ms, mode)',
		documentation: 'This is a convenience function combining [\'tmr.register()\'](#tmrregister) and [\'tmr.start()\'](#tmrstart) into a single call.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'delay',
		detail: 'delay(us)',
		documentation: 'Busyloops the processor for a specified number of microseconds.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'interval',
		detail: 'interval(id, interval_ms)',
		documentation: 'Changes a registered timer\'s expiry interval.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'now',
		detail: 'now()',
		documentation: 'Returns the system counter, which counts in microseconds. Limited to 31 bits, after that it wraps around back to zero. That is essential if you use this function to [debounce or throttle GPIO input](https://github.com/hackhitchin/esp8266-co-uk/issues/2).',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'register',
		detail: 'register(id, interval_ms, mode, func)',
		documentation: 'Configures a timer and registers the callback function to call on expiry.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'softwd',
		detail: 'softwd(timeout_s)',
		documentation: 'Provides a simple software watchdog, which needs to be re-armed or disabled before it expires, or the system will be restarted.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'start',
		detail: 'start(id)',
		documentation: 'Starts or restarts a previously configured timer.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'state',
		detail: 'state(id)',
		documentation: 'Checks the state of a timer.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'stop',
		detail: 'stop(id)',
		documentation: 'Stops a running timer, but does *not* unregister it. A stopped timer can be restarted with [\'tmr.start()\'](#tmrstart).',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'time',
		detail: 'time()',
		documentation: 'Returns the system uptime, in seconds. Limited to 31 bits, after that it wraps around back to zero.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'unregister',
		detail: 'unregister(id)',
		documentation: 'Stops the timer (if running) and unregisters the associated callback.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'wdclr',
		detail: 'wdclr()',
		documentation: 'Feed the system watchdog.',
	},
]
