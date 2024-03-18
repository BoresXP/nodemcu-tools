import * as Events from '../../state/events'

import {
	BottomContainer,
	CmdLineInput,
	MiddleContainer,
	TerminalContainerStyled,
	TerminalControls,
	TerminalInnerContainer,
	TopContainer,
} from './TerminalContainer.styles'
import React, { useCallback } from 'react'
import { getCurrentCommandText, getDeviceBusy, getTerminalAutoscrollEnabled, useRootStore } from '../../state/selectors'

import SvgButton from '../SvgButton/SvgButton'
import Terminal from '../Terminal/Terminal'
import { formatRequest } from '../../../messages/FormatRequest'
import vscode from '../../state/vscode'

const TerminalContainer: React.FC = () => {
	const isDeviceBusy = useRootStore(getDeviceBusy)
	const cmdText = useRootStore(getCurrentCommandText)
	const autoscrollEnabled = useRootStore(getTerminalAutoscrollEnabled)

	const onKeyUp = useCallback(
		(evt: React.KeyboardEvent<HTMLInputElement>) => {
			const domImput = evt.target as HTMLInputElement
			switch (evt.key) {
				case 'Enter':
					if (!isDeviceBusy && domImput.value) {
						Events.terminalCommand(domImput.value)
						Events.terminalCurrentCommandText('')
					}
					break
				case 'ArrowUp':
					Events.termialHistoryUp()
					break
				case 'ArrowDown':
					Events.termialHistoryDown()
					break
			}
		},
		[isDeviceBusy],
	)
	const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
		const domImput = evt.target as HTMLInputElement
		Events.terminalCurrentCommandText(domImput.value)
	}, [])
	const onRun = useCallback(() => {
		if (cmdText && !isDeviceBusy) {
			Events.terminalCommand(cmdText)
			Events.terminalCurrentCommandText('')
		}
	}, [cmdText, isDeviceBusy])
	const onClear = useCallback(() => {
		Events.terminalLinesClear()
	}, [])
	const onEnableAutoscroll = useCallback(() => {
		Events.terminalAutoscrollSet(true)
	}, [])
	const onFormat = useCallback(() => {
		if (!isDeviceBusy) {
			vscode.postMessage(formatRequest())
		}
	}, [isDeviceBusy])

	return (
		<TerminalContainerStyled>
			<TerminalInnerContainer>
				<Terminal />
				<CmdLineInput onKeyUp={onKeyUp} onChange={onChange} value={cmdText} />
			</TerminalInnerContainer>
			<TerminalControls>
				<SvgButton tooltip="Format ESP" svgName="#svg-folder-delete" disabled={isDeviceBusy} onClick={onFormat} />
				<TopContainer>
					<SvgButton
						tooltip="Autoscroll"
						svgName="#svg-download"
						disabled={autoscrollEnabled}
						onClick={onEnableAutoscroll}
					/>
				</TopContainer>
				<MiddleContainer>
					<SvgButton tooltip="Clear terminal" svgName="#svg-garbage" onClick={onClear} />
				</MiddleContainer>
				<BottomContainer>
					<SvgButton
						tooltip="Send to device"
						svgName="#svg-play-button"
						disabled={isDeviceBusy || !cmdText}
						onClick={onRun}
					/>
				</BottomContainer>
			</TerminalControls>
		</TerminalContainerStyled>
	)
}

export default TerminalContainer
