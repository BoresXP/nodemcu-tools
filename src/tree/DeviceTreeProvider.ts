import DeviceTreeItem, { isDeviceTreeItem } from './DeviceTreeItem'
import { Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode'
import FileTreeItem, { isFileTreeItem } from './FileTreeItem'

import NodeMcuRepository from '../nodemcu/NodeMcuRepository'

export default class DeviceTreeProvider implements TreeDataProvider<TreeItem> {
	private readonly _onDidChangeTreeData = new EventEmitter<undefined>()
	private _deviceItems: DeviceTreeItem[] | undefined = void 0

	constructor() {
		NodeMcuRepository.onDisconnect(() => this.refresh())
	}

	public refresh(): void {
		this._onDidChangeTreeData.fire(void 0)
	}

	public get onDidChangeTreeData(): Event<undefined> {
		return this._onDidChangeTreeData.event
	}

	public getTreeItem(element: TreeItem): TreeItem {
		return element
	}

	public getParent(element: TreeItem): TreeItem | undefined {
		if (isDeviceTreeItem(element)) {
			return void 0
		}
		if (isFileTreeItem(element)) {
			return element.parent
		}

		throw new Error('Unexpected tree item type')
	}

	public async getChildren(element?: TreeItem): Promise<TreeItem[] | undefined> {
		if (!element) {
			const ports = await NodeMcuRepository.listPorts()
			this._deviceItems = ports.map(p => new DeviceTreeItem(p))
			return this._deviceItems
		}
		if (isDeviceTreeItem(element) && NodeMcuRepository.isConnected(element.path)) {
			const device = NodeMcuRepository.getOrCreate(element.path)
			const files = await device.files()
			return files.map(f => new FileTreeItem(f.name, f.size, element))
		}

		return void 0
	}

	public itemByPath(path: string): DeviceTreeItem | undefined {
		if (!this._deviceItems) {
			return void 0
		}

		return this._deviceItems.find(d => d.path === path)
	}
}
