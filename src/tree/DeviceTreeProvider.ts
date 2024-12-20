import DeviceTreeItem, { isDeviceTreeItem } from './DeviceTreeItem'
import { EventEmitter, TreeDataProvider, TreeItem, Event as VsEvent, window } from 'vscode'
import FileTreeItem, { isFileTreeItem } from './FileTreeItem'
import FolderTreeItem, { isFolderTreeItem } from './FolderTreeItem'
import { IDeviceFileInfo } from '../nodemcu/NodeMcuCommands'
import NodeMcuRepository from '../nodemcu/NodeMcuRepository'

export default class DeviceTreeProvider implements TreeDataProvider<TreeItem> {
	private readonly _onDidChangeTreeData = new EventEmitter<undefined>()

	private _deviceItems: DeviceTreeItem[] | undefined = void 0
	private readonly _files: { [devicePath: string]: IDeviceFileInfo[] } = {}

	constructor() {
		NodeMcuRepository.onDisconnect(() => this.refresh())
	}

	public get onDidChangeTreeData(): VsEvent<undefined> {
		return this._onDidChangeTreeData.event
	}

	public refresh(): void {
		this._onDidChangeTreeData.fire(void 0)
	}

	public getTreeItem(element: TreeItem): TreeItem {
		return element
	}

	public getParent(element: TreeItem): TreeItem | undefined {
		if (isDeviceTreeItem(element)) {
			return void 0
		}
		if (isFolderTreeItem(element) || isFileTreeItem(element)) {
			return element.parent
		}

		throw new Error('Unexpected tree item type')
	}

	public async getChildren(element?: TreeItem): Promise<TreeItem[] | undefined> {
		try {
			if (!element) {
				const ports = await NodeMcuRepository.listPorts()

				this._deviceItems = ports.map(p => new DeviceTreeItem(p))
				return this._deviceItems
			}

			if (isDeviceTreeItem(element) && NodeMcuRepository.isConnected(element.path)) {
				const device = NodeMcuRepository.getOrCreate(element.path)
				await device.waitToBeReady()

				this._files[element.path] = await device.commands.files()
				return this.getTopLevelTreeItems(element)
			}

			if (isFolderTreeItem(element)) {
				return this.getFolderTreeItems(element)
			}
		} catch (ex) {
			console.error(ex) // eslint-disable-line no-console
			await window.showErrorMessage(`Error in nodemcu-tools: ${ex}`)
		}

		return void 0
	}

	private getTopLevelTreeItems(element: DeviceTreeItem): TreeItem[] {
		const folderNames: string[] = []
		const folderItems: FolderTreeItem[] = []
		const fileItems: FileTreeItem[] = []

		for (const f of this._files[element.path]) {
			const isFolder = f.name.includes('/')
			if (isFolder) {
				const [folderName] = f.name.split('/')
				if (!folderNames.includes(folderName)) {
					folderNames.push(folderName)
					folderItems.push(new FolderTreeItem(folderName, element))
				}
			} else {
				fileItems.push(new FileTreeItem(f.name, f.size, element))
			}
		}

		fileItems.sort((f1, f2) => (f1.name > f2.name ? 1 : -1))
		folderItems.sort((f1, f2) => (f1.name > f2.name ? 1 : -1))
		return folderItems.concat(fileItems)
	}

	private getFolderTreeItems(element: FolderTreeItem): FileTreeItem[] {
		const filesUnderFolder = []
		for (const f of this._files[element.path]) {
			const [folderName] = f.name.split('/')
			if (element.name === folderName) {
				filesUnderFolder.push(new FileTreeItem(f.name, f.size, element))
			}
		}
		return filesUnderFolder.sort((f1, f2) => (f1.name > f2.name ? 1 : -1))
	}
}
