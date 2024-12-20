import DeviceTreeItem from './DeviceTreeItem'
import FolderTreeItem from './FolderTreeItem'
import { TreeItem } from 'vscode'

export default class FileTreeItem extends TreeItem {
	public readonly path: string

	constructor(
		public readonly name: string,
		public readonly size: number,
		public readonly parent: DeviceTreeItem | FolderTreeItem,
	) {
		const nameToShow = name.includes('/') ? name.split('/')[1] : name
		super(nameToShow)

		this.parent = parent
		this.name = name
		this.path = parent.path

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
