import NodeMcu from './NodeMcu'

export interface DeviceFileInfo {
	name: string
	size: number
}

export default class NodeMcuCommands {
	private static readonly _luaCommands = {
		listFiles:
			'local l = file.list() local s = "" for k,v in pairs(l) do s = s .. k .. ":" .. v .. ";" end uart.write(0, s .. "\\r\\n")',

		delete: (name: string) => `file.remove("${name}");uart.write(0, "Done\\r\\n")`,

		checkEncoderBase64: 'if encoder and encoder.fromBase64 then print("yes") else print("no") end',
		writeHelperHex:
			'_G.__nmtwrite = function(s) for c in s:gmatch("..") do file.write(string.char(tonumber(c, 16))) end print(s.length) end print("")',
		writeHelperBase64: '_G.__nmtwrite = function(s) file.write(encoder.fromBase64(s)) print(s.length) end print("")',
		fileClose: 'file.close();print("")',
		fileCompile: (name: string) => `node.compile("${name}");uart.write(0, "Done\\r\\n")`,
		fileRun: (name: string) => `dofile("${name}");uart.write(0, "Done\\r\\n")`,
		readHelperHex:
			'function __nmtread() local c = file.read(1) while c ~= nil do uart.write(0, string.format("%02X", string.byte(c))) c = file.read(1) end end print("")',
		readHelperBase64:
			'function __nmtread() local c = file.read(240);while c ~= nil do uart.write(0, encoder.toBase64(c));c = file.read(240) end end;print("")',
		fileRead: '__nmtread();print("")',
		fileOpenRead: (name: string) => `print(file.open("${name}", "r"))`,

		writeFileHelper: (name: string, fileSize: number) =>
			`file.open("${name}", "w+");local bw = 0;uart.on("data", 0, function(data) bw = bw + 1;file.write(data);if bw == ${fileSize} then uart.on("data");file.close();uart.write(0,"Done uploading\\r\\n") end end, 0);uart.write(0,"Ready\\r\\n")`,
	}

	private readonly _device: NodeMcu

	private _readHelperInstalled = false
	private _transferEncoding: 'hex' | 'base64' | undefined

	constructor(device: NodeMcu) {
		this._device = device
	}

	public async files(): Promise<DeviceFileInfo[]> {
		await this.checkReady()

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
		await this.checkReady()
		await this._device.executeSingleLineCommand(NodeMcuCommands._luaCommands.delete(fileName))
	}

	public async upload(data: Buffer, remoteName: string, progressCb?: (percent: number) => void): Promise<void> {
		await this.checkReady()

		progressCb?.(0)

		await this._device.executeSingleLineCommand(
			NodeMcuCommands._luaCommands.writeFileHelper(remoteName, data.length),
			false,
		)

		const doneUploading = new Promise(resolve => {
			const unsubscribe = this._device.toTerminal(line => {
				if (line.includes('Done uploading')) {
					unsubscribe.dispose()
					resolve()
				}
			})
		})

		await this._device.writeRaw(data)
		await doneUploading

		progressCb?.(100)
		await this._device.toggleNodeOutput(true)
		this._device.setBusy(false)
	}

	public async compile(fileName: string): Promise<void> {
		await this.checkReady()
		await this._device.executeSingleLineCommand(NodeMcuCommands._luaCommands.fileCompile(fileName))
	}

	public async run(fileName: string): Promise<void> {
		await this.checkReady()
		await this._device.executeSingleLineCommand(NodeMcuCommands._luaCommands.fileRun(fileName))
	}

	public async download(fileName: string): Promise<Buffer> {
		if (!this._readHelperInstalled) {
			if (!this._transferEncoding) {
				this._transferEncoding = 'hex'
			}

			await this._device.executeSingleLineCommand(
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
		await this._device.executeSingleLineCommand(NodeMcuCommands._luaCommands.fileClose)

		return Buffer.from(fileData, this._transferEncoding)
	}

	private async checkReady(): Promise<void> {
		await this._device.waitToBeReady()
	}
}
