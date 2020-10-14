import { CompletionItem, CompletionItemKind } from 'vscode'

export const pwm: CompletionItem[] = [
	{
		kind: CompletionItemKind.Function,
		label: 'close',
		detail: 'close(pin)',
		documentation: 'Quit PWM mode for the specified GPIO pin.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'getclock',
		detail: 'getclock(pin)',
		documentation: 'Get selected PWM frequency of pin.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'getduty',
		detail: 'getduty(pin)',
		documentation: 'Get selected duty cycle of pin.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'setclock',
		detail: 'setclock(pin, clock)',
		documentation: 'Set PWM frequency. **Note:** Setup of the PWM frequency will synchronously change other setups as well if there are any. Only one PWM frequency can be allowed for the system.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'setduty',
		detail: 'setduty(pin, duty)',
		documentation: 'Set duty cycle for a pin.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'setup',
		detail: 'setup(pin, clock, duty)',
		documentation: 'Set pin to PWM mode. Only 6 pins can be set to PWM mode at the most.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'start',
		detail: 'start(pin)',
		documentation: 'PWM starts, the waveform is applied to the GPIO pin.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'stop',
		detail: 'stop(pin)',
		documentation: 'Pause the output of the PWM waveform.',
	},
]
