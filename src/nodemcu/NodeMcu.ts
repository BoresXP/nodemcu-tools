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

export default class NodeMcu extends NodeMcuSerial implements INodeMcu {
	private static readonly _luaCommands = {
		getChipID: 'uart.write(0,tostring(node.chipid()).."\\r\\n")',
	}
	private static readonly _colorMap: [string, IToTerminalData['color']][] = [
		['\x1B[0;31m', 'red'],
		['\x1B[0;32m', 'green'],
		['\x1B[0;33m', 'yellow'],
		['\x1B[0;34m', 'blue'],
		['\x1B[0;36m', 'cyan'],
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

	private _espArch = ''
	private _espID = ''

	constructor(path: string) {
		super(path)
		this._unsubscribeOnData = this.onData(data => this.handleData(data))
		this.onConnect(() => this.handleConnect())
		this.onDisconnect(err => this.handleDisconnect(err))
	}

	public get espArch(): string {
		return this._espArch
	}

	public get espID(): string {
		return this._espID
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

	public async detectEspType(): Promise<void> {
		await this.waitToBeReady()
		this._espID = await this.executeSingleLineCommand(NodeMcu._luaCommands.getChipID)

		// esp32 chipid (hex with '0x' prefix)?
		this._espArch = this._espID.match(/^0x[\dA-Fa-f]+\r+\n$/) ? 'esp32' : 'esp8266'
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
			text += this._espArch === 'esp8266' ? NodeMcuSerial.lineEnd : '\n'
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

			void this.write(command.endsWith('\n') ? command : command + NodeMcuSerial.lineEnd)
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

		for (const fgColor of NodeMcu._colorMap) {
			if (data.startsWith(fgColor[0])) {
				return {
					data: data.trimEnd().slice(7, -4),
					color: fgColor[1],
				}
			}
		}

		return { color: 'default', data }
	}
}
