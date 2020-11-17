import NodeMcu from './NodeMcu'
import NodeMcuSerial from './NodeMcuSerial'

export interface DeviceFileInfo {
	name: string
	size: number
}

export default class NodeMcuCommands {
	private static readonly _luaCommands = {
		listFiles:
			'local l = file.list() local s = "" for k,v in pairs(l) do s = s .. k .. ":" .. v .. ";" end uart.write(0, s .. "\\r\\n")',

		delete: (name: string) => `file.remove("${name}");uart.write(0, "Done\\r\\n")`,

		fileCompile: (name: string) => `node.compile("${name}");uart.write(0, "Done\\r\\n")`,

		fileRun: (name: string) => `dofile("${name}");uart.write(0, "Done\\r\\n")`,

		writeFileHelper: (name: string, fileSize: number, blockSize: number, mode: string) =>
			`file.open("${name}","${mode}");local bw=0;uart.on("data",${blockSize},function(data) bw=bw+${blockSize};file.write(data);uart.write(0,"kxyJ\\r\\n");if bw>=${fileSize} then uart.on("data");file.close();uart.write(0,"QKiw\\r\\n") end end, 0);uart.write(0,"ju8s\\r\\n")`,

		readFileHelper: (name: string) =>
			`file.open("${name}", "r");uart.on("data", 0, function(data) while true do local b=file.read(240);if b==nil then uart.on("data");file.close();break end uart.write(0, b) end end, 0);uart.write(0,"Ready\\r\\n")`,

		getFileSize: (name: string) => `local s=file.stat("${name}");uart.write(0, s.size .. "\\r\\n")`,
	}

	private readonly _device: NodeMcu

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

		let tailWriteMode = 'w'
		const tailSize = data.length % NodeMcuSerial.maxLineLength

		if (data.length > NodeMcuSerial.maxLineLength) {
			await this.waitDone('QKiw', async () => {
				await this._device.executeSingleLineCommand(
					NodeMcuCommands._luaCommands.writeFileHelper(remoteName, data.length - tailSize, NodeMcuSerial.maxLineLength, 'w'),
					false,
				)

				let offset = 0
				while (data.length - offset > NodeMcuSerial.maxLineLength) {
					const block = data.slice(offset, offset + NodeMcuSerial.maxLineLength)
					await this.waitDone('kxyJ', async () => {
						await this._device.writeRaw(block)
					})

					offset += NodeMcuSerial.maxLineLength
					progressCb?.(offset * 100 / data.length)
				}
			})

			tailWriteMode = 'a'
		}

		await this.waitDone('QKiw', async () => {
			await this._device.executeSingleLineCommand(
				NodeMcuCommands._luaCommands.writeFileHelper(remoteName, tailSize, tailSize, tailWriteMode),
				false,
			)
			await this._device.writeRaw(data.length > 254 ? data.slice(data.length - tailSize) : data)
		})

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
		await this.checkReady()

		const fileSize = await this._device.executeSingleLineCommand(
			NodeMcuCommands._luaCommands.getFileSize(fileName),
			false,
		)
		let retVal = Buffer.alloc(0, void 0, 'binary')

		await this._device.executeSingleLineCommand(NodeMcuCommands._luaCommands.readFileHelper(fileName))

		return new Promise(resolve => {
			const unsubscribe = this._device.onDataRaw(async data => {
				retVal = Buffer.concat([retVal, data])
				if (retVal.length === parseInt(fileSize, 10)) {
					unsubscribe.dispose()
					await this._device.toggleNodeOutput(true)
					this._device.setBusy(false)

					resolve(retVal)
				}
			})
			void this._device.writeRaw(Buffer.alloc(1, '\0'))
		})
	}

	private waitDone(key: string, processCb: () => any): Promise<void> {
		return new Promise(resolve => {
			const unsubscribe = this._device.onData(line => {
				if (line.endsWith(key)) {
					unsubscribe.dispose()
					resolve()
				}
			})
			processCb()
		})
	}

	private async checkReady(): Promise<void> {
		await this._device.waitToBeReady()
	}
}
