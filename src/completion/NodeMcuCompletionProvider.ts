import { CancellationToken, CompletionContext, CompletionItem, CompletionItemProvider, Position, TextDocument } from 'vscode'

import nodeMcuModules from './modules'

export default class NodeMcuCompletionProvider implements CompletionItemProvider {
	provideCompletionItems(document: TextDocument, position: Position, _token: CancellationToken, context: CompletionContext): CompletionItem[] | undefined {
		if (context.triggerKind !== 1) {
			return void 0
		}

		const triggerChar = context.triggerCharacter ?? ''
		const posWordBefore = position.translate(0, -triggerChar.length)
		const wordRange = document.getWordRangeAtPosition(posWordBefore)
		const wordBefore = document.getText(wordRange)

		if (Object.prototype.hasOwnProperty.call(nodeMcuModules, wordBefore)) {
			const modules = (nodeMcuModules as unknown) as { [key: string]: CompletionItem[] }
			return modules[wordBefore]
		}

		return []
	}

}
