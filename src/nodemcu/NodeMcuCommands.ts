import NodeMcu, { IEspInfo } from './NodeMcu'

import { IDeviceInfo } from '../terminal/content/state/state'
import NodeMcuSerial from './NodeMcuSerial'

export interface IDeviceFileInfo {
	name: string
	size: number
}

interface ILuaCommands {
	listFiles: string
	delete: (name: string) => string
	fileCompile: (name: string) => string
	fileRun: (name: string) => string
	fileRunAndDelete: (name: string) => string
	fileSetLfs: (name: string) => string
	writeFileHelper: (name: string, fileSize: number, blockSize: number, mode: string) => string
	createEmptyFile: (name: string) => string
	readFileHelper: (name: string) => string
	getFileSize: (name: string) => string
	getFreeHeap: string
	getDeviceInfo: () => string
	getFsInfo: string
	sendChunkHelper: (chunkSize: number, blockSize: number, firstCall: boolean) => string
	runChunk: string
	formatEsp: string
	done: string
	setBaud: (baudrate: number) => string
}

interface ILuaCommands32legacy extends ILuaCommands {
	uartStart: string
	uartStop: string
}

export default class NodeMcuCommands {
	private static readonly _luaCommands8266: ILuaCommands = {
		listFiles: 'local l=file.list()local s=";"for k,v in pairs(l)do s=s..k..":"..v..";"end;uart.write(0,s.."\\r\\n")',

		delete: (name: string) => `file.remove("${name}")uart.write(0,"Done\\r\\n")`,

		fileCompile: (name: string) => `node.compile("${name}")uart.write(0,"Done\\r\\n")`,

		fileRun: (name: string) => `dofile("${name}")`,

		fileRunAndDelete: (name: string) => `dofile("${name}")file.remove("${name}")`,

		fileSetLfs: (name: string) => `node.LFS.reload("${name}")uart.write(0,"Done\\r\\n")`,

		writeFileHelper: (name: string, fileSize: number, blockSize: number, mode: string) =>
			`file.open("${name}","${mode}")local bw=0;uart.on("data",${blockSize},function(d)bw=bw+${blockSize};file.write(d)uart.write(0,"kxyJ\\r\\n")if bw>=${fileSize} then uart.on("data")file.close()uart.write(0,"QKiw\\r\\n")end end,0)uart.write(0,"Ready\\r\\n")`,

		createEmptyFile: (name: string) => `file.open("${name}","w")file.close()uart.write(0,"Ready\\r\\n")`,

		readFileHelper: (name: string) =>
			`file.open("${name}","r")uart.on("data",0,function(d)while true do local b=file.read(${NodeMcuSerial.maxLineLength})if b==nil then uart.on("data")file.close()break end uart.write(0,b)end end,0)uart.write(0,"Ready\\r\\n")`,

		getFileSize: (name: string) => `local s=file.stat("${name}")uart.write(0,s.size.."\\r\\n")`,

		getFreeHeap: 'uart.write(0,tostring(node.heap()).."\\r\\n")',

		getDeviceInfo: () =>
			'local i=node.info("build_config")local s="";for k,v in pairs(i) do s=s..k..":"..tostring(v)..";"end;uart.write(0,s.."\\r\\n")',

		getFsInfo: 'local remaining,used,total=file.fsinfo()uart.write(0,remaining..";"..used..";"..total.."\\r\\n")',

		sendChunkHelper: (chunkSize: number, blockSize: number, firstCall: boolean) =>
			`if ${firstCall} then _r_B={}end;local bw=0;uart.on("data",${blockSize},function(d)bw=bw+${blockSize};_r_B[#_r_B+1]=d;uart.write(0,"kxyJ\\r\\n")if bw>=${chunkSize} then uart.on("data")uart.write(0,"QKiw\\r\\n")end end,0)uart.write(0,"Ready\\r\\n")`,

		runChunk:
			'uart.write(0,".\\r\\n")local f,c=loadstring(table.concat(_r_B))if type(f)=="function"then tmr.create():alarm(100,0,function()local x,e=pcall(f)if not x then uart.write(0,"\\r\\nE: ",e.."\\r\\n")end end)else uart.write(0,"CE: "..c.."\\r\\n")end;_r_B=nil',

		formatEsp: 'file.format()\r\n',

		done: 'uart.write(0,"Done\\r\\n")',

		setBaud: (baudrate: number) => `uart.setup(0,${baudrate},8,0,1,1)\r\n`,
	}

