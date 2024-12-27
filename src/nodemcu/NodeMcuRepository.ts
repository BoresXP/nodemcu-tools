import { EventEmitter, Event as VsEvent } from 'vscode'

import { ErrorDisconnect } from './NodeMcuSerial'
import { INodeMcu } from '.'
import NodeMcu from './NodeMcu'

export interface SerialPortInfo {
	path: string
	manufacturer?: string
	productId?: string
	vendorId?: string
}

interface DisconnectInfo {
	path: string
	error?: ErrorDisconnect
}

export default class NodeMcuRepository {
	private static readonly _devices = new Map<string, NodeMcu>()
	private static readonly _evtDisconnect = new EventEmitter<DisconnectInfo>()

	public static get onDisconnect(): VsEvent<DisconnectInfo> {
		return this._evtDisconnect.event
	}

	public static get allConnected(): INodeMcu[] {
		return Array.from(this._devices.values()).filter(d => d.isConnected)
	}

	public static async listPorts(): Promise<SerialPortInfo[]> {
		const ports = await NodeMcu.listDevices()

		const pathsGone = Array.from(this._devices.keys()).filter(k => !ports.some(sp => sp.path === k))
		for (const p of pathsGone) {
			const device = this._devices.get(p)
			await device?.disconnect()
			this._devices.delete(p)
		}

		return ports.map(p => ({
			path: p.path,
			manufacturer: p.manufacturer,
			productId: p.productId,
			vendorId: p.vendorId,
		}))
	}

	public static getOrCreate(path: string): INodeMcu {
		if (this._devices.has(path)) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return this._devices.get(path)!
		}

		const device = new NodeMcu(path)
		this._devices.set(path, device)
		device.onDisconnect(err => {
			this._devices.delete(path)
			this._evtDisconnect.fire({ path, error: err })
		})

		return device
	}

	public static isConnected(path: string): boolean {
		if (this._devices.has(path)) {
			const device = this._devices.get(path)
			return device ? device.isConnected : false
		}

		return false
	}
}
