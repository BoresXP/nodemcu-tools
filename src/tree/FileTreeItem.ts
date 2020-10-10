import DeviceTreeItem from './DeviceTreeItem'
import { TreeItem } from 'vscode'

export default class FileTreeItem extends TreeItem {
	public readonly parent: DeviceTreeItem
	public readonly name: string

	constructor(name: string, size: number, parent: DeviceTreeItem) {
		super(name)

		this.parent = parent
		this.name = name

		this.id = `nodemcu-file-${parent.path}-${name}`
		this.tooltip = `${size}`

		this.contextValue = 'nodemcu-file'
		if (name.endsWith('.lua')) {
			this.contextValue += '-lua'
		} else if (name.endsWith('.lc')) {
			this.contextValue += '-lc'
		}
	}
}

export function isFileTreeItem(item: TreeItem): item is FileTreeItem {
	if (!item) {
		return false
	}

	const fileItem = item as FileTreeItem
	return Boolean(item.id?.startsWith('nodemcu-file-')) && Boolean(fileItem.name) && Boolean(fileItem.parent)
}