	// commands for esp32 firmware that contains the 'console' module (UART, JTAG and CDC console)
	// Only print(), console.write(), console.on() and console.mode() are allowed
	private static readonly _luaCommands32: ILuaCommands = {
		listFiles: 'local l={}for k,v in pairs(file.list())do l[#l+1]=("%s:%d"):format(k,v)end;print(table.concat(l,";"))',

		delete: (name: string) => `file.remove("${name}")print("Done")`,

		fileCompile: (name: string) => `node.compile("${name}")print("Done")`,

		fileRun: (name: string) => `dofile("${name}")`,

		fileRunAndDelete: (name: string) => `dofile("${name}")file.remove("${name}")`,

		fileSetLfs: (name: string) => `node.LFS.reload("${name}")print("Done")`,

		writeFileHelper: (name: string, fileSize: number, blockSize: number, mode: string) =>
			`__f=io.open("${name}","${mode}")local bw,cm,co=0,console.mode,console.on;cm(0)co("data",${blockSize},function(d)bw=bw+${blockSize} __f:write(d)print"kxyJ"if bw>=${fileSize} then co("data")cm(1)__f:close()__f=nil;print"QKiw"end end)print"Ready"`,

		createEmptyFile: (name: string) => `io.open("${name}","w")io.close()print"Ready"`,

		readFileHelper: (name: string) =>
			`local fh,cm,co=io.input("${name}"),console.mode,console.on;cm(0)co("data",0,function(d)while true do local b=fh:read(${NodeMcuSerial.maxLineLength})if b==nil then co("data")cm(1)fh:close()break end;console.write(b)tmr.wdclr()end end)print"Ready"`,

		getFileSize: (name: string) => `local fh=io.open("${name}","r")local s=fh:seek("end")fh:close()print(s)`,

		getFreeHeap: 'print(tostring(node.heap()))',

		getDeviceInfo: () =>
			'local t={}for k,v in pairs(node.info("build_config"))do t[#t+1]=("%s:%s"):format(k,tostring(v))end;print(table.concat(t,";"))',

		getFsInfo: 'local remaining,used,total=file.fsinfo()print(remaining..";"..used..";"..total)',

		sendChunkHelper: (chunkSize: number, blockSize: number, firstCall: boolean) =>
			`if ${firstCall} then _r_B={}end;local bw,co,cm=0,console.on,console.mode;cm(0)co("data",${blockSize},function(d)bw=bw+${blockSize};_r_B[#_r_B+1]=d;print"kxyJ"if bw>=${chunkSize} then co("data")cm(1)print"QKiw"end end)print"Ready"`,

		runChunk:
			'print(".")local f,c=(loadstring or load)(table.concat(_r_B))if type(f)=="function"then tmr.create():alarm(100,0,function()local x,e=pcall(f)if not x then console.write("\\nE: ",e.."\\n")end end)else console.write("\\nCE: ",c.."\\n")end;_r_B=nil',

		formatEsp: 'file.format()\n',

		done: 'print("Done")',

		setBaud: () => 'print("The ESP32 console module does not support changing the baud rate")\n',
	}

