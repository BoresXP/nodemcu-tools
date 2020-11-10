import { Disposable, Event, EventEmitter } from 'vscode'

import ITerminalConnectable from '../terminal/ITerminalConnectable'
import NodeMcuSerial from './NodeMcuSerial'

export interface DeviceFileInfo {
	name: string
	size: number
}

type CommandReplyHandlerType = (reply: string, state: INodeMcuCommandState) => boolean

interface INodeMcuCommandState {
	replyNumber: number
	command: string
	returnValue?: string
}

export default class NodeMcu extends NodeMcuSerial implements ITerminalConnectable {
	private static readonly _luaCommands = {
		uartGetConfig: '=uart.getconfig(0)',
		uartReconfig: (baud: string, databits: string, parity: string, stopbits: string, echo: 0 | 1) =>
			`uart.setup(0, ${baud}, ${databits}, ${parity}, ${stopbits}, ${echo})`,
		nodeDisableOutput: 'node.output(function(opipe) return false end, 0)',
		nodeEnableOutput: 'node.output()',
		listFiles:
			'local l=file.list();local s="";for k,v in pairs(l) do s=s..k..":"..v..";" end uart.write(0, s.."\\r\\n")',
		delete: (name: string) => `file.remove("${name}");print("")`,
		checkEncoderBase64: 'if encoder and encoder.fromBase64 then print("yes") else print("no") end',
		writeHelperHex:
			'_G.__nmtwrite = function(s) for c in s:gmatch("..") do file.write(string.char(tonumber(c, 16))) end print(s.length) end print("")',
		writeHelperBase64: '_G.__nmtwrite = function(s) file.write(encoder.fromBase64(s)) print(s.length) end print("")',
		fileOpenWrite: (name: string) => `print(file.open("${name}", "w+"))`,
		fileWrite: (data: string) => `__nmtwrite("${data}")`,
		fileClose: 'file.close();print("")',
		fileFlush: 'file.flush();print("")',
		fileCompile: (name: string) => `node.compile("${name}");print("")`,
		fileRun: (name: string) => `print("");dofile("${name}")`,
		readHelperHex:
			'function __nmtread() local c = file.read(1) while c ~= nil do uart.write(0, string.format("%02X", string.byte(c))) c = file.read(1) end end print("")',
		readHelperBase64:
			'function __nmtread() local c = file.read(240);while c ~= nil do uart.write(0, encoder.toBase64(c));c = file.read(240) end end;print("")',
		fileRead: '__nmtread();print("")',
		fileOpenRead: (name: string) => `print(file.open("${name}", "r"))`,
	}
	private static readonly _commandTimeout = 1500 // msec

	private readonly _evtToTerminal = new EventEmitter<string>()
	private readonly _evtClose = new EventEmitter<void>()
	private readonly _evtReady = new EventEmitter<Error | undefined>()
	private readonly _evtBusy = new EventEmitter<boolean>()

	private _unsubscribeOnData: Disposable
	private _currentCommand: Promise<string | undefined> | undefined

	private _writeHelperInstalled = false
	private _readHelperInstalled = false
	private _isInitialized = false
	private _isBusy = true
	private _transferEncoding: 'hex' | 'base64' | undefined

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

	public get onBusyChanged(): Event<boolean> {
		return this._evtBusy.event
	}

	public async files(): Promise<DeviceFileInfo[]> {
		this.checkInitialized()

		let filesResponse = await this.executeSingleLineCommand(NodeMcu._luaCommands.listFiles)
		if (!filesResponse) {
			return []
		}
		if (filesResponse.endsWith(';')) {
			filesResponse = filesResponse.substring(0, filesResponse.length - 1)
		}

		const filesArray = filesResponse.split(';')
		return filesArray.map(f => {
			const fileData = f.split(':')
			return {
				name: fileData[0],
				size: parseInt(fileData[1], 10),
			}
		})
	}

	public async delete(fileName: string): Promise<string> {
		return this.executeSingleLineCommand(NodeMcu._luaCommands.delete(fileName))
	}

