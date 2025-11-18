import { Uri, l10n, window, workspace } from 'vscode'

// prettier-ignore
/* eslint-disable @typescript-eslint/naming-convention */
interface IFlasherArgs {
	'write_flash_args': string[]
	'flash_settings': {
		flash_mode: string
		flash_size: string
		flash_freq: string
	}
	'flash_files': {
		file: Record<string, string>
	}
	'bootloader': {
		offset: string
		file: string
		encrypted: string
	}
	'app': {
		offset: string
		file: string
		encrypted: string
	}
	'partition-table': {
		offset: string
		file: string
		encrypted: string
	}
	'extra_esptool_args': {
		after: string
		before: string
		stub: boolean
		chip: string
	}
}
/* eslint-enable @typescript-eslint/naming-convention */

interface IFlashSettings {
	esptool?: string
	firmwareDir?: string
	chipModel: string
	baud: string
	target?: string
	legacy: boolean
}
interface IExtraArgs {
	files?: string
	writeFlashArgs?: string
	extraEsptoolArgs: string
	erase: string
	write: string
}
type CommandLineArgs = IExtraArgs & Omit<IFlashSettings, 'legacy'>
type Write32args = Pick<CommandLineArgs, 'files' | 'writeFlashArgs'>
type UserSettings = Partial<IFlashSettings>

export default class Flash {
	public static async fillCommandLine(path: string, action: string): Promise<string | undefined> {
		let commandLine: string | undefined = void 0
		const flashConfig = this.getConfig()
		if (!flashConfig?.chipModel) {
			window.showInformationMessage(l10n.t('The "flash" or "chipModel" setting is missing in the settings.json file.'))
			return void 0
		}
		if (!checkChipModel(flashConfig.chipModel)) {
			window.showErrorMessage(l10n.t('Incorrect chip model: "{0}"', flashConfig.chipModel))
			return void 0
		}

		const opts = getOpts(flashConfig.legacy)
		const cl: CommandLineArgs = {
			...flashConfig,
			files: void 0,
			writeFlashArgs: void 0,
			extraEsptoolArgs: opts.extraArgs,
			erase: opts.erase,
			write: opts.write,
		}

		if (flashConfig.chipModel === 'esp8266') {
			cl.writeFlashArgs = this.get8266args(flashConfig, opts)
			if (!cl.writeFlashArgs) {
				window.showErrorMessage(l10n.t('Incorrect flash target: "{0}"', flashConfig.target ?? 'undefined'))
				return void 0
			}
		} else {
			const args = await this.get32args(flashConfig, action)
			if (!args) {
				return void 0
			}
			Object.assign(cl, args)
		}

		if (action === 'flash') {
			if (flashConfig.chipModel === 'esp8266') {
				commandLine = `${cl.esptool} --chip ${cl.chipModel} --port ${path} --baud ${cl.baud} ${cl.extraEsptoolArgs} ${cl.write} ${cl.writeFlashArgs} 0x0 ${cl.firmwareDir}/0x00000.bin 0x10000 ${cl.firmwareDir}/0x10000.bin`
			} else {
				commandLine = `${cl.esptool} --chip ${cl.chipModel} --port ${path} --baud ${cl.baud} ${cl.extraEsptoolArgs} ${cl.write} ${cl.writeFlashArgs} ${cl.files}`
			}
		} else if (action === 'erase') {
			commandLine = `${cl.esptool} --chip ${cl.chipModel} --port ${path} --baud ${cl.baud} ${cl.extraEsptoolArgs} ${cl.erase}`
		}

		return commandLine

		function getOpts(legacy: boolean): Record<string, string> {
			if (legacy) {
				return {
					erase: 'erase_flash',
					write: 'write_flash',
					args4mb: '--flash_mode dio --flash_size 4MB --flash_freq 40m',
					args1mb: '--flash_mode dout --flash_size 1MB --flash_freq 40m',
					args512k: '--flash_mode qio --flash_size 512KB --flash_freq 40m',
					extraArgs: '--before default_reset --after hard_reset',
				}
			}

			return {
				erase: 'erase-flash',
				write: 'write-flash',
				args4mb: '--flash-mode dio --flash-size 4MB --flash-freq 40m',
				args1mb: '--flash-mode dout --flash-size 1MB --flash-freq 40m',
				args512k: '--flash-mode qio --flash-size 512KB --flash-freq 40m',
				extraArgs: '--before default-reset --after hard-reset',
			}
		}

		function checkChipModel(chipModel: string): boolean {
			const allowedChips = [
				'esp8266',
				'esp32',
				'esp32s2',
				'esp32s3',
				'esp32c3',
				'esp32c2',
				'esp32c6',
				'esp32c61',
				'esp32c5',
				'esp32h2',
				'esp32h21',
				'esp32p4',
				'esp32h4',
			]
			return allowedChips.includes(chipModel)
		}
	}

	private static getConfig(): IFlashSettings | undefined {
		const flashConfig: IFlashSettings = {
			esptool: 'esptool',
			firmwareDir: 'bin',
			chipModel: '',
			baud: '115200',
			target: void 0,
			legacy: false,
		}

		const userSettings = workspace.getConfiguration().get<UserSettings>('nodemcu-tools.flash')
		if (!userSettings?.chipModel) {
			return void 0
		}
		Object.assign(flashConfig, userSettings)

		return flashConfig
	}

	private static get8266args(flashConfig: IFlashSettings, opts: Record<string, string>): string | undefined {
		switch (flashConfig.target) {
			case 'flash4m':
				return opts.args4mb
			case 'flash1m-dout':
				return opts.args1mb
			case 'flash512k':
				return opts.args512k
			default:
				return void 0
		}
	}

	private static async get32args(flashConfig: IFlashSettings, action: string): Promise<Write32args | undefined> {
		const writeArgs: Write32args = {
			writeFlashArgs: void 0,
			files: void 0,
		}
		if (action === 'erase') {
			return writeArgs
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const flashArgsFile = Uri.joinPath(workspace.workspaceFolders![0].uri, 'bin/flasher_args.json')
		try {
			const data = await workspace.fs.readFile(flashArgsFile)
			const flasherArgs = JSON.parse(Buffer.from(data).toString('utf8')) as IFlasherArgs
			if (flasherArgs.extra_esptool_args.chip !== flashConfig.chipModel) {
				window.showErrorMessage(
					l10n.t(
						'Chip model mismatch: "{0}" vs "{1}"',
						flasherArgs.extra_esptool_args.chip,
						flashConfig.chipModel ?? 'undefined',
					),
				)
				return void 0
			}

			if (flashConfig.legacy) {
				writeArgs.writeFlashArgs = flasherArgs.write_flash_args.join(' ')
			} else {
				const tempArgs = flasherArgs.write_flash_args.map(item => {
					if (item === '--flash_mode') {
						return '--flash-mode'
					}
					if (item === '--flash_size') {
						return '--flash-size'
					}
					if (item === '--flash_freq') {
						return '--flash-freq'
					}
					return item
				})
				writeArgs.writeFlashArgs = tempArgs.join(' ')
			}

			writeArgs.files = `${flasherArgs.bootloader.offset} ${flashConfig.firmwareDir}/bootloader.bin ${flasherArgs['partition-table'].offset} ${flashConfig.firmwareDir}/partition-table.bin ${flasherArgs.app.offset} ${flashConfig.firmwareDir}/nodemcu.bin`
			return writeArgs
		} catch (err) {
			if (err instanceof Error) {
				window.showErrorMessage(l10n.t('Can not open file "{0}"', flashArgsFile.path))
				return void 0
			}
		}
	}
}
