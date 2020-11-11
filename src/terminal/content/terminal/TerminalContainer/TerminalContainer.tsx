import {
	CmdLineInput,
	RunButton,
	TerminalContainerStyled,
	TerminalControls,
	TerminalInnerContainer,
} from './TerminalContainer.styles'
import React, { useCallback, useRef } from 'react'
import { terminalCommand, terminalLinesClear } from '../../state/actions'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '../../controls'
import Terminal from '../Terminal/Terminal'
import { getDeviceBusy } from '../../state/selectors'

const TerminalContainer: React.FC = () => {
	const dispatch = useDispatch()

	const cmdLineInputRef = useRef<HTMLInputElement>(null)

	const isDeviceBusy = useSelector(getDeviceBusy)

	const onKeyUp = useCallback(
		(evt: React.KeyboardEvent<HTMLInputElement>) => {
			const domImput = evt.target as HTMLInputElement
			if (evt.key === 'Enter' && !isDeviceBusy) {
				dispatch(terminalCommand(domImput.value))
			}
		},
		[dispatch, isDeviceBusy],
	)
	const onRun = useCallback(() => {
		const cmd = cmdLineInputRef.current?.value
		if (cmd && !isDeviceBusy) {
			dispatch(terminalCommand(cmd))
		}
	}, [dispatch, isDeviceBusy])
	const onClear = useCallback(() => {
		dispatch(terminalLinesClear())
	}, [dispatch])

	return (
		<TerminalContainerStyled>
			<TerminalInnerContainer>
				<Terminal />
				<CmdLineInput ref={cmdLineInputRef} onKeyUp={onKeyUp} />
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
