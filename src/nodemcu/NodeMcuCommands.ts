import NodeMcu, { IEspInfo } from './NodeMcu'

import { IDeviceInfo } from '../terminal/content/state/state'
import NodeMcuSerial from './NodeMcuSerial'

interface IDeviceFileInfo {
	name: string
	size: number
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

			getDeviceInfo: () =>
				'local i=node.info("build_config")local s="";for k,v in pairs(i) do s=s..k..":"..tostring(v)..";"end;uart.write(0,s.."\\r\\n")',

			getFsInfo: 'local remaining,used,total=file.fsinfo()uart.write(0,remaining..";"..used..";"..total.."\\r\\n")',

			sendChunkHelper: (chunkSize: number, blockSize: number, firstCall: boolean) =>
				`if ${firstCall} then _r_B={}end;local bw=0;uart.on("data",${blockSize},function(d)bw=bw+${blockSize};_r_B[#_r_B+1]=d;uart.write(0,"kxyJ\\r\\n")if bw>=${chunkSize} then uart.on("data")uart.write(0,"QKiw\\r\\n")end end,0)uart.write(0,"Ready\\r\\n")`,

			runChunk:
				'uart.write(0,".\\r\\n")local f,c=loadstring(table.concat(_r_B))if type(f)=="function"then tmr.create():alarm(100,0,function()local x,e=pcall(f)if not x then uart.write(0,"\\r\\nE: ",e.."\\r\\n")end end)else uart.write(0,"CE: "..c.."\\r\\n")end;_r_B=nil',

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
				this._espInfo.hasIOmodule
					? `__f=io.open("${name}","${mode}")local bw=0;uart.on("data",${blockSize},function(d)bw=bw+${blockSize};__f:write(d)uart.write(0,"kxyJ\\n")if bw>=${fileSize} then uart.on("data")__f:close()__f=nil;uart.write(0,"QKiw\\n")end end,0)uart.write(0,"Ready\\n")`
					: `__f=file.open("${name}","${mode}")local bw=0;uart.on("data",${blockSize},function(d)bw=bw+${blockSize};__f:write(d)uart.write(0,"kxyJ\\n")if bw>=${fileSize} then uart.on("data")__f:close()__f=nil;uart.write(0,"QKiw\\n")end end,0)uart.write(0,"Ready\\n")`,

			createEmptyFile: (name: string) =>
				this._espInfo.hasIOmodule
					? `io.open("${name}","w")io.close()uart.write(0,"Ready\\n")`
					: `file.open("${name}","w")file.close()uart.write(0,"Ready\\n")`,

			readFileHelper: (name: string) =>
				this._espInfo.hasIOmodule
					? `local fh=io.input("${name}")uart.on("data",0,function(d)while true do local b=fh:read(${NodeMcuSerial.maxLineLength})if b==nil then uart.on("data")fh:close()break end;uart.write(0,b)tmr.wdclr()end end,0)uart.write(0,"Ready\\n")`
					: `local fh=file.open("${name}")uart.on("data",0,function(d)while true do local b=fh:read(${NodeMcuSerial.maxLineLength})if b==nil then uart.on("data")fh:close()break end;uart.write(0,b)end end,0)uart.write(0,"Ready\\n")`,

			getFileSize: (name: string) =>
				this._espInfo.hasIOmodule
					? `local fh=io.open("${name}","r")local s=fh:seek("end")fh:close()uart.write(0,s.."\\n")`
					: `local fh=file.open("${name}","r")local s=fh:seek("end")fh:close()uart.write(0,s.."\\n")`,

			getFreeHeap: 'uart.write(0,tostring(node.heap()).."\\n")',

			getDeviceInfo: () =>
				this._espInfo.isNewEsp32fw
					? 'local i=node.info("build_config")local s="";for k,v in pairs(i) do s=s..k..":"..tostring(v)..";"end;uart.write(0,s.."\\n")'
					: 'local m={}for k,v in pairs(getmetatable(_G)["__index"])do if type(v)=="table"then m[#m+1]=k end end;local d={modules=table.concat(m,",")}local s=""for k,v in pairs(d)do s=s..k..":"..tostring(v)..";"end;uart.write(0,s.."\\n")',

