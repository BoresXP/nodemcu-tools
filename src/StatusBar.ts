import { StatusBarAlignment, StatusBarItem, l10n, window } from 'vscode'

export default function createStatusBarItems(): void {
	createStatusBarItem('$(symbol-event)', l10n.t('Flash device'), 'nodemcu-tools.flash', 49, true)
	createStatusBarItem('$(symbol-field)', l10n.t('Erase flash'), 'nodemcu-tools.erase', 50, true)
}

function createStatusBarItem(
	icon: string,
	tooltip: string,
	cmd: string,
	priority: number,
	showItem: boolean,
): StatusBarItem {
	const alignment: StatusBarAlignment = StatusBarAlignment.Left
	const statusBarItem = window.createStatusBarItem(cmd, alignment, priority)
	statusBarItem.name = tooltip
	statusBarItem.text = icon
	statusBarItem.tooltip = tooltip
	statusBarItem.command = cmd
	if (showItem) {
		statusBarItem.show()
	}
	return statusBarItem
}
