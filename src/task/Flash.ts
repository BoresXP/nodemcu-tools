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
	chipModel?: string
	baud?: string
	target?: string
}

interface ICommandLine extends IFlashSettings {
	files: string
	writeFlashArgs: string
	extraEsptoolArgs: string
}

export default class Flash {
	public static async fillCommandLine(path: string, action: string): Promise<string | undefined> {
		let commandLine: string | undefined = void 0
		const flashConfig = await this.getConfig()
		if (!flashConfig?.chipModel) {
			window.showInformationMessage(l10n.t('The "flash" or "chipModel" setting is missing in the settings.json file.'))
			return void 0
		}

		if (action === 'flash') {
			if (flashConfig.chipModel === 'esp8266') {
				commandLine = `${flashConfig.esptool} --chip ${flashConfig.chipModel} --port ${path} --baud ${flashConfig.baud} write_flash ${flashConfig.writeFlashArgs} 0x0 ${flashConfig.firmwareDir}/0x00000.bin 0x10000 ${flashConfig.firmwareDir}/0x10000.bin`
			} else {
				commandLine = `${flashConfig.esptool} --chip ${flashConfig.chipModel} --port ${path} --baud ${flashConfig.baud} ${flashConfig.extraEsptoolArgs} write_flash ${flashConfig.writeFlashArgs} ${flashConfig.files}`
			}
		} else if (action === 'erase') {
			if (flashConfig.chipModel === 'esp8266') {
				commandLine = `${flashConfig.esptool} --chip ${flashConfig.chipModel} --port ${path} --baud ${flashConfig.baud} erase_flash`
			} else {
				commandLine = `${flashConfig.esptool} --chip ${flashConfig.chipModel} --port ${path} --baud ${flashConfig.baud} --before default_reset --after hard_reset erase_flash`
			}
		}

		return commandLine
	}

	private static async getConfig(): Promise<ICommandLine | undefined> {
		const flashConfig: ICommandLine = {
			esptool: 'esptool.py',
			firmwareDir: 'bin',
			chipModel: void 0,
			baud: '115200',
			target: void 0,
			files: '',
			writeFlashArgs: '',
			extraEsptoolArgs: '--before default_reset --after hard_reset',
		}

		const userSettings = workspace.getConfiguration().get<IFlashSettings>('nodemcu-tools.flash')
		if (!userSettings?.chipModel) {
			return void 0
		}
		for (const [option, optionValue] of Object.entries(userSettings)) {
			flashConfig[option as keyof IFlashSettings] = optionValue as never
		}

		if (flashConfig.chipModel === 'esp8266') {
			if (!flashConfig.target) {
				return void 0
			}
			switch (flashConfig.target) {
				case 'flash4m':
					flashConfig.writeFlashArgs = '--flash_mode dio --flash_size 4MB --flash_freq 40m'
					break
				case 'flash1m-dout':
					flashConfig.writeFlashArgs = '--flash_mode dout --flash_size 1MB --flash_freq 40m'
					break
				case 'flash512k':
					flashConfig.writeFlashArgs = '--flash_mode qio --flash_size 512KB --flash_freq 40m'
					break
				default:
					window.showErrorMessage(l10n.t('Incorrect flash target: "{0}"', flashConfig.target))
					return void 0
			}

			return flashConfig
		}

		if (userSettings.chipModel.startsWith('esp32')) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const flashArgsFile = Uri.joinPath(workspace.workspaceFolders![0].uri, 'bin/flasher_args.json')
			try {
				const data = await workspace.fs.readFile(flashArgsFile)
				const flasherArgs = JSON.parse(Buffer.from(data).toString('utf8')) as IFlasherArgs
				if (flasherArgs.extra_esptool_args.chip !== userSettings.chipModel) {
					window.showErrorMessage(
						l10n.t('Chip model mismatch: "{0}" vs "{1}"', flasherArgs.extra_esptool_args.chip, userSettings.chipModel),
					)
					return void 0
				}
				flashConfig.writeFlashArgs = flasherArgs.write_flash_args.join(' ')
				flashConfig.files = `${flasherArgs.bootloader.offset} ${flashConfig.firmwareDir}/bootloader.bin ${flasherArgs['partition-table'].offset} ${flashConfig.firmwareDir}/partition-table.bin ${flasherArgs.app.offset} ${flashConfig.firmwareDir}/nodemcu.bin`
			} catch (err) {
				if (err instanceof Error) {
					window.showErrorMessage(l10n.t('Can not open file "{0}"', flashArgsFile.path))
					return void 0
				}
			}

			return flashConfig
		}

		window.showErrorMessage(l10n.t('Incorrect chip model: "{0}"', userSettings.chipModel))
		return void 0
	}
}
