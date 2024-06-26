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
	chipArch: string
	chipModel: string
	chipID: string
}

export default class NodeMcuCommands {
	private readonly _commands = {
		luaCommands8266: {
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

			getDeviceInfo:
				'local i=node.info("build_config")local s="";for k,v in pairs(i) do s=s..k..":"..tostring(v)..";"end;uart.write(0,s.."\\r\\n")',

			getFsInfo: 'local remaining,used,total=file.fsinfo()uart.write(0,remaining..";"..used..";"..total.."\\r\\n")',

			sendChunkHelper: (chunkSize: number, blockSize: number, firstCall: boolean) =>
				`if ${firstCall} then _r_B={}end;local bw=0;uart.on("data",${blockSize},function(d)bw=bw+${blockSize};_r_B[#_r_B+1]=d;uart.write(0,"kxyJ\\r\\n")if bw>=${chunkSize} then uart.on("data")uart.write(0,"QKiw\\r\\n")end end,0)uart.write(0,"Ready\\r\\n")`,

			runChunk: () =>
				'uart.write(0,".\\r\\n")local f,ce=(loadstring or load)(table.concat(_r_B))if type(f)=="function"then local ok,e=pcall(f)if not ok then uart.write(0,"Execution error:\\r\\n",e.."\\r\\n")end else uart.write(0,"Compilation error:\\r\\n",ce.."\\r\\n")end;_r_B=nil',

			formatEsp: 'file.format()',

			done: 'uart.write(0,"Done\\r\\n")',

			uartStart: 'uart.start(0)uart.write(0,".\\r\\n")',

			uartStop: 'uart.stop(0)uart.write(0,".\\r\\n")',
		},

		luaCommands32: {
			listFiles: 'local l=file.list()local s=";"for k,v in pairs(l)do s=s..k..":"..v..";"end;uart.write(0,s.."\\n")',

			delete: (name: string) => `file.remove("${name}")uart.write(0,"Done\\n")`,

			fileCompile: (name: string) => `node.compile("${name}")uart.write(0,"Done\\n")`,

			fileRun: (name: string) => `dofile("${name}")`,

			fileRunAndDelete: (name: string) => `dofile("${name}")file.remove("${name}")`,

			fileSetLfs: (name: string) => `node.LFS.reload("${name}")uart.write(0,"Done\\n")`,

			writeFileHelper: (name: string, fileSize: number, blockSize: number, mode: string) =>
				`__f=io.open("${name}","${mode}")local bw=0;uart.on("data",${blockSize},function(d)bw=bw+${blockSize};__f:write(d)uart.write(0,"kxyJ\\n")if bw>=${fileSize} then uart.on("data")__f:close()__f=nil;uart.write(0,"QKiw\\n")end end,0)uart.write(0,"Ready\\n")`,

			createEmptyFile: (name: string) => `io.open("${name}","w")io.close()uart.write(0,"Ready\\n")`,

			readFileHelper: (name: string) =>
				`local fh=io.input("${name}")uart.on("data",0,function(d)while true do local b=fh:read(${NodeMcuSerial.maxLineLength})if b==nil then uart.on("data")fh:close()break end;uart.write(0,b)tmr.wdclr()end end,0)uart.write(0,"Ready\\n")`,

			getFileSize: (name: string) =>
				`local fh=io.open("${name}","r")local s=fh:seek("end")fh:close()uart.write(0,s.."\\n")`,

			getFreeHeap: 'uart.write(0,tostring(node.heap()).."\\n")',

			getDeviceInfo:
				'local m={}for k,v in pairs(getmetatable(_G)["__index"])do if type(v)=="table"then m[#m+1]=k end end;local d={modules=table.concat(m,",")}local s=""for k,v in pairs(d)do s=s..k..":"..tostring(v)..";"end;uart.write(0,s.."\\n")',

			getFsInfo: 'local remaining,used,total=file.fsinfo()uart.write(0,remaining..";"..used..";"..total.."\\n")',

			sendChunkHelper: (chunkSize: number, blockSize: number, firstCall: boolean) =>
				`if ${firstCall} then _r_B={}end;local bw=0;uart.on("data",${blockSize},function(d)bw=bw+${blockSize};_r_B[#_r_B+1]=d;uart.write(0,"kxyJ\\n")if bw>=${chunkSize} then uart.on("data")uart.write(0,"QKiw\\n")end end,0)uart.write(0,"Ready\\n")`,

			runChunk: () =>
				'uart.write(0,".\\n")local f,c=(loadstring or load)(table.concat(_r_B))if type(f)=="function"then tmr.create():alarm(100,0,function()local x,e=pcall(f)if not x then uart.write(0,"\\nE: ",e.."\\n")end end)else uart.write(0,"\\nCE: "..c.."\\n")end;_r_B=nil',

			formatEsp: 'file.format()',

			done: 'uart.write(0,"Done\\n")',

			uartStart: 'uart.start(0)uart.write(0,".\\n")',

			uartStop: 'uart.stop(0)uart.write(0,".\\n")',
		},
	}

