import { Disposable, EventEmitter, Event as VsEvent, window } from 'vscode'

import INodeMcu from './INodeMcu'
import IToTerminalData from './IToTerminalData'
import NodeMcuCommands from './NodeMcuCommands'
import NodeMcuSerial from './NodeMcuSerial'

type CommandReplyHandlerType = (reply: string, state: INodeMcuCommandState) => boolean

interface INodeMcuCommandState {
	replyNumber: number
	command: string
	returnValue?: string
}

export interface IEspInfo {
	espArch: string
	espID: string
	espModel: string
	isNewEsp32fw: boolean
	isUART: boolean
	hasEncoder: boolean
	hasIOmodule: boolean
}

export default class NodeMcu extends NodeMcuSerial implements INodeMcu {
	private static readonly _luaCommands = {
		getChipID: 'uart.write(0,tostring(node.chipid and node.chipid()).."\\r\\n")',
		getModel: 'uart.write(0,tostring(node.chipmodel and node.chipmodel()).."\\r\\n")',
		checkEncoder: 'uart.write(0,tostring(encoder and encoder.fromBase64).."\\r\\n")',
		getUartType: 'uart.write(0,tostring(node.info and node.info("build_config")["esp_console"]).."\\r\\n")',
		echo: 'uart.write(0,"echo1337\\r\\n")',
		checkIOmodule: 'uart.write(0,tostring(io).."\\r\\n")',
	}
	private static readonly _colorMap: [string, IToTerminalData['color']][] = [
		['31', 'red'],
		['32', 'green'],
		['33', 'yellow'],
		['34', 'blue'],
		['35', 'magenta'],
		['36', 'cyan'],
	]
	private _commandTimeout = 15000 // msec

	private readonly _evtToTerminal = new EventEmitter<IToTerminalData>()
	private readonly _evtClose = new EventEmitter<void>()
	private readonly _evtBusy = new EventEmitter<boolean>()

	private _unsubscribeOnData: Disposable
	private _currentCommand: Promise<string | undefined> | undefined

	private _isBusy = true
	private _lastInput: string | undefined

	private _commands: NodeMcuCommands | undefined

	private readonly _espInfo = {
		espArch: '',
		espID: '',
		espModel: '',
		isNewEsp32fw: false,
		isUART: true,
		hasEncoder: false,
		hasIOmodule: true,
	}

	constructor(path: string) {
		super(path)
		this._unsubscribeOnData = this.onData(data => this.handleData(data))
		this.onConnect(() => this.handleConnect())
		this.onDisconnect(err => this.handleDisconnect(err))
	}

	public get espInfo(): IEspInfo {
		return this._espInfo
	}

	public get isBusy(): boolean {
		return this._isBusy
	}

	public get onBusyChanged(): VsEvent<boolean> {
		return this._evtBusy.event
	}

	public get toTerminal(): VsEvent<IToTerminalData> {
		return this._evtToTerminal.event
	}

	public get onClose(): VsEvent<void> {
		return this._evtClose.event
	}

	public get commands(): NodeMcuCommands {
		if (!this._commands) {
			this._commands = new NodeMcuCommands(this)
		}

		return this._commands
	}

	public set commandTimeout(msec: number) {
		this._commandTimeout = msec
	}

	private static clearReply(reply: string | undefined): string {
		if (reply) {
			let prevLength = 0
			do {
				prevLength = reply.length
				if (reply.startsWith(NodeMcuSerial.prompt)) {
					reply = reply.substring(NodeMcuSerial.prompt.length)
				}
			} while (reply.length !== prevLength)
		}

		return reply ?? ''
	}

	public async checkGarbageInUart(): Promise<boolean> {
		await this.waitToBeReady()
		const responceEcho = await this.executeSingleLineCommand(NodeMcu._luaCommands.echo)
		return responceEcho.trimEnd() !== 'echo1337'
	}

