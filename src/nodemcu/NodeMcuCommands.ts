import NodeMcu from './NodeMcu'

export interface DeviceFileInfo {
	name: string
	size: number
}

export default class NodeMcuCommands {
	private static readonly _luaCommands = {
		listFiles:
			'local l=file.list();local s="";for k,v in pairs(l) do s=s..k..":"..v..";" end uart.write(0, s.."\\r\\n")',
		delete: (name: string) => `file.remove("${name}")`,
		checkEncoderBase64: 'if encoder and encoder.fromBase64 then print("yes") else print("no") end',
		writeHelperHex:
			'_G.__nmtwrite = function(s) for c in s:gmatch("..") do file.write(string.char(tonumber(c, 16))) end print(s.length) end print("")',
		writeHelperBase64: '_G.__nmtwrite = function(s) file.write(encoder.fromBase64(s)) print(s.length) end print("")',
		fileOpenWrite: (name: string) => `print(file.open("${name}", "w+"))`,
		fileWrite: (data: string) => `__nmtwrite("${data}")`,
		fileClose: 'file.close();print("")',
		fileFlush: 'file.flush();print("")',
		fileCompile: (name: string) => `node.compile("${name}")`,
		fileRun: (name: string) => `dofile("${name}")`,
		readHelperHex:
			'function __nmtread() local c = file.read(1) while c ~= nil do uart.write(0, string.format("%02X", string.byte(c))) c = file.read(1) end end print("")',
		readHelperBase64:
			'function __nmtread() local c = file.read(240);while c ~= nil do uart.write(0, encoder.toBase64(c));c = file.read(240) end end;print("")',
		fileRead: '__nmtread();print("")',
		fileOpenRead: (name: string) => `print(file.open("${name}", "r"))`,
	}

	private readonly _device: NodeMcu

	private _writeHelperInstalled = false
	private _readHelperInstalled = false
	private _transferEncoding: 'hex' | 'base64' | undefined

	constructor(device: NodeMcu) {
		this._device = device
	}

	public async files(): Promise<DeviceFileInfo[]> {
		this.checkInitialized()

		let filesResponse = await this._device.executeSingleLineCommand(NodeMcuCommands._luaCommands.listFiles)
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

	public async delete(fileName: string): Promise<void> {
		return this._device.executeNoReplyCommand(NodeMcuCommands._luaCommands.delete(fileName))
	}

	public async upload(data: Buffer, remoteName: string, progressCb?: (percent: number) => void): Promise<void> {
		if (!this._writeHelperInstalled) {
			if (!this._transferEncoding) {
				this._transferEncoding = 'hex'
			}

			await this._device.executeNoReplyCommand(
				this._transferEncoding === 'hex'
					? NodeMcuCommands._luaCommands.writeHelperHex
					: NodeMcuCommands._luaCommands.writeHelperBase64,
			)

			this._writeHelperInstalled = true
		}

		const openReply = await this._device.executeSingleLineCommand(NodeMcuCommands._luaCommands.fileOpenWrite(remoteName))
		if (openReply === 'nil') {
			throw new Error(`Failed to open file '${remoteName}' on device for writing`)
		}

		progressCb?.(0)

		const rawData = data.toString(this._transferEncoding)
		const chunks = rawData.match(/.{1,232}/g) ?? []
		let bytesWritten = 0
		for (const chunk of chunks) {
			await this._device.executeNoReplyCommand(NodeMcuCommands._luaCommands.fileWrite(chunk))
			bytesWritten += chunk.length
			progressCb?.(bytesWritten * 100 / rawData.length)
		}

		await this._device.executeNoReplyCommand(NodeMcuCommands._luaCommands.fileFlush)
		await this._device.executeNoReplyCommand(NodeMcuCommands._luaCommands.fileClose)

		progressCb?.(100)
	}

	public async compile(fileName: string): Promise<void> {
		return this._device.executeNoReplyCommand(NodeMcuCommands._luaCommands.fileCompile(fileName))
	}

	public async run(fileName: string): Promise<void> {
		return this._device.executeNoReplyCommand(NodeMcuCommands._luaCommands.fileRun(fileName))
	}

	public async download(fileName: string): Promise<Buffer> {
		if (!this._readHelperInstalled) {
			if (!this._transferEncoding) {
				this._transferEncoding = 'hex'
			}

			await this._device.executeNoReplyCommand(
				this._transferEncoding === 'hex'
					? NodeMcuCommands._luaCommands.readHelperHex
					: NodeMcuCommands._luaCommands.readHelperBase64,
			)

			this._readHelperInstalled = true
		}

		const openReply = await this._device.executeSingleLineCommand(NodeMcuCommands._luaCommands.fileOpenRead(fileName))
		if (openReply === 'nil') {
			throw new Error(`Failed to open file '${fileName}' on device for reading`)
		}

		const fileData = await this._device.executeSingleLineCommand(NodeMcuCommands._luaCommands.fileRead)
		await this._device.executeNoReplyCommand(NodeMcuCommands._luaCommands.fileClose)

		return Buffer.from(fileData, this._transferEncoding)
	}

	private async checkEncoderBase64(): Promise<boolean> {
		const reply = await this._device.executeSingleLineCommand(NodeMcuCommands._luaCommands.checkEncoderBase64)
		this._transferEncoding = reply === 'yes' ? 'base64' : 'hex'
		return reply === 'yes'
	}

	private checkInitialized(): void {
		if (!this._device.isInitialized) {
			throw new Error('Device not ready')
		}
	}
}