	// commands for legacy esp32 firmware that does not contain the 'console' module
	// The dev-esp32-idf3-final branch firmware uses nodemcu 'file' module instead of native Lua 'io' module.
	private static readonly _luaCommands32legacy: ILuaCommands32legacy = {
		listFiles: 'local l=file.list()local s=";"for k,v in pairs(l)do s=s..k..":"..v..";"end;uart.write(0,s.."\\n")',

		delete: (name: string) => `file.remove("${name}")uart.write(0,"Done\\n")`,

		fileCompile: (name: string) => `node.compile("${name}")uart.write(0,"Done\\n")`,

		fileRun: (name: string) => `dofile("${name}")`,

		fileRunAndDelete: (name: string) => `dofile("${name}")file.remove("${name}")`,

		fileSetLfs: (name: string) => `node.LFS.reload("${name}")uart.write(0,"Done\\n")`,

		writeFileHelper: (name: string, fileSize: number, blockSize: number, mode: string) =>
			`local b,w,o=0,uart.write,file.open or io.open;__f=o("${name}","${mode}")uart.on("data",${blockSize},function(d)b=b+${blockSize};__f:write(d)w(0,"kxyJ\\n")if b>=${fileSize} then uart.on("data")__f:close()__f=nil;w(0,"QKiw\\n")end end,0)w(0,"Ready\\n")`,

		createEmptyFile: (name: string) =>
			`local o,c=file.open or io.open,file.close or io.close;o("${name}","w")c()uart.write(0,"Ready\\n")`,

		readFileHelper: (name: string) =>
			`local o=file.open or io.open;local fh=o("${name}")uart.on("data",0,function(d)while true do local b=fh:read(${NodeMcuSerial.maxLineLength})if b==nil then uart.on("data")fh:close()break end;uart.write(0,b)end end,0)uart.write(0,"Ready\\n")`,

		getFileSize: (name: string) =>
			`local o=file.open or io.open;local fh=o("${name}","r")local s=fh:seek("end")fh:close()uart.write(0,s.."\\n")`,

		getFreeHeap: 'uart.write(0,tostring(node.heap()).."\\n")',

		getDeviceInfo: () =>
			'local m={}for k,v in pairs(getmetatable(_G)["__index"])do if type(v)=="table"then m[#m+1]=k end end;local d={modules=table.concat(m,",")}local s=""for k,v in pairs(d)do s=s..k..":"..tostring(v)..";"end;uart.write(0,s.."\\n")',

		getFsInfo: 'local remaining,used,total=file.fsinfo()uart.write(0,remaining..";"..used..";"..total.."\\n")',

		sendChunkHelper: (chunkSize: number, blockSize: number, firstCall: boolean) =>
			`if ${firstCall} then _r_B={}end;local bw=0;uart.on("data",${blockSize},function(d)bw=bw+${blockSize};_r_B[#_r_B+1]=d;uart.write(0,"kxyJ\\n")if bw>=${chunkSize} then uart.on("data")uart.write(0,"QKiw\\n")end end,0)uart.write(0,"Ready\\n")`,

		runChunk:
			'uart.write(0,".\\n")local f,c=(loadstring or load)(table.concat(_r_B))if type(f)=="function"then tmr.create():alarm(100,0,function()local x,e=pcall(f)if not x then uart.write(0,"\\nE: ",e.."\\n")end end)else uart.write(0,"\\nCE: "..c.."\\n")end;_r_B=nil',

		formatEsp: 'file.format()\n',

		done: 'uart.write(0,"Done\\n")',

		setBaud: (baudrate: number) => `uart.setup(0,${baudrate},8,0,1,1)\n`,

		uartStart: 'uart.start(0)uart.write(0,".\\n")',

		uartStop: 'uart.stop(0)uart.write(0,".\\n")',
	}

	private static readonly _markers = {
		lineEndingLF: {
			lastStep: 'QKiw\n',
			nextStep: 'kxyJ\n',
			formatEnd: 'format done.\n',
		},
		lineEndingCRLF: {
			lastStep: 'QKiw\r\n',
			nextStep: 'kxyJ\r\n',
			formatEnd: 'format done.\r\n',
		},
	}

	private readonly _luaCommands: ILuaCommands | ILuaCommands32legacy
	private readonly _mark
	private readonly _device: NodeMcu
	private readonly _espInfo: IEspInfo

	constructor(device: NodeMcu, espInfo: IEspInfo) {
		this._device = device
		this._espInfo = espInfo
		if (this._espInfo.espArch === 'esp32') {
			this._luaCommands = this._espInfo.hasConsoleModule
				? NodeMcuCommands._luaCommands32
				: NodeMcuCommands._luaCommands32legacy
		} else {
			this._luaCommands = NodeMcuCommands._luaCommands8266
		}
		this._mark = this._espInfo.isMultiConsole
			? NodeMcuCommands._markers.lineEndingLF
			: NodeMcuCommands._markers.lineEndingCRLF
	}

	public async files(): Promise<IDeviceFileInfo[]> {
		await this.checkReady()

		const filesResponse = await this._device.executeSingleLineCommand(this._luaCommands.listFiles)

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
		await this._device.executeSingleLineCommand(this._luaCommands.delete(fileName))
	}

