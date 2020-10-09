import { Event, EventEmitter, Pseudoterminal, TerminalDimensions } from 'vscode'

import TerminalConnectable from './TerminalConnectable'

export default class DeviceTerminal implements Pseudoterminal {
	private readonly _evtDidWrite = new EventEmitter<string>()
	private readonly _evtDidClose = new EventEmitter<void | number>()
	private readonly _evtReady = new EventEmitter<void>()
	private readonly _device: TerminalConnectable

	constructor(device: TerminalConnectable) {
		this._device = device
		device.toTerminal(text => this._evtDidWrite.fire(text))
		device.onClose(() => this._evtDidClose.fire())
	}

	public get onDidClose(): Event<number | void> {
		return this._evtDidClose.event
	}

	public get onDidWrite(): Event<string> {
		return this._evtDidWrite.event
	}

	open(_initialDimensions?: TerminalDimensions): void {
		this._evtReady.fire()
	}

	public get onReady(): Event<void> {
		return this._evtReady.event
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	close(): void {

	}

	public handleInput(data: string): void {
		// this._evtDidWrite.fire(data)
		this._device.fromTerminal(data)
	}
}