			getFsInfo: 'local remaining,used,total=file.fsinfo()uart.write(0,remaining..";"..used..";"..total.."\\n")',

			sendChunkHelper: (chunkSize: number, blockSize: number, firstCall: boolean) =>
				`if ${firstCall} then _r_B={}end;local bw=0;uart.on("data",${blockSize},function(d)bw=bw+${blockSize};_r_B[#_r_B+1]=d;uart.write(0,"kxyJ\\n")if bw>=${chunkSize} then uart.on("data")uart.write(0,"QKiw\\n")end end,0)uart.write(0,"Ready\\n")`,

			runChunk:
				'uart.write(0,".\\n")local f,c=(loadstring or load)(table.concat(_r_B))if type(f)=="function"then tmr.create():alarm(100,0,function()local x,e=pcall(f)if not x then uart.write(0,"\\nE: ",e.."\\n")end end)else uart.write(0,"\\nCE: "..c.."\\n")end;_r_B=nil',

			formatEsp: 'file.format()',

			done: 'uart.write(0,"Done\\n")',

			uartStart: 'uart.start(0)uart.write(0,".\\n")',

			uartStop: 'uart.stop(0)uart.write(0,".\\n")',
		},
	}

	private readonly _luaCommandsHex = {
		chunkHelperHex: (chunksTotal: number) =>
			`_r_B={};__ch_Wr=function(i,s)for c in s:gmatch("..")do _r_B[#_r_B+1]=string.char(tonumber(c,16))end;if i>=${chunksTotal} then uart.write(0,"QKiw\\n")else uart.write(0,"kxyJ\\n")end end;uart.write(0,"Ready\\n")`,

		chunkHelperBase64: (chunksTotal: number) =>
			`_r_B={};__ch_Wr=function(i,s)_r_B[#_r_B+1]=encoder.fromBase64(s)if i>=${chunksTotal} then uart.write(0,"QKiw\\n")else uart.write(0,"kxyJ\\n")end end;uart.write(0,"Ready\\n")`,

		chunkSendHex: (chunkNumber: number, chunk: string) => `__ch_Wr(${chunkNumber},"${chunk}")`,

		clearChunkGlobalsHex: '__ch_Wr=nil;uart.write(0,"Done\\n")',

		writeHelperHex: (name: string, blocksTotal: number) =>
			`_f_H=io.open("${name}","w+")_f_Wr=function(i,d)for c in d:gmatch("..")do _f_H:write(string.char(tonumber(c,16)))end;if i>=${blocksTotal} then uart.write(0,"QKiw\\n")else uart.write(0,"kxyJ\\n")end end;uart.write(0,"Ready\\n")`,

		writeHelperBase64: (name: string, blocksTotal: number) =>
			`_f_H=io.open("${name}","w+")_f_Wr=function(i,d)_f_H:write(encoder.fromBase64(d))if i>=${blocksTotal} then uart.write(0,"QKiw\\n")else uart.write(0,"kxyJ\\n")end end;uart.write(0,"Ready\\n")`,

		writeFileHex: (blockNumber: number, block: string) => `_f_Wr(${blockNumber},"${block}")`,

		clearWriteFileGlobalsHex: '_f_H:close()_f_H,_f_Wr=nil,nil;uart.write(0,"Done\\n")',

		readHelperHex: (name: string) =>
			`_f_H=io.input("${name}")_f_Rd=function()local c;while true do c=_f_H:read(1)if c==nil then uart.write(0,4)break end;uart.write(0,string.format("%02X",string.byte(c)))tmr.wdclr()end end;uart.write(0,"Ready\\n")`,

		readHelperBase64: (name: string) =>
			`_f_H=io.input("${name}")_f_Rd=function()local c;while true do c=_f_H:read(240)if c==nil then uart.write(0,4)break end;uart.write(0,encoder.toBase64(c))tmr.wdclr()end end;uart.write(0,"Ready\\n")`,

		clearReadFileGlobalsHex: '_f_H:close()_f_H,_f_Rd=nil,nil;collectgarbage()uart.write(0,"Done\\n")',
	}

	private readonly _markers = {
		newEsp32firmware: {
			lastStep: 'QKiw\n',
			nextStep: 'kxyJ\n',
			formatEnd: 'format done.\n',
		},
		legacy32firmware: {
			lastStep: 'QKiw\r\n',
			nextStep: 'kxyJ\r\n',
			formatEnd: 'format done.\r\n',
		},
	}

	private readonly _luaCommands
	private readonly _mark
	private readonly _device: NodeMcu
	private readonly _espInfo: IEspInfo
	private readonly _transferEncoding: 'hex' | 'base64'

	constructor(device: NodeMcu) {
		this._device = device
		this._espInfo = device.espInfo
		this._transferEncoding = this._espInfo.hasEncoder ? 'base64' : 'hex'
		this._luaCommands =
			this._espInfo.espArch === 'esp32' ? this._commands.luaCommands32 : this._commands.luaCommands8266
		this._mark = this._espInfo.isNewEsp32fw ? this._markers.newEsp32firmware : this._markers.legacy32firmware
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

		if (this._espInfo.isUART) {
			await this.uploadBin(data, remoteName, progressCb)
		} else {
			await this.uploadHex(data, remoteName, progressCb)
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

	public async download(fileName: string, progressCb?: (percent: number) => void): Promise<Buffer> {
		await this.checkReady()

		const fileSizeStr = await this._device.executeSingleLineCommand(this._luaCommands.getFileSize(fileName), false)
		const fileSize = parseInt(fileSizeStr, 10)

		if (fileSize === 0) {
			return new Promise(resolve => {
				this._device.setBusy(false)
				resolve(Buffer.alloc(0))
			})
		}

		if (this._espInfo.isUART) {
			progressCb?.(0)
			return this.downloadBin(fileName, fileSize, progressCb)
		}

		return this.downloadHex(fileName)
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

		if (this._espInfo.espArch === 'esp32' && !this._espInfo.isNewEsp32fw) {
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

		if (!minifiedBlock.endsWith('\n')) {
			minifiedBlock += this._espInfo.espArch === 'esp8266' ? '\r\n' : '\n'
		}
		const data = Buffer.from(minifiedBlock)

		if (this._espInfo.isUART) {
			await this.sendChunkBin(data)
		} else {
			await this.sendChunkHex(data)
		}

		await this._device.executeSingleLineCommand(this._luaCommands.runChunk, false)
		this._device.setBusy(false)
	}

	public async formatEsp(): Promise<void> {
		await this.checkReady()

		await this.waitDone(this._mark.formatEnd, async () => {
			await this._device.executeSingleLineCommand(this._luaCommands.formatEsp, false)
		})

		this._device.setBusy(false)
	}

	private async sendChunkBin(data: Buffer): Promise<void> {
		if (this._espInfo.isNewEsp32fw) {
			await this._device.executeSingleLineCommand(this._luaCommands.uartStart)
		}

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

		if (this._espInfo.isNewEsp32fw) {
			await this._device.executeSingleLineCommand(this._luaCommands.uartStop)
		}
	}

	private async sendChunkHex(data: Buffer): Promise<void> {
		const content = data.toString(this._transferEncoding)
		const chunks = content.match(/.{1,240}/gs) ?? []

		await this._device.executeSingleLineCommand(
			this._transferEncoding === 'hex'
				? this._luaCommandsHex.chunkHelperHex(chunks.length)
				: this._luaCommandsHex.chunkHelperBase64(chunks.length),
			false,
		)

		for (let i = 0; i < chunks.length; i++) {
			const chunk = chunks[i]
			const chunkNumber = i + 1
			await this.waitDone(chunkNumber >= chunks.length ? this._mark.lastStep : this._mark.nextStep, async () => {
				await this._device.executeSingleLineCommand(this._luaCommandsHex.chunkSendHex(chunkNumber, chunk), false)
			})
		}
		await this._device.executeSingleLineCommand(this._luaCommandsHex.clearChunkGlobalsHex, false)
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

	private async uploadBin(data: Buffer, remoteName: string, progressCb?: (percent: number) => void): Promise<void> {
		let tailWriteMode = 'w'
		const tailSize =
			data.length === NodeMcuSerial.maxLineLength
				? NodeMcuSerial.maxLineLength
				: data.length % NodeMcuSerial.maxLineLength

		if (this._espInfo.isNewEsp32fw) {
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
				if (this._espInfo.isNewEsp32fw) {
					await this._device.executeSingleLineCommand(this._luaCommands.uartStop)
				}
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

		if (this._espInfo.isNewEsp32fw) {
			await this._device.executeSingleLineCommand(this._luaCommands.uartStop)
		}
	}

	private async uploadHex(data: Buffer, remoteName: string, progressCb?: (percent: number) => void): Promise<void> {
		const content = data.toString(this._transferEncoding)
		// max length of body (multiple of 8) = 256 - length of _f_Wr(...,"")\n
		const blocks = content.match(/.{1,240}/g) ?? []

		await this._device.executeSingleLineCommand(
			this._transferEncoding === 'hex'
				? this._luaCommandsHex.writeHelperHex(remoteName, blocks.length)
				: this._luaCommandsHex.writeHelperBase64(remoteName, blocks.length),
			false,
		)

		for (let i = 0; i < blocks.length; i++) {
			const block = blocks[i]
			const blockNumber = i + 1
			await this.waitDone(blockNumber >= blocks.length ? this._mark.lastStep : this._mark.nextStep, async () => {
				await this._device.executeSingleLineCommand(this._luaCommandsHex.writeFileHex(blockNumber, block), false)
			})
			progressCb?.((blockNumber * 100) / blocks.length)
		}

		await this._device.executeSingleLineCommand(this._luaCommandsHex.clearWriteFileGlobalsHex)
	}

	private async downloadBin(
		fileName: string,
		fileSize: number,
		progressCb?: (percent: number) => void,
	): Promise<Buffer> {
		let receivedFileSize = fileSize
		let retVal: Buffer | undefined = void 0

		if (this._espInfo.isNewEsp32fw) {
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

				if (this._espInfo.espArch === 'esp32' && !this._espInfo.isNewEsp32fw) {
					receivedFileSize += data.filter(x => x === 10).length
				}

				if (retVal.length === receivedFileSize) {
					unsubscribe.dispose()
					await this._device.executeSingleLineCommand(this._luaCommands.done)

					if (this._espInfo.isNewEsp32fw) {
						await this._device.executeSingleLineCommand(this._luaCommands.uartStop)
					}

					progressCb?.(100)
					this._device.setBusy(false)

					if (this._espInfo.espArch === 'esp32' && !this._espInfo.isNewEsp32fw && receivedFileSize !== fileSize) {
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

	private async downloadHex(fileName: string): Promise<Buffer> {
		let retVal: Buffer | undefined = void 0
		const fileReadHexCommand = '_f_Rd()\n'
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const EOT = 4 // end of transmission

		await this._device.executeSingleLineCommand(
			this._transferEncoding === 'hex'
				? this._luaCommandsHex.readHelperHex(fileName)
				: this._luaCommandsHex.readHelperBase64(fileName),
			false,
		)
		await new Promise<void>(resolve => {
			setTimeout(() => {
				resolve()
			}, 100)
		})

		return new Promise(resolve => {
			const unsubscribe = this._device.onDataRaw(async data => {
				retVal = retVal ? Buffer.concat([retVal, data]) : data

				if (retVal.includes(EOT)) {
					unsubscribe.dispose()
					await this._device.executeSingleLineCommand(this._luaCommandsHex.clearReadFileGlobalsHex)

					// remove '_f_Rd()\n' <body> 'EOT.....'
					retVal = retVal.subarray(fileReadHexCommand.length, retVal.indexOf(EOT) - retVal.length)
					const retValStr = retVal.toString()
					const fileContent =
						this._transferEncoding === 'base64' ? Buffer.from(retValStr, 'base64') : Buffer.from(retValStr, 'hex')

					this._device.setBusy(false)
					resolve(fileContent)
				}
			})
			void this._device.writeRaw(Buffer.from(fileReadHexCommand))
		})
	}
}
