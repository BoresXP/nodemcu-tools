import * as Events from '../../state/events'

import {
	BottomContainer,
	CmdLineInput,
	MiddleContainer,
	TerminalContainerStyled,
	TerminalControls,
	TerminalInnerContainer,
} from './TerminalContainer.styles'
import React, { useCallback } from 'react'
import { getCurrentCommandText, getDeviceBusy, getTerminalAutoscrollEnabled, useRootStore } from '../../state/selectors'

import SvgButton from '../SvgButton/SvgButton'
import Terminal from '../Terminal/Terminal'

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

	return (
		<TerminalContainerStyled>
			<TerminalInnerContainer>
				<Terminal />
				<CmdLineInput onKeyUp={onKeyUp} onChange={onChange} value={cmdText} />
			</TerminalInnerContainer>
			<TerminalControls>
				<SvgButton svgName="#svg-garbage" onClick={onClear} />
				<MiddleContainer>
					<SvgButton svgName="#svg-download" disabled={autoscrollEnabled} onClick={onEnableAutoscroll} />
				</MiddleContainer>
				<BottomContainer>
					<SvgButton svgName="#svg-play-button" disabled={isDeviceBusy || !cmdText} onClick={onRun} />
				</BottomContainer>
			</TerminalControls>
		</TerminalContainerStyled>
	)
}

export default TerminalContainer
