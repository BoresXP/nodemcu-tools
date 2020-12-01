import * as Events from '../../state/events'

import {
	CmdLineInput,
	RunButton,
	TerminalContainerStyled,
	TerminalControls,
	TerminalInnerContainer,
} from './TerminalContainer.styles'
import React, { useCallback } from 'react'
import { getCurrentCommandText, getDeviceBusy, useRootStore } from '../../state/selectors'

import { Button } from '../../controls'
import Terminal from '../Terminal/Terminal'

const TerminalContainer: React.FC = () => {
	const isDeviceBusy = useRootStore(getDeviceBusy)
	const cmdText = useRootStore(getCurrentCommandText)

	const onKeyUp = useCallback(
		(evt: React.KeyboardEvent<HTMLInputElement>) => {
			const domImput = evt.target as HTMLInputElement
			switch (evt.key) {
				case 'Enter':
					if (!isDeviceBusy) {
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

	return (
		<TerminalContainerStyled>
			<TerminalInnerContainer>
				<Terminal />
				<CmdLineInput onKeyUp={onKeyUp} onChange={onChange} value={cmdText} />
			</TerminalInnerContainer>
			<TerminalControls>
				<Button onClick={onClear}>Clear</Button>
				<RunButton disabled={isDeviceBusy} onClick={onRun}>
					Run
				</RunButton>
			</TerminalControls>
		</TerminalContainerStyled>
	)
}

export default TerminalContainer
