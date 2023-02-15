import NodeMcu from './NodeMcu'
import NodeMcuSerial from './NodeMcuSerial'

export interface IDeviceFileInfo {
	name: string
	size: number
}

export interface IDeviceInfo {
	numberType: string
	freeHeap: number
	ssl: boolean
	modules: string
	fsTotal: number
	fsUsed: number
}

export default class NodeMcuCommands {
	private static readonly _luaCommands8266 = {
		listFiles:
			'local l=file.list() local s=";" for k,v in pairs(l) do s=s..k..":"..v..";" end uart.write(0, s.."\\r\\n")',

		delete: (name: string) => `file.remove("${name}");uart.write(0, "Done\\r\\n")`,

		fileCompile: (name: string) => `node.compile("${name}");uart.write(0, "Done\\r\\n")`,

		fileRun: (name: string) => `dofile("${name}")`,

		fileRunAndDelete: (name: string) => `dofile("${name}");file.remove("${name}")`,

		fileSetLfs: (name: string) => `node.LFS.reload("${name}");uart.write(0, "Done\\r\\n")`,

		writeFileHelper: (name: string, fileSize: number, blockSize: number, mode: string) =>
			`file.open("${name}","${mode}");local bw=0;uart.on("data",${blockSize},function(data) bw=bw+${blockSize};file.write(data);uart.write(0,"kxyJ\\r\\n");if bw>=${fileSize} then uart.on("data");file.close();uart.write(0,"QKiw\\r\\n") end end, 0);uart.write(0,"Ready\\r\\n")`,

		readFileHelper: (name: string) =>
			`file.open("${name}", "r");uart.on("data",0,function(data) while true do local b=file.read(${NodeMcuSerial.maxLineLength});if b==nil then uart.on("data");file.close();break end uart.write(0,b) end end, 0);uart.write(0,"Ready\\r\\n")`,

		getFileSize: (name: string) => `local s=file.stat("${name}");uart.write(0, s.size .. "\\r\\n")`,

		getFreeHeap: 'uart.write(0,tostring(node.heap()).."\\r\\n")',

		getDeviceInfo:
			'local i=node.info("build_config");local s="";for k,v in pairs(i) do s=s..k..":"..tostring(v)..";" end uart.write(0,s.."\\r\\n")',

		getFsInfo: 'local remaining,used,total=file.fsinfo();uart.write(0, remaining..";"..used..";"..total.."\\r\\n")',
	}

	private static readonly _luaCommands32 = {
		listFiles: 'local l=file.list() local s=";" for k,v in pairs(l) do s=s..k..":"..v..";" end uart.write(0,s.."\\n")',

		delete: (name: string) => `file.remove("${name}");uart.write(0,"Done\\n")`,

		fileCompile: (name: string) => `node.compile("${name}");uart.write(0,"Done\\n")`,

		fileRun: (name: string) => `dofile("${name}")`,

		fileRunAndDelete: (name: string) => `dofile("${name}");file.remove("${name}")`,

		fileSetLfs: (name: string) => `node.LFS.reload("${name}");uart.write(0,"Done\\n")`,

		writeFileHelper: (name: string, fileSize: number, blockSize: number, mode: string) =>
			`__f=io.open("${name}","${mode}");local bw=0;uart.on("data",${blockSize},function(data) bw=bw+${blockSize};__f:write(data);uart.write(0,"kxyJ\\n");if bw>=${fileSize} then uart.on("data");__f:close();__f=nil;uart.write(0,"QKiw\\n") end end, 0);uart.write(0,"Ready\\n")`,

		readFileHelper: (name: string) =>
			`__f=io.input("${name}","r");uart.on(0,"data",0,function(data) while true do local b=__f:read(${NodeMcuSerial.maxLineLength});if b==nil then uart.on(0,"data");__f:close();__f=nil;break end uart.write(0,b) end end, 0);uart.write(0,"Done\\n")`,

		getFileSize: (name: string) => `local s=file.stat("${name}");uart.write(0, s.size .. "\\n")`,

		getFreeHeap: 'uart.write(0,tostring(node.heap()).."\\n")',

		getDeviceInfo:
			'local i={ssl=false,number_type="unknown",lfs_size=65536,modules="unknown"};local s="";for k,v in pairs(i) do s=s..k..":"..tostring(v)..";" end uart.write(0,s.."\\n")',

		getFsInfo: 'local remaining,used,total=file.fsinfo();uart.write(0,remaining..";"..used..";"..total.."\\n")',
	}

