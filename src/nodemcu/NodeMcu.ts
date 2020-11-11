import { Disposable, Event, EventEmitter } from 'vscode'

import INodeMcu from './INodeMcu'
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
		uartReconfig: 'local u={0, uart.getconfig(0)};table.insert(u, 0);uart.setup(unpack(u))',
		nodeDisableOutput: 'node.output(function(opipe) return false end, 0)',
		nodeEnableOutput: 'node.output()',
	}
	private static readonly _commandTimeout = 1500 // msec

	private readonly _evtToTerminal = new EventEmitter<string>()
	private readonly _evtClose = new EventEmitter<void>()
	private readonly _evtReady = new EventEmitter<Error | undefined>()
	private readonly _evtBusy = new EventEmitter<boolean>()

	private _unsubscribeOnData: Disposable
	private _currentCommand: Promise<string | undefined> | undefined

	private _isInitialized = false
	private _isBusy = true

	private _commands: NodeMcuCommands | undefined

	constructor(path: string) {
		super(path)
		this._unsubscribeOnData = this.onData(data => this.handleData(data))
		this.onConnect(() => this.handleConnect())
		this.onDisconnect(err => this.handleDisconnect(err))
	}

	public waitToBeReady(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this._isInitialized) {
				resolve()
			} else {
				this._evtReady.event(err => {
					if (err) {
						reject(err)
					} else {
						resolve()
					}
				})
			}
		})
	}

	public get isInitialized(): boolean {
		return this._isInitialized
	}

	public get onBusyChanged(): Event<boolean> {
		return this._evtBusy.event
	}

	public get toTerminal(): Event<string> {
		return this._evtToTerminal.event
	}

	public async fromTerminal(text: string): Promise<void> {
		await this.waitForCommand()
		await this.write(text)
	}

	public get onClose(): Event<void> {
		return this._evtClose.event
	}

	public async executeNoReplyCommand(command: string): Promise<void> {
		let replyHandler: CommandReplyHandlerType | undefined
		if (!this._isInitialized) {
			replyHandler = (reply, state) => {
				if (state.replyNumber === 0 && reply.includes(state.command)) {
					return true
				}

				return false
			}
		}

		try {
			await this.executeCommand(command, replyHandler)
		} catch (ex) {
			// If remote echo is already turned off we will get nothing
			const e = ex as Error
			if (!this._isInitialized && e && e.message && e.message.includes('timeout')) {
				return
			}
			throw ex
		}
	}

	public async executeSingleLineCommand(command: string): Promise<string> {
		let replyHandler: CommandReplyHandlerType
		if (this._isInitialized) {
			replyHandler = (reply, state) => {
				state.returnValue = reply
				return false
			}
		} else {
			replyHandler = (reply, state) => {
				if (state.replyNumber === 0 && reply.includes(state.command)) {
					return true
				}

				state.returnValue = reply
				return false
			}
		}

		if (this._isInitialized) {
			await this.executeNoReplyCommand(NodeMcu._luaCommands.nodeDisableOutput)
		}

		let reply = await this.executeCommand(command, replyHandler)

		if (this._isInitialized) {
			await this.executeNoReplyCommand(NodeMcu._luaCommands.nodeEnableOutput)
		}

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

	public get commands(): NodeMcuCommands {
		if (!this._commands) {
			this._commands = new NodeMcuCommands(this)
		}

		return this._commands
	}

	private async handleConnect(): Promise<void> {
		try {
			await this.executeNoReplyCommand(NodeMcu._luaCommands.uartReconfig)

			this._isInitialized = true
			this._evtReady.fire(void 0)
			this.setBusy(false)
		} catch (ex) {
			this._evtReady.fire(ex)
		}
	}

	private handleData(data: string): void {
		this._evtToTerminal.fire(data)
	}

	private handleDisconnect(_err?: Error): void {
		this._evtClose.fire()
	}

	private async executeCommand(
		command: string,
		replyHandler: CommandReplyHandlerType | undefined,
	): Promise<string | undefined> {
		await this.waitForCommand()

		this.setBusy(true)

		const unsubscribeAndClear = (): void => {
			this._unsubscribeOnData.dispose()
			this._unsubscribeOnData = this.onData(text => this.handleData(text))

			this._currentCommand = void 0
			this.setBusy(false)
		}

		const state: INodeMcuCommandState = {
			command,
			replyNumber: 0,
		}

		if (replyHandler) {
			this._currentCommand = new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					unsubscribeAndClear()
					reject(new Error('Command execution timeout'))
				}, NodeMcu._commandTimeout)

				const handleCommand = (data: string): void => {
					try {
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

				void this.write(command)
			})
		} else {
			// eslint-disable-next-line promise/prefer-await-to-then
			this._currentCommand = this.write(command).then(() => {
				this.setBusy(false)
				return void 0
			})
		}

		return this._currentCommand
	}

	private async waitForCommand(): Promise<void> {
		while (this._currentCommand) {
			await this._currentCommand
			this._currentCommand = void 0
		}
	}

	private setBusy(isBusy: boolean): void {
		if (this._isInitialized && isBusy !== this._isBusy) {
			this._isBusy = isBusy
			this._evtBusy.fire(isBusy)
		}
	}
}
