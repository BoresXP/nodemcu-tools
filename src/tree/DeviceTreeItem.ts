import NodeMcuRepository, { SerialPortInfo } from '../nodemcu/NodeMcuRepository'
import { TreeItem, TreeItemCollapsibleState } from 'vscode'

export default class DeviceTreeItem extends TreeItem {
	public readonly path: string

	constructor(portInfo: SerialPortInfo) {
		super(portInfo.path, NodeMcuRepository.isConnected(portInfo.path) ? TreeItemCollapsibleState.Expanded : void 0)

		this.path = portInfo.path

		this.id = `nodemcu-device-${portInfo.path}`
		this.tooltip = `Manufacturer: ${portInfo.manufacturer ?? ''}\r\nProductID: ${
			portInfo.productId ?? ''
		}\r\nVendorID: ${portInfo.vendorId ?? ''}`

		this.contextValue = 'nodemcu-device'
		if (NodeMcuRepository.isConnected(portInfo.path)) {
			this.contextValue += '-connected'
		}
	}
}

export function isDeviceTreeItem(item: TreeItem): item is DeviceTreeItem {
	if (!item) {
		return false
	}

	const deviceItem = item as DeviceTreeItem
	return Boolean(item.id?.startsWith('nodemcu-device-')) && Boolean(deviceItem.path)
}
