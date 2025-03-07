import { Disposable, EventEmitter, Event as VsEvent, l10n, window } from 'vscode'

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
	isMultiConsole: boolean
	hasConsoleModule: boolean
}

export default class NodeMcu extends NodeMcuSerial implements INodeMcu {
	private static readonly _luaCommands = {
		getChipID: 'print(tostring(node.chipid and node.chipid()))',
		getModel: 'print(tostring(node.chipmodel and node.chipmodel()))',
		echo: 'print("echo1337")',
		checkConsoleModule: 'print(tostring(console))',
	}

	private static readonly _colorMap: [string, IToTerminalData['color']][] = [
		['31', 'red'],
		['32', 'green'],
		['33', 'yellow'],
		['34', 'blue'],
		['35', 'magenta'],
		['36', 'cyan'],
	]

	private static readonly _commandTimeout = 3000 // msec

	private readonly _evtToTerminal = new EventEmitter<IToTerminalData>()
	private readonly _evtClose = new EventEmitter<void>()
	private readonly _evtBusy = new EventEmitter<boolean>()

	private _unsubscribeOnData: Disposable
	private _currentCommand: Promise<string | undefined> | undefined

	private _isBusy = true
	private _lastInput: string | undefined

	private _commands: NodeMcuCommands | undefined

	private _espInfo: IEspInfo = {
		espArch: '',
		espID: '',
		espModel: '',
		isMultiConsole: false,
		hasConsoleModule: false,
	}

	constructor(path: string) {
		super(path)
		this._unsubscribeOnData = this.onData(data => this.handleData(data))
		this.onConnect(() => this.handleConnect())
		this.onDisconnect(err => this.handleDisconnect(err))
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
			this._commands = new NodeMcuCommands(this, this._espInfo)
		}

		return this._commands
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

	private static async sleep(ms: number): Promise<void> {
		return new Promise<void>(resolve => {
			setTimeout(() => resolve(), ms)
		})
	}

	public async startup(delay: number): Promise<boolean> {
		const isSynced = await this.sync(delay)
		if (isSynced) {
			this._espInfo = await this.fetchEspInfo()
		} else {
			window.showErrorMessage(l10n.t('NodeMCU Lua interpreter is not ready'))
			return false
		}

		return true
	}

	public async changeBaud(baudrate: number): Promise<boolean> {
		if (this._espInfo.hasConsoleModule) {
			return false
		}

		await this.waitToBeReady()
		await this._commands?.sendNewBaud(baudrate)
		// Wait for the string to be sent before updating serialport's baud
		await NodeMcu.sleep(100)
		await this.updateSerialportBaudrate(baudrate)
		this.setBusy(false)

		const isSynced = await this.sync(0)
		if (!isSynced) {
			window.showWarningMessage(l10n.t('Unable to change file upload baud rate'))
			return false
		}

		return true
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
		console.log('T: ' + text) // eslint-disable-line no-console

		this._lastInput = text
		await this.write(text)
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

		const reply = await this.executeCommand(command, replyHandler)

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
				reject(new Error(l10n.t('Command execution timeout')))
			}, NodeMcu._commandTimeout)

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
					reject(ex as Error)
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

		// eslint-disable-next-line no-control-regex, sonarjs/no-control-regex
		const matches = /^>? ?\x1b\[\d?;?(\d\d)m(.+)\x1b\[0m(.*)\r*\n/.exec(data)
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

	private async checkGarbageInUart(): Promise<boolean> {
		await this.waitToBeReady()
		const responceEcho = await this.executeSingleLineCommand(NodeMcu._luaCommands.echo)
		return responceEcho.trimEnd() !== 'echo1337'
	}

	private async sync(delay: number): Promise<boolean> {
		await this.waitToBeReady()

		let isGarbageInUart = await this.checkGarbageInUart()
		for (let i = 0; i < 3; i++) {
			if (isGarbageInUart) {
				if (delay) {
					await NodeMcu.sleep(delay)
					await this.write('\n\n\nprint("dummy printing")\n\n')
					await NodeMcu.sleep(delay)
				}
				isGarbageInUart = await this.checkGarbageInUart()
			} else {
				break
			}
			if (isGarbageInUart) {
				return false
			}
		}

		return true
	}

	private async fetchEspInfo(): Promise<IEspInfo> {
		await this.waitToBeReady()
		let response
		const espInfo = this._espInfo

		// esp8266 chipid is string '12345678'.
		// esp32 chipid is string (hex with '0x' prefix). esp32 chipID only
		// available on the base ESP32 model; esp32xx returns nil
		response = await this.executeSingleLineCommand(NodeMcu._luaCommands.getChipID)
		const chipID = response.trimEnd()
		const esp32ID = /^0x\w+/.exec(chipID)

		// PR #3646 includes reworked console support, to now also work with USB Serial JTAG consoles and USB CDC consoles
		// Now we have to use uart.start/stop and handle default lf/lf line endings instead of crlf/cr
		// node.model() is used to distinguish the outdated esp32 firmware.
		// The chip model is a string, e.g. "esp32c3" or "esp32"
		response = await this.executeSingleLineCommand(NodeMcu._luaCommands.getModel)
		const espModel = /^esp32.?.?/.exec(response.trimEnd())
		espInfo.isMultiConsole = espModel !== null

		// PR #3666 moves the system console handling into its own module (console)
		// console.write() .on() .mode() are used instead of uart...()
		response = await this.executeSingleLineCommand(NodeMcu._luaCommands.checkConsoleModule)
		espInfo.hasConsoleModule = response.trimEnd() !== 'nil'

		if (espModel) {
			[espInfo.espModel] = espModel
			espInfo.espArch = 'esp32'
			espInfo.espID = esp32ID ? esp32ID[0] : 'unknown'
		} else if (esp32ID && !espModel) {
			espInfo.espModel = 'esp32' // legacy esp32 firmware
			espInfo.espArch = 'esp32'
			;[espInfo.espID] = esp32ID
		} else {
			espInfo.espModel = 'esp8266'
			espInfo.espArch = 'esp8266'
			espInfo.espID = chipID
		}

		return espInfo
	}
}
