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
		nodeDisableOutput: 'node.output(function(opipe) return false end, 0);uart.write(0, "Done\\r\\n")',
		nodeEnableOutput: 'node.output();uart.write(0, "Done\\r\\n")',
	}
	private static readonly _commandTimeout = 15000 // msec

	private readonly _evtToTerminal = new EventEmitter<string>()
	private readonly _evtClose = new EventEmitter<void>()
	private readonly _evtBusy = new EventEmitter<boolean>()

	private _unsubscribeOnData: Disposable
	private _currentCommand: Promise<string | undefined> | undefined

	private _isBusy = true

	private _commands: NodeMcuCommands | undefined

	constructor(path: string) {
		super(path)
		this._unsubscribeOnData = this.onData(data => this.handleData(data))
		this.onConnect(() => this.handleConnect())
		this.onDisconnect(err => this.handleDisconnect(err))
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

	public get isBusy(): boolean {
		return this._isBusy
	}

	public get onBusyChanged(): Event<boolean> {
		return this._evtBusy.event
	}

	public get toTerminal(): Event<string> {
		return this._evtToTerminal.event
	}

	public async fromTerminal(text: string): Promise<void> {
		await this.waitForCommand()

		if (!text) {
			return
		}
		if (!text.endsWith(NodeMcuSerial.lineEnd)) {
			text += NodeMcuSerial.lineEnd
		}
		console.log('T: ' + text)

		await this.write(text)
	}

	public get onClose(): Event<void> {
		return this._evtClose.event
	}

	public async executeSingleLineCommand(command: string, restoreNodeOutputAndClearBusy = true): Promise<string> {
		const wasBusy = this._isBusy
		this.setBusy(true)

		const replyHandler: CommandReplyHandlerType = (reply, state) => {
			if (state.replyNumber === 0 && reply.includes(state.command)) {
				return true
			}

			state.returnValue = reply
			return false
		}

		if (!wasBusy) {
			await this.toggleNodeOutput(false)
		}

		const reply = await this.executeCommand(command, replyHandler)

		if (!wasBusy && restoreNodeOutputAndClearBusy) {
			await this.toggleNodeOutput(true)
			this.setBusy(false)
		}

		return NodeMcu.clearReply(reply)
	}

	public async toggleNodeOutput(enable: boolean): Promise<void> {
		await this.executeSingleLineCommand(
			enable ? NodeMcu._luaCommands.nodeEnableOutput : NodeMcu._luaCommands.nodeDisableOutput,
		)
	}

	public setBusy(isBusy: boolean): void {
		if (isBusy !== this._isBusy) {
			this._isBusy = isBusy
			this._evtBusy.fire(isBusy)
		}
	}

	public get commands(): NodeMcuCommands {
		if (!this._commands) {
			this._commands = new NodeMcuCommands(this)
		}

		return this._commands
	}

	private handleConnect(): void {
		try {
			// await this.executeNoReplyCommand(NodeMcu._luaCommands.uartReconfig, false)

			this.setBusy(false)
		} catch (ex) {
			// this._evtReady.fire(ex)
		}
	}

	private handleData(data: string): void {
		console.log('R: ' + data)
		if (!this._isBusy) {
			this._evtToTerminal.fire(data)
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
			}, NodeMcu._commandTimeout)

			const handleCommand = (data: string): void => {
				try {
					console.log('CR: ' + data)
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

			void this.write(command.endsWith(NodeMcuSerial.lineEnd) ? command : command + NodeMcuSerial.lineEnd)
		})

		console.log('C: ' + command)

		return this._currentCommand
	}

	private async waitForCommand(): Promise<void> {
		while (this._currentCommand) {
			await this._currentCommand
			this._currentCommand = void 0
		}
	}
}