	public async upload(data: Buffer, remoteName: string, progressCb?: (percent: number) => void): Promise<void> {
		await this.checkReady()

		if (data.length === 0) {
			await this._device.executeSingleLineCommand(this._luaCommands.createEmptyFile(remoteName))
			this._device.setBusy(false)
			return
		}

		progressCb?.(0)
		await this.sendUartStart()

		let tailWriteMode = 'w'
		const tailSize =
			data.length === NodeMcuSerial.maxLineLength
				? NodeMcuSerial.maxLineLength
				: data.length % NodeMcuSerial.maxLineLength

		if (data.length > NodeMcuSerial.maxLineLength) {
			await this.waitDone(this._mark.lastStep, async () => {
				await this._device.executeSingleLineCommand(
					this._luaCommands.writeFileHelper(remoteName, data.length - tailSize, NodeMcuSerial.maxLineLength, 'w'),
					false,
				)

				let offset = 0
				while (data.length - offset >= NodeMcuSerial.maxLineLength) {
					const block = data.subarray(offset, offset + NodeMcuSerial.maxLineLength)
					await this.waitDone(this._mark.nextStep, async () => {
						await this._device.writeRaw(block)
					})

					offset += NodeMcuSerial.maxLineLength
					progressCb?.((offset * 100) / data.length)
				}
			})

			if (tailSize === 0) {
				await this.sendUartStop()
				progressCb?.(100)
				this._device.setBusy(false)
				return
			}

			tailWriteMode = 'a'
		}

		await this.waitDone(this._mark.lastStep, async () => {
			await this._device.executeSingleLineCommand(
				this._luaCommands.writeFileHelper(remoteName, tailSize, tailSize, tailWriteMode),
				false,
			)
			await this._device.writeRaw(data.length > 254 ? data.subarray(data.length - tailSize) : data)
		})

		await this.sendUartStop()
		progressCb?.(100)
		this._device.setBusy(false)
	}

	public async compile(fileName: string): Promise<void> {
		await this.checkReady()
		await this._device.executeSingleLineCommand(this._luaCommands.fileCompile(fileName))
	}

	public async setLfs(fileName: string): Promise<void> {
		await this.checkReady()
		await this._device.executeSingleLineCommand(this._luaCommands.fileSetLfs(fileName))
	}

	public async run(fileName: string, deleteAfter?: boolean): Promise<void> {
		await this.checkReady()
		await this._device.fromTerminal(
			deleteAfter ? this._luaCommands.fileRunAndDelete(fileName) : this._luaCommands.fileRun(fileName),
		)
	}

	public async download(fileName: string, progressCb?: (percent: number) => void): Promise<Buffer> {
		await this.checkReady()

		const fileSizeStr = await this._device.executeSingleLineCommand(this._luaCommands.getFileSize(fileName), false)
		const fileSize = parseInt(fileSizeStr, 10)
		let receivedFileSize = fileSize
		let retVal: Buffer | undefined = void 0

		if (fileSize === 0) {
			return new Promise(resolve => {
				this._device.setBusy(false)
				resolve(Buffer.alloc(0))
			})
		}

		const sleep = (ms: number): Promise<void> =>
			new Promise(resolve => {
				setTimeout(() => resolve(), ms)
			})

		progressCb?.(0)
		await this.sendUartStart()
		await this._device.executeSingleLineCommand(this._luaCommands.readFileHelper(fileName), false)
		// wait for Lua callback function to be ready
		await sleep(100)

		return new Promise(resolve => {
			const unsubscribe = this._device.onDataRaw(async data => {
				retVal = retVal ? Buffer.concat([retVal, data]) : data
				progressCb?.((retVal.length * 100) / fileSize)

				if (this._espInfo.espArch === 'esp32' && !this._espInfo.isMultiConsole) {
					// sometimes!! esp32 returns only one byte in the first chunk of response
					// we will have to wait a little for the second byte (if any)
					if (fileSize === 1) {
						await sleep(100)
					}
					receivedFileSize += data.filter(x => x === 10).length
				}

				if (retVal.length === receivedFileSize) {
					unsubscribe.dispose()
					await this._device.executeSingleLineCommand(this._luaCommands.done)

					await this.sendUartStop()
					progressCb?.(100)
					this._device.setBusy(false)

					if (this._espInfo.espArch === 'esp32' && !this._espInfo.isMultiConsole && receivedFileSize !== fileSize) {
						let retValnoCR = new Uint8Array()
						let startLFindex = 0

						retVal.forEach((char, indexLF, arr) => {
							if (char === 10) {
								retValnoCR = Buffer.concat([
									retValnoCR,
									arr.slice(startLFindex, indexLF - 1),
									arr.slice(indexLF, indexLF + 1),
								])
								startLFindex = indexLF + 1
							}
						})

						retVal = Buffer.concat([retValnoCR, retVal.subarray(startLFindex, retVal.length)])
					}

					resolve(retVal)
				}
			})
			void this._device.writeRaw(Buffer.alloc(1, '\0'))
		})
	}