	public async delayConnection(delay: number): Promise<void> {
		await this.waitToBeReady()

		// This procedure was borrowed from https://github.com/AndiDittrich/NodeMCU-Tool/blob/master/lib/connector/connect.js
		// delay the connection process ? may fix issues related to rebooting modules

		// step 1 - sleep
		await new Promise<void>(resolve => {
			setTimeout(() => resolve(), delay)
		})

		// step 2 - send dummy sequence
		await this.write('\n\n\nprint("dummy printing")\n\n\n')

		// step 3 - wait 1/3 to get the dummy sequence processed
		await new Promise<void>(resolve => {
			setTimeout(() => resolve(), delay)
		})

		// step 4 - send second dummy sequence
		await this.write('\n\n\nprint("dummy printing")\n\n\n')

		// step 5 - wait 1/3 to get the dummy sequence processed
		await new Promise<void>(resolve => {
			setTimeout(() => resolve(), delay)
		})

		this.setBusy(false)
	}

	public async fetchEspInfo(): Promise<void> {
		await this.waitToBeReady()
		// esp32 chipid (hex with '0x' prefix). Only available on the base ESP32 model; esp32xx returns nil
		const responseID = await this.executeSingleLineCommand(NodeMcu._luaCommands.getChipID)
		const esp32ID = /^0x\w+/.exec(responseID.trimEnd())

		// The commit 'Actually honour Kconfig line-endings settings.' https://github.com/nodemcu/nodemcu-firmware/commit/918f75310e98aea2ea908f9256c435f1be50de53
		// requires changing the communication protocol between esp32 and the extension.
		// Now we have to use uart.start/stop and handle default lf/lf line endings instead of crlf/cr
		// Use node.model() to distinguish the outdated esp32 firmware. The chip model is a string, e.g. "esp32c3" or "esp32"
		const responseModel = await this.executeSingleLineCommand(NodeMcu._luaCommands.getModel)
		const espModel = /^esp32.?.?/.exec(responseModel.trimEnd())
		this._espInfo.isNewEsp32fw = espModel !== null

		if (espModel) {
			[this._espInfo.espModel] = espModel
			this._espInfo.espArch = 'esp32'
			this._espInfo.espID = esp32ID ? esp32ID[0] : 'unknown'
		} else if (esp32ID && !espModel) {
			this._espInfo.espModel = 'esp32' // legacy esp32 firmware
			this._espInfo.espArch = 'esp32'
			;[this._espInfo.espID] = esp32ID
		} else {
			this._espInfo.espModel = 'esp8266'
			this._espInfo.espArch = 'esp8266'
			this._espInfo.espID = responseID.trimEnd()
		}

		// isUART on esp8266 and esp32 is always true
		// isUART on esp32xx depends on settings:
		// CONSOLE_UART_DEFAULT || CONSOLE_UART_CUSTOM: true
		// CONSOLE_USB_CDC || CONSOLE_USB_SERIAL_JTAG: false
		this._espInfo.isUART = true
		if (this._espInfo.espModel !== 'esp8266' && this._espInfo.espModel !== 'esp32') {
			const responseUart = await this.executeSingleLineCommand(NodeMcu._luaCommands.getUartType)
			this._espInfo.isUART = responseUart.trimEnd() === 'uart'
		}

		const responseEncoder = await this.executeSingleLineCommand(NodeMcu._luaCommands.checkEncoder)
		this._espInfo.hasEncoder = responseEncoder.trimEnd() !== 'nil'

		// The dev-esp32-idf3-final branch firmware uses nodemcu `file` module instead of Lua io.
		const responseIO = await this.executeSingleLineCommand(NodeMcu._luaCommands.checkIOmodule)
		this._espInfo.hasIOmodule = responseIO.trimEnd() !== 'nil'
	}

	public waitToBeReady(): Promise<void> {
		return new Promise(resolve => {
			if (!this._isBusy) {
				resolve()
			} else {
				const unsubscribe = this._evtBusy.event(() => {
					unsubscribe.dispose()
					resolve()
				})
			}
		})
	}