	public async upload(data: Buffer, remoteName: string, progressCb?: (percent: number) => void): Promise<void> {
		if (!this._writeHelperInstalled) {
			if (!this._transferEncoding) {
				this._transferEncoding = 'hex'
			}

			await this.executeNoReplyCommand(
				this._transferEncoding === 'hex' ? NodeMcu._luaCommands.writeHelperHex : NodeMcu._luaCommands.writeHelperBase64,
			)

			this._writeHelperInstalled = true
		}

		const openReply = await this.executeSingleLineCommand(NodeMcu._luaCommands.fileOpenWrite(remoteName))
		if (openReply === 'nil') {
			throw new Error(`Failed to open file '${remoteName}' on device for writing`)
		}

		progressCb?.(0)

		const rawData = data.toString(this._transferEncoding)
		const chunks = rawData.match(/.{1,232}/g) ?? []
		let bytesWritten = 0
		for (const chunk of chunks) {
			await this.executeNoReplyCommand(NodeMcu._luaCommands.fileWrite(chunk))
			bytesWritten += chunk.length
			progressCb?.(bytesWritten * 100 / rawData.length)
		}

		await this.executeNoReplyCommand(NodeMcu._luaCommands.fileFlush)
		await this.executeNoReplyCommand(NodeMcu._luaCommands.fileClose)

		progressCb?.(100)
	}

	public async compile(fileName: string): Promise<string> {
		return this.executeSingleLineCommand(NodeMcu._luaCommands.fileCompile(fileName))
	}

	public async run(fileName: string): Promise<string> {
		return this.executeSingleLineCommand(NodeMcu._luaCommands.fileRun(fileName))
	}

	public async download(fileName: string): Promise<Buffer> {
		if (!this._readHelperInstalled) {
			if (!this._transferEncoding) {
				this._transferEncoding = 'hex'
			}

			await this.executeNoReplyCommand(
				this._transferEncoding === 'hex' ? NodeMcu._luaCommands.readHelperHex : NodeMcu._luaCommands.readHelperBase64,
			)

			this._readHelperInstalled = true
		}

		const openReply = await this.executeSingleLineCommand(NodeMcu._luaCommands.fileOpenRead(fileName))
		if (openReply === 'nil') {
			throw new Error(`Failed to open file '${fileName}' on device for reading`)
		}

		const fileData = await this.executeSingleLineCommand(NodeMcu._luaCommands.fileRead)
		await this.executeNoReplyCommand(NodeMcu._luaCommands.fileClose)

		return Buffer.from(fileData, this._transferEncoding)
	}

	// TerminalConnectable //

	public get toTerminal(): Event<string> {
		return this._evtToTerminal.event
	}

	public fromTerminal(text: string): void {
		// eslint-disable-next-line promise/catch-or-return, promise/prefer-await-to-then
		void this.waitForCommand().then(async () => this.write(text))
	}

	public get onClose(): Event<void> {
		return this._evtClose.event
	}

	// end TerminalConnectable //

	private async handleConnect(): Promise<void> {
		try {
			await this.executeNoReplyCommand(NodeMcu._luaCommands.nodeEnableOutput)

			const uartSettings = await this.executeSingleLineCommand(NodeMcu._luaCommands.uartGetConfig)
			const settings = /(\d+)\s+(\d)\s+(\d)\s+(\d)/.exec(uartSettings ?? '')
			if (!settings || settings.length !== 5) {
				throw new Error('Failed to get UART settings')
			}

			await this.executeNoReplyCommand(
				NodeMcu._luaCommands.uartReconfig(settings[1], settings[2], settings[3], settings[4], 0),
			)

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

	private async executeNoReplyCommand(command: string): Promise<void> {
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

	private async executeSingleLineCommand(command: string): Promise<string> {
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

	private async checkEncoderBase64(): Promise<boolean> {
		const reply = await this.executeSingleLineCommand(NodeMcu._luaCommands.checkEncoderBase64)
		this._transferEncoding = reply === 'yes' ? 'base64' : 'hex'
		return reply === 'yes'
	}

	private async waitForCommand(): Promise<void> {
		while (this._currentCommand) {
			await this._currentCommand
			this._currentCommand = void 0
		}
	}

	private checkInitialized(): void {
		if (!this._isInitialized) {
			throw new Error('Device not ready')
		}
	}

	private setBusy(isBusy: boolean): void {
		if (this._isInitialized && isBusy !== this._isBusy) {
			this._isBusy = isBusy
			this._evtBusy.fire(isBusy)
		}
	}
}