	public async getDeviceInfo(): Promise<IDeviceInfo> {
		await this.checkReady()

		const freeHeap = await this._device.executeSingleLineCommand(this._luaCommands.getFreeHeap, false)
		const deviceInfo = await this._device.executeSingleLineCommand(this._luaCommands.getDeviceInfo(), false)
		const fsInfo = await this._device.executeSingleLineCommand(this._luaCommands.getFsInfo, false)

		this._device.setBusy(false)

		const infoParams: Record<string, string> = {}
		deviceInfo
			.split(';')
			.filter(i => i.includes(':'))
			.forEach(i => {
				const [name, value] = i.split(':', 2)
				infoParams[name] = value
			})

		// remove unwanted fields from the module list, as node.info()
		// had been introduced before 'console' module
		if (this._espInfo.espArch === 'esp32' && !this._espInfo.hasConsoleModule) {
			const systemTables = ['string', 'table', 'coroutine', 'debug', 'math', 'utf8', 'ROM']
			// eslint-disable-next-line @typescript-eslint/dot-notation
			infoParams.modules = infoParams['modules']
				.split(',')
				.reduce((actualModules: string[], item: string) => {
					if (!systemTables.includes(item)) {
						actualModules.push(item)
					}
					return actualModules
				}, [])
				.join(',')
		}

		const fsInfoArray = fsInfo.split(';', 3).map(fsInfoStr => parseInt(fsInfoStr, 10))

		return {
			// eslint-disable-next-line @typescript-eslint/dot-notation
			numberType: infoParams['number_type'] || 'unknown',
			freeHeap: parseInt(freeHeap, 10),
			// eslint-disable-next-line @typescript-eslint/dot-notation
			ssl: infoParams['ssl'] === 'true',
			modules: infoParams.modules,
			fsTotal: fsInfoArray[2],
			fsUsed: fsInfoArray[1],
			chipArch: this._espInfo.espArch,
			chipModel: this._espInfo.espModel,
			chipID: this._espInfo.espID,
		}
	}

	public async sendChunk(minifiedBlock: string): Promise<void> {
		await this.checkReady()
		await this.sendUartStart()

		minifiedBlock += this._espInfo.espArch === 'esp8266' ? ';print""\r\n' : ';print""\n'
		const data = Buffer.from(minifiedBlock)
		let firstCall = true
		const tailSize = data.length % NodeMcuSerial.maxLineLength

		if (data.length > NodeMcuSerial.maxLineLength) {
			await this.waitDone(this._mark.lastStep, async () => {
				await this._device.executeSingleLineCommand(
					this._luaCommands.sendChunkHelper(data.length - tailSize, NodeMcuSerial.maxLineLength, true),
					false,
				)

				let offset = 0
				while (data.length - offset > NodeMcuSerial.maxLineLength) {
					const block = data.subarray(offset, offset + NodeMcuSerial.maxLineLength)
					await this.waitDone(this._mark.nextStep, async () => {
						await this._device.writeRaw(block)
					})

					offset += NodeMcuSerial.maxLineLength
				}
			})

			firstCall = false
		}

		await this.waitDone(this._mark.lastStep, async () => {
			await this._device.executeSingleLineCommand(
				this._luaCommands.sendChunkHelper(tailSize, tailSize, firstCall),
				false,
			)
			await this._device.writeRaw(data.length > 254 ? data.subarray(data.length - tailSize) : data)
		})

		await this.sendUartStop()
		await this._device.executeSingleLineCommand(this._luaCommands.runChunk, false)
		this._device.setBusy(false)
	}

	public async formatEsp(): Promise<boolean> {
		await this.checkReady()
		this._device.setBusy(true)

		const waitFormatEnd = new Promise<void>((resolve, reject) => {
			const unsubscribe = this._device.onData(line => {
				if (line.endsWith(this._mark.formatEnd)) {
					unsubscribe.dispose()
					clearTimeout(timeoutID)
					resolve()
				}
			})
			const timeoutID = setTimeout(() => {
				unsubscribe.dispose()
				clearTimeout(timeoutID)
				reject(new Error('Format execution timeout'))
			}, 30000)
		})

		try {
			await this._device.write(this._luaCommands.formatEsp)
			await waitFormatEnd
			this._device.setBusy(false)
			return true
		} catch {
			this._device.setBusy(false)
			return false
		}
	}

	public async sendNewBaud(baudrate: number): Promise<void> {
		await this.checkReady()
		this._device.setBusy(true)
		await this._device.write(this._luaCommands.setBaud(baudrate))
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

	private async sendUartStart(): Promise<void> {
		if (this._espInfo.isMultiConsole && !this._espInfo.hasConsoleModule) {
			await this._device.executeSingleLineCommand((this._luaCommands as ILuaCommands32legacy).uartStart)
		}
	}

	private async sendUartStop(): Promise<void> {
		if (this._espInfo.isMultiConsole && !this._espInfo.hasConsoleModule) {
			await this._device.executeSingleLineCommand((this._luaCommands as ILuaCommands32legacy).uartStop)
		}
	}
}