	public async fromTerminal(text: string): Promise<void> {
		await this.waitForCommand()

		if (!text) {
			return
		}
		if (!text.endsWith('\n')) {
			text += this._espInfo.espArch === 'esp8266' ? NodeMcuSerial.lineEnd : '\n'
		}

		this._lastInput = text

		try {
			await this.write(text)
			console.log('T: ' + text) // eslint-disable-line no-console
		} catch (err) {
			if (err instanceof Error) {
				await window.showWarningMessage(err.message)
			}
		}
	}

	public async executeSingleLineCommand(command: string, clearBusy = true): Promise<string> {
		const wasBusy = this._isBusy
		this.setBusy(true)

		const replyHandler: CommandReplyHandlerType = (reply, state) => {
			if (state.replyNumber === 0 && reply.includes(state.command)) {
				return true
			}

			state.returnValue = reply
			return false
		}

		let reply
		try {
			reply = await this.executeCommand(command, replyHandler)
		} catch (err) {
			if (err instanceof Error) {
				await window.showErrorMessage(`${err.message}`)
			}
		}

		if (!wasBusy && clearBusy) {
			this.setBusy(false)
		}

		return NodeMcu.clearReply(reply)
	}

	public setBusy(isBusy: boolean): void {
		if (isBusy !== this._isBusy) {
			this._isBusy = isBusy
			this._evtBusy.fire(isBusy)
		}
	}

	private handleConnect(): void {
		this.setBusy(false)
	}

	private handleData(data: string): void {
		console.log('R: ' + data) // eslint-disable-line no-console
		if (!this._isBusy) {
			this._evtToTerminal.fire(this.makeLineColored(data))
		}
	}

	private handleDisconnect(_err?: Error): void {
		this._evtClose.fire()
	}

	private async executeCommand(command: string, replyHandler: CommandReplyHandlerType): Promise<string | undefined> {
		await this.waitForCommand()

		const unsubscribeAndClear = (): void => {
			this._unsubscribeOnData.dispose()
			this._unsubscribeOnData = this.onData(text => this.handleData(text))

			this._currentCommand = void 0
		}

		const state: INodeMcuCommandState = {
			command,
			replyNumber: 0,
		}

		this._currentCommand = new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				unsubscribeAndClear()
				reject(new Error('Command execution timeout'))
			}, this._commandTimeout)

			const handleCommand = (data: string): void => {
				try {
					console.log('CR: ' + data) // eslint-disable-line no-console
					const shouldContinue = replyHandler(data, state)
					if (shouldContinue) {
						state.replyNumber++
					} else {
						clearTimeout(timeoutId)
						unsubscribeAndClear()
						resolve(state.returnValue)
					}
				} catch (ex) {
					clearTimeout(timeoutId)
					unsubscribeAndClear()
					reject(ex)
				}
			}

			this._unsubscribeOnData.dispose()
			this._unsubscribeOnData = this.onData(handleCommand)

			void this.write(command.endsWith('\n') ? command : command + '\n')
		})

		console.log('C: ' + command) // eslint-disable-line no-console

		return this._currentCommand
	}

	private async waitForCommand(): Promise<void> {
		while (this._currentCommand) {
			await this._currentCommand
			this._currentCommand = void 0
		}
	}

	private makeLineColored(data: string): IToTerminalData {
		if (this._lastInput && data.trimEnd().endsWith(this._lastInput.trimEnd())) {
			return { color: 'blue', data }
		}

		// eslint-disable-next-line no-control-regex, sonarjs/sonar-no-control-regex
		const matches = /^\x1b\[\d?;?(\d\d)m(.+)\x1b\[0m(.*)\r*\n/.exec(data)
		if (matches) {
			for (const fgColor of NodeMcu._colorMap) {
				if (matches[1] === fgColor[0]) {
					return {
						data: matches[2] + matches[3],
						color: fgColor[1],
					}
				}
			}
		}

		return { color: 'default', data }
	}
}
