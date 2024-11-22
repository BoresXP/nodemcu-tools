import { l10n, window } from 'vscode'

import luamin from 'luamin'

export default class AuxTools {
	public static convertIntoSnippet(block: string): string | undefined {
		if (!block) {
			window.showInformationMessage(l10n.t('The code chunk is not selected'))
			return void 0
		}

		try {
			const minifiedBlock = luamin.minify(block)
			if (minifiedBlock.length > 254) {
				window.showErrorMessage(
					l10n.t('The snippet is too long: {0} chars. Max 254 characters is allowed', minifiedBlock.length),
				)
				return void 0
			}
			return minifiedBlock.replaceAll('"', "'").replaceAll('\\', '\\\\')
		} catch (err) {
			if (err instanceof Error) {
				window.showErrorMessage(`Syntax error: ${err.message}`)
			}
			return void 0
		}
	}
}
