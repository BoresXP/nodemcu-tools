import { TreeItem, TreeItemCollapsibleState } from 'vscode'
import DeviceTreeItem from './DeviceTreeItem'
import path from 'path'

export default class FolderTreeItem extends TreeItem {
	public readonly path: string

	constructor(public readonly name: string, public readonly parent: DeviceTreeItem) {
		super(name, TreeItemCollapsibleState.Expanded)

		this.parent = parent
		this.name = name
		this.path = parent.path

		this.id = `nodemcu-folder-${parent.path}-${name}`

		this.iconPath = {
			light: path.join(__filename, '..', '..', 'resources', 'light', 'folder.svg'),
			dark: path.join(__filename, '..', '..', 'resources', 'dark', 'folder.svg'),
		}

		this.contextValue = 'nodemcu-folder'
	}
}

export function isFolderTreeItem(item: TreeItem): item is FolderTreeItem {
	if (!item) {
		return false
	}

	const folderItem = item as FolderTreeItem
	return Boolean(item.id?.startsWith('nodemcu-folder-')) && Boolean(folderItem.name) && Boolean(folderItem.parent)
}