	private static _luaCommands = this._luaCommands8266

	private readonly _device: NodeMcu

	constructor(device: NodeMcu) {
		this._device = device

		NodeMcuCommands._luaCommands = (device.espArch === 'esp32') ? NodeMcuCommands._luaCommands32 : NodeMcuCommands._luaCommands8266
		console.log('NodeMcuCommands Arch: ', device.espArch) // eslint-disable-line no-console
	}

	public async files(): Promise<IDeviceFileInfo[]> {
		await this.checkReady()

		const filesResponse = await this._device.executeSingleLineCommand(NodeMcuCommands._luaCommands.listFiles)

		const filesArray = filesResponse.split(';')
		return filesArray
			.filter(f => f.includes(':'))
			.map(f => {
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
					NodeMcuCommands._luaCommands.writeFileHelper(
						remoteName,
						data.length - tailSize,
						NodeMcuSerial.maxLineLength,
						'w',
					),
					false,
				)

				let offset = 0
				while (data.length - offset > NodeMcuSerial.maxLineLength) {
					const block = data.slice(offset, offset + NodeMcuSerial.maxLineLength)
					await this.waitDone('kxyJ', async () => {
						await this._device.writeRaw(block)
					})

					offset += NodeMcuSerial.maxLineLength
					progressCb?.((offset * 100) / data.length)
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

	public async setLfs(fileName: string): Promise<void> {
		await this.checkReady()
		await this._device.executeSingleLineCommand(NodeMcuCommands._luaCommands.fileSetLfs(fileName))
	}

	public async run(fileName: string, deleteAfter?: boolean): Promise<void> {
		await this.checkReady()
		await this._device.fromTerminal(
			deleteAfter
				? NodeMcuCommands._luaCommands.fileRunAndDelete(fileName)
				: NodeMcuCommands._luaCommands.fileRun(fileName),
		)
	}

	public async download(fileName: string, progressCb?: (percent: number) => void): Promise<Buffer> {
		await this.checkReady()

		progressCb?.(0)

		const fileSizeStr = await this._device.executeSingleLineCommand(
			NodeMcuCommands._luaCommands.getFileSize(fileName),
			false,
		)
		const fileSize = parseInt(fileSizeStr, 10)
		let retVal: Buffer | undefined = void 0

		await this._device.executeSingleLineCommand(NodeMcuCommands._luaCommands.readFileHelper(fileName), false)

		return new Promise(resolve => {
			const unsubscribe = this._device.onDataRaw(async data => {
				retVal = retVal ? Buffer.concat([retVal, data]) : data
				progressCb?.((retVal.length * 100) / fileSize)

				if (retVal.length === fileSize) {
					unsubscribe.dispose()

					progressCb?.(100)

					await this._device.toggleNodeOutput(true)
					this._device.setBusy(false)

					resolve(retVal)
				}
			})
			void this._device.writeRaw(Buffer.alloc(1, '\0'))
		})
	}

	public async getDeviceInfo(): Promise<IDeviceInfo> {
		await this.checkReady()

		const freeHeap = await this._device.executeSingleLineCommand(NodeMcuCommands._luaCommands.getFreeHeap, false)

		const deviceInfo = await this._device.executeSingleLineCommand(NodeMcuCommands._luaCommands.getDeviceInfo, false)

		const fsInfo = await this._device.executeSingleLineCommand(NodeMcuCommands._luaCommands.getFsInfo, false)

		await this._device.toggleNodeOutput(true)
		this._device.setBusy(false)

		const infoParams: { [name: string]: string } = {}
		deviceInfo
			.split(';')
			.filter(i => i.includes(':'))
			.forEach(i => {
				const [name, value] = i.split(':', 2)
				infoParams[name] = value
			})

		const fsInfoArray = fsInfo.split(';', 3).map(fsInfoStr => parseInt(fsInfoStr, 10))

		return {
			freeHeap: parseInt(freeHeap, 10),
			numberType: infoParams['number_type'],
			ssl: infoParams['ssl'] === 'true',
			modules: infoParams['modules'],
			fsTotal: fsInfoArray[2],
			fsUsed: fsInfoArray[1],
		}
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