	private readonly _markers = {
		newEsp32: {
			lastStep: 'QKiw\n',
			nextStep: 'kxyJ\n',
			formatEnd: 'format done.\n',
		},
		legacy: {
			lastStep: 'QKiw\r\n',
			nextStep: 'kxyJ\r\n',
			formatEnd: 'format done.\r\n',
		},
	}

	private readonly _luaCommands
	private readonly _mark
	private readonly _device: NodeMcu

	constructor(device: NodeMcu) {
		this._device = device
		this._luaCommands = device.espArch === 'esp32' ? this._commands.luaCommands32 : this._commands.luaCommands8266
		this._mark = device.isNewEsp32 ? this._markers.newEsp32 : this._markers.legacy
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

		let tailWriteMode = 'w'
		const tailSize =
			data.length === NodeMcuSerial.maxLineLength
				? NodeMcuSerial.maxLineLength
				: data.length % NodeMcuSerial.maxLineLength

		if (this._device.isNewEsp32) {
			await this._device.executeSingleLineCommand(this._luaCommands.uartStart)
		}

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
				if (this._device.isNewEsp32) {
					await this._device.executeSingleLineCommand(this._luaCommands.uartStop)
				}
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

		if (this._device.isNewEsp32) {
			await this._device.executeSingleLineCommand(this._luaCommands.uartStop)
		}

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

	// eslint-disable-next-line sonarjs/cognitive-complexity
	public async download(fileName: string, progressCb?: (percent: number) => void): Promise<Buffer> {
		await this.checkReady()

		progressCb?.(0)

		const fileSizeStr = await this._device.executeSingleLineCommand(this._luaCommands.getFileSize(fileName), false)
		const fileSize = parseInt(fileSizeStr, 10)
		let receivedFileSize = fileSize
		let retVal: Buffer | undefined = void 0

		if (fileSize === 0) {
			return new Promise(resolve => {
				retVal = Buffer.alloc(0)
				progressCb?.(100)
				this._device.setBusy(false)
				resolve(retVal)
			})
		}

		if (this._device.isNewEsp32) {
			await this._device.executeSingleLineCommand(this._luaCommands.uartStart)
		}

		await this._device.executeSingleLineCommand(this._luaCommands.readFileHelper(fileName), false)
		await new Promise<void>(resolve => {
			setTimeout(() => {
				resolve()
			}, 100)
		})

		return new Promise(resolve => {
			const unsubscribe = this._device.onDataRaw(async data => {
				retVal = retVal ? Buffer.concat([retVal, data]) : data
				progressCb?.((retVal.length * 100) / fileSize)

				if (this._device.espArch === 'esp32' && !this._device.isNewEsp32) {
					receivedFileSize += data.filter(x => x === 10).length
				}

				if (retVal.length === receivedFileSize) {
					unsubscribe.dispose()
					await this._device.executeSingleLineCommand(this._luaCommands.done)

					if (this._device.isNewEsp32) {
						await this._device.executeSingleLineCommand(this._luaCommands.uartStop)
					}

					progressCb?.(100)
					this._device.setBusy(false)

					if (this._device.espArch === 'esp32' && !this._device.isNewEsp32 && receivedFileSize !== fileSize) {
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

		const deviceInfo = await this._device.executeSingleLineCommand(this._luaCommands.getDeviceInfo, false)

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

		if (this._device.espArch === 'esp32') {
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
			freeHeap: parseInt(freeHeap, 10),
			// eslint-disable-next-line @typescript-eslint/dot-notation
			numberType: infoParams['number_type'] || 'unknown',
			// eslint-disable-next-line @typescript-eslint/dot-notation
			ssl: infoParams['ssl'] === 'true',
			modules: infoParams.modules,
			fsTotal: fsInfoArray[2],
			fsUsed: fsInfoArray[1],
			chipArch: this._device.espArch,
			chipModel: this._device.espModel,
			chipID: this._device.espID,
		}
	}

	public async sendChunk(minifiedBlock: string): Promise<void> {
		await this.checkReady()

		if (this._device.isNewEsp32) {
			await this._device.executeSingleLineCommand(this._luaCommands.uartStart)
		}

		let firstCall = true
		if (!minifiedBlock.endsWith('\n')) {
			minifiedBlock += this._device.espArch === 'esp8266' ? '\r\n' : '\n'
		}
		const data = Buffer.from(minifiedBlock)
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

		if (this._device.isNewEsp32) {
			await this._device.executeSingleLineCommand(this._luaCommands.uartStop)
		}

		await this._device.executeSingleLineCommand(this._luaCommands.runChunk(), false)
		this._device.setBusy(false)
	}

	public async formatEsp(): Promise<void> {
		await this.checkReady()

		await this.waitDone(this._mark.formatEnd, async () => {
			await this._device.executeSingleLineCommand(this._luaCommands.formatEsp, false)
		})

		this._device.setBusy(false)
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
