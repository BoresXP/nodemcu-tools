import { EventEmitter, Event as VsEvent, workspace } from 'vscode'
import { ReadlineParser, SerialPort } from 'serialport'

import { PortInfo } from '@serialport/bindings-cpp'

export interface ErrorDisconnect extends Error {
	disconnected?: boolean
}

export default abstract class NodeMcuSerial {
	public static readonly maxLineLength = 254
	protected static readonly lineEnd = '\r\n'
	protected static readonly prompt = '> '
	// list of known vendor IDs
	private static readonly _vendorIDs = [
		'1A86', // NodeMCU v1.0 - CH341 Adapter | 0x1a86  QinHeng Electronics
		'10C4', // NodeMCU v1.1 - CP2102 Adapter | 0x10c4  Cygnal Integrated Products, Inc
		'1A86', // NodeMCU v3 - CH340G Adapter | 0x1A86 Nanjing QinHeng Electronics Co., Ltd.
		'0403', // FTDI232 adapter Product ID 6001
		'303A', // Espressif chips
	]

	private readonly _port: SerialPort
	private readonly _evtOnData = new EventEmitter<string>()
	private readonly _evtOnDataRaw = new EventEmitter<Buffer>()
	private readonly _evtClosed = new EventEmitter<ErrorDisconnect | undefined>()
	private readonly _evtOpened = new EventEmitter<void>()

	protected constructor(path: string) {
		this._port = new SerialPort({ path, autoOpen: false, baudRate: 9600 })
	}

	public get isConnected(): boolean {
		return this._port.isOpen
	}

	public get path(): string {
		return this._port.path
	}

	public get onDisconnect(): VsEvent<ErrorDisconnect | undefined> {
		return this._evtClosed.event
	}

	public get onData(): VsEvent<string> {
		return this._evtOnData.event
	}

	public get onDataRaw(): VsEvent<Buffer> {
		return this._evtOnDataRaw.event
	}

	protected get onConnect(): VsEvent<void> {
		return this._evtOpened.event
	}

	public static async listDevices(): Promise<PortInfo[]> {
		const ports = await SerialPort.list()
		const deviceFilterEnabled = workspace.getConfiguration().get<boolean>('nodemcu-tools.deviceFilterActive')

		return deviceFilterEnabled
			? ports.filter(p => this._vendorIDs.includes(p.vendorId?.toUpperCase() ?? ''))
			: ports.filter(p => p.vendorId ?? p.manufacturer)
	}

	public updateSerialportBaudrate(baudrate: number): Promise<void> {
		return new Promise((resolve, reject) => {
			this._port.update({ baudRate: baudrate }, err => (err ? reject(err) : resolve()))
		})
	}

	public connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			const parser = this._port.pipe(new ReadlineParser({ delimiter: '\n', includeDelimiter: true }))
			this._port.open(err => {
				if (err) {
					reject(err)
				} else {
					this._port.update({ baudRate: 115200 })
					parser.on('data', data => this.onDataHandler(data as Buffer))
					this._port.on('data', data => this.onDataRawHandler(data as Buffer))
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
				this._port.close(err => (err ? reject(err) : resolve()))
			}
		})
	}

	public writeRaw(data: Buffer): Promise<void> {
		return new Promise((resolve, reject) => {
			if (data.length > NodeMcuSerial.maxLineLength) {
				reject(new Error(`Data is too long: ${data.length} bytes`))
			}

			this._port.write(data, 'binary', err => {
				if (err) {
					reject(err)
				} else {
					this._port.drain(err1 => (err1 ? reject(err1) : resolve()))
				}
			})
		})
	}

	public write(data: string): Promise<void> {
		return new Promise((resolve, reject) => {
			if (data.length > NodeMcuSerial.maxLineLength) {
				reject(new Error(`Data is too long: ${data.length} chars`))
			}

			this._port.write(data, err => {
				if (err) {
					reject(err)
				} else {
					this._port.drain(err1 => (err1 ? reject(err1) : resolve()))
				}
			})
		})
	}

	private onDataHandler(data: Buffer): void {
		this._evtOnData.fire(data.toString('utf-8'))
	}

	private onDataRawHandler(data: Buffer): void {
		this._evtOnDataRaw.fire(data)
	}
}
