import { Disposable, Event, EventEmitter } from 'vscode'

import ITerminalConnectable from '../terminal/ITerminalConnectable'
import NodeMcuSerial from './NodeMcuSerial'

export interface DeviceFileInfo {
	name: string
	size: number
}

export default class NodeMcu extends NodeMcuSerial implements ITerminalConnectable {
	private static readonly _nodeMcuLineEnd = '\r\n'
	private static readonly _nodeMcuPrompt = '> '
	private static readonly _luaCommands = {
		listFiles: 'local l = file.list();local s = "";for k,v in pairs(l) do s = s..k..":"..v..";" end print(s)',
		delete: (name: string) => `file.remove("${name}");print("")`,
		checkEncoderBase64: 'if encoder and encoder.fromBase64 then print("yes") else print("no") end',
		writeHelperHex: '_G.__nmtwrite = function(s) for c in s:gmatch("..") do file.write(string.char(tonumber(c, 16))) end print(s.length) end print("")',
		writeHelperBase64: '_G.__nmtwrite = function(s) file.write(encoder.fromBase64(s)) print(s.length) end print("")',
		fileOpenWrite: (name: string) => `print(file.open("${name}", "w+"))`,
		fileWrite: (data: string) => `__nmtwrite("${data}")`,
		fileClose: 'file.close();print("")',
		fileFlush: 'file.flush();print("")',
		fileCompile: (name: string) => `node.compile("${name}");print("")`,
		fileRun: (name: string) => `print("");dofile("${name}")`,
		readHelperHex: 'function __nmtread() local c = file.read(1) while c ~= nil do uart.write(0, string.format("%02X", string.byte(c))) c = file.read(1) end end print("")',
		readHelperBase64: 'function __nmtread() local c = file.read(240);while c ~= nil do uart.write(0, encoder.toBase64(c));c = file.read(240) end end;print("")',
		fileRead: '__nmtread();print("")',
		fileOpenRead: (name: string) => `print(file.open("${name}", "r"))`,
		reset: 'print("");node.restart()',
	}

	private readonly _evtToTerminal = new EventEmitter<string>()
	private readonly _evtClose = new EventEmitter<void>()

	private _unsubscribeOnData: Disposable
	private _currentCommand: Promise<string> | undefined

	private _writeHelperInstalled = false
	private _readHelperInstalled = false
	private _transferEncoding: 'hex' | 'base64' | undefined

	constructor(path: string) {
		super(path)
		this._unsubscribeOnData = this.onData(data => this.handleData(data))
		this.onDisconnect(err => this.handleDicconnect(err))
	}

	private static getLineEnd(data: string): number {
		if (data) {
			const endIndx = data.indexOf(this._nodeMcuLineEnd)
			if (endIndx >= 0) {
				return endIndx + this._nodeMcuLineEnd.length
			}

			if (data === this._nodeMcuPrompt) {
				return data.length
			}
		}

		return -1
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async files(): Promise<DeviceFileInfo[]> {
		let filesResponse = '' // await this.executeCommand(NodeMcu._luaCommands.listFiles)
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
		return this.executeCommand(NodeMcu._luaCommands.delete(fileName))
	}

	public async upload(data: Buffer, remoteName: string, progressCb?: (percent: number) => void): Promise<void> {
		if (!this._writeHelperInstalled) {
			if (!this._transferEncoding) {
				this._transferEncoding = 'hex'
			}

			await this.executeCommand(
				this._transferEncoding === 'hex' ? NodeMcu._luaCommands.writeHelperHex : NodeMcu._luaCommands.writeHelperBase64)

			this._writeHelperInstalled = true
		}

		const openReply = await this.executeCommand(NodeMcu._luaCommands.fileOpenWrite(remoteName))
		if (openReply === 'nil') {
			throw new Error(`Failed to open file '${remoteName}' on device for writing`)
		}

		progressCb?.(0)

		const rawData = data.toString(this._transferEncoding)
		const chunks = rawData.match(/.{1,232}/g) ?? []
		let bytesWritten = 0
		for (const chunk of chunks) {
			await this.executeCommand(NodeMcu._luaCommands.fileWrite(chunk))
			bytesWritten += chunk.length
			progressCb?.(bytesWritten * 100 / rawData.length)
		}

		await this.executeCommand(NodeMcu._luaCommands.fileFlush)
		await this.executeCommand(NodeMcu._luaCommands.fileClose)

		progressCb?.(100)
	}

	public async compile(fileName: string): Promise<string> {
		return this.executeCommand(NodeMcu._luaCommands.fileCompile(fileName))
	}

	public async run(fileName: string): Promise<string> {
		return this.executeCommand(NodeMcu._luaCommands.fileRun(fileName))
	}

	public async download(fileName: string): Promise<Buffer> {
		if (!this._readHelperInstalled) {
			if (!this._transferEncoding) {
				this._transferEncoding = 'hex'
			}

			await this.executeCommand(
				this._transferEncoding === 'hex' ? NodeMcu._luaCommands.readHelperHex : NodeMcu._luaCommands.readHelperBase64)

			this._readHelperInstalled = true
		}

		const openReply = await this.executeCommand(NodeMcu._luaCommands.fileOpenRead(fileName))
		if (openReply === 'nil') {
			throw new Error(`Failed to open file '${fileName}' on device for reading`)
		}

		const fileData = await this.executeCommand(NodeMcu._luaCommands.fileRead)
		await this.executeCommand(NodeMcu._luaCommands.fileClose)

		return Buffer.from(fileData, this._transferEncoding)
	}

	public async reset(): Promise<void> {
		await this.executeCommand(NodeMcu._luaCommands.reset)
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

	private handleData(data: string): void {
		this._evtToTerminal.fire(data)
	}

	private handleDicconnect(_err?: Error): void {
		this._evtClose.fire()
	}

	private async executeCommand(cmd: string): Promise<string> {
		await this.waitForCommand()

		this._currentCommand = new Promise(resolve => {
			let step = 0
			let buffer = ''
			let cmdReply = ''

			// All commands are sinle line and return single line response
			const handleCommand = (data: string): void => {
				buffer += data

				let endIndx: number
				while ((endIndx = NodeMcu.getLineEnd(buffer)) >= 0) {
					const line = buffer.substring(0, endIndx)
					buffer = buffer.substring(endIndx)

					switch (step) {
						case 0:
							step = 1
							break
						case 1:
							cmdReply = line.trimEnd()
							step = 2
							break
						case 2:
							this._unsubscribeOnData.dispose()
							this._unsubscribeOnData = this.onData(text => this.handleData(text))

							this._currentCommand = void 0
							resolve(cmdReply)
							break
					}
				}
			}

			this._unsubscribeOnData.dispose()
			this._unsubscribeOnData = this.onData(handleCommand)

			void this.write(cmd + NodeMcu._nodeMcuLineEnd)
		})

		return this._currentCommand
	}

	private async checkEncoderBase64(): Promise<boolean> {
		const reply = await this.executeCommand(NodeMcu._luaCommands.checkEncoderBase64)
		this._transferEncoding = reply === 'yes' ? 'base64' : 'hex'
		return reply === 'yes'
	}

	private async waitForCommand(): Promise<void> {
		while (this._currentCommand) {
			await this._currentCommand
		}
	}
}
