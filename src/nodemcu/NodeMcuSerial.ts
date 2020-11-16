import { Event, EventEmitter } from 'vscode'

import SerialPort from 'serialport'

export interface ErrorDisconnect extends Error {
	disconnected?: boolean
}

export default abstract class NodeMcuSerial {
	protected static readonly lineEnd = '\r\n'
	protected static readonly prompt = '> '
	// list of known vendor IDs
	private static readonly _vendorIDs = [
		'1A86', // NodeMCU v1.0 - CH341 Adapter | 0x1a86  QinHeng Electronics
		'10C4', // NodeMCU v1.1 - CP2102 Adapter | 0x10c4  Cygnal Integrated Products, Inc
		'1A86', // NodeMCU v3 - CH340G Adapter | 0x1A86 Nanjing QinHeng Electronics Co., Ltd.
	]

	private readonly _port: SerialPort
	private readonly _evtOnData = new EventEmitter<string>()
	private readonly _evtClosed = new EventEmitter<ErrorDisconnect | undefined>()
	private readonly _evtOpened = new EventEmitter<void>()

	protected constructor(path: string) {
		this._port = new SerialPort(path, { autoOpen: false, baudRate: 115200 })
	}

	public static async listDevices(): Promise<SerialPort.PortInfo[]> {
		const ports = await SerialPort.list()
		return ports.filter(p => this._vendorIDs.includes(p.vendorId?.toUpperCase() ?? ''))
	}

	public connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			const parser = this._port.pipe(new SerialPort.parsers.Readline({ delimiter: NodeMcuSerial.lineEnd }))
			this._port.open(err => {
				if (err) {
					reject(err)
				} else {
					parser.on('data', data => this.onDataHandler(data))
					this._port.on('close', (errDiconnect: ErrorDisconnect) => this._evtClosed.fire(errDiconnect))

					this._evtOpened.fire()
					resolve()
				}
			})
		})
	}

	public disconnect(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!this.isConnected) {
				resolve()
			} else {
				this._port.close(err => err ? reject(err) : resolve())
			}
		})
	}

	public get isConnected(): boolean {
		return this._port.isOpen
	}

	public get path(): string {
		return this._port.path
	}

	public get onDisconnect(): Event<ErrorDisconnect | undefined> {
		return this._evtClosed.event
	}

	public writeRaw(data: Buffer): Promise<void> {
		return new Promise((resolve, reject) => {
			this._port.write(data, 'binary', err => {
				if (err) {
					reject(err)
				} else {
					this._port.drain(err1 => err1 ? reject(err1) : resolve())
				}
			})
		})
	}

	protected write(data: string): Promise<void> {
		return new Promise((resolve, reject) => {
			// eslint-disable-next-line sonarjs/no-identical-functions
			this._port.write(data, err => {
				if (err) {
					reject(err)
				} else {
					this._port.drain(err1 => err1 ? reject(err1) : resolve())
				}
			})
		})
	}

	protected get onData(): Event<string> {
		return this._evtOnData.event
	}

	protected get onConnect(): Event<void> {
		return this._evtOpened.event
	}

	private onDataHandler(data: Buffer): void {
		this._evtOnData.fire(data.toString('utf-8'))
	}
}
