import * as Actions from '../../state/actions'

import {
	CmdLineInput,
	RunButton,
	TerminalContainerStyled,
	TerminalControls,
	TerminalInnerContainer,
} from './TerminalContainer.styles'
import React, { useCallback } from 'react'
import { getCurrentCommandText, getDeviceBusy } from '../../state/selectors'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '../../controls'
import Terminal from '../Terminal/Terminal'

const TerminalContainer: React.FC = () => {
	const dispatch = useDispatch()

	const isDeviceBusy = useSelector(getDeviceBusy)
	const cmdText = useSelector(getCurrentCommandText)

	const onKeyUp = useCallback(
		(evt: React.KeyboardEvent<HTMLInputElement>) => {
			const domImput = evt.target as HTMLInputElement
			switch (evt.key) {
				case 'Enter':
					if (!isDeviceBusy) {
						dispatch(Actions.terminalCommand(domImput.value))
						dispatch(Actions.terminalCurrentCommandText(''))
					}
					break
				case 'ArrowUp':
					dispatch(Actions.termialHistoryUp())
					break
				case 'ArrowDown':
					dispatch(Actions.termialHistoryDown())
					break
			}
		},
		[dispatch, isDeviceBusy],
	)
	const onChange = useCallback(
		(evt: React.ChangeEvent<HTMLInputElement>) => {
			const domImput = evt.target as HTMLInputElement
			console.log(domImput.value)
			dispatch(Actions.terminalCurrentCommandText(domImput.value))
		},
		[dispatch],
	)
	const onRun = useCallback(() => {
		if (cmdText && !isDeviceBusy) {
			dispatch(Actions.terminalCommand(cmdText))
			dispatch(Actions.terminalCurrentCommandText(''))
		}
	}, [cmdText, dispatch, isDeviceBusy])
	const onClear = useCallback(() => {
		dispatch(Actions.terminalLinesClear())
	}, [dispatch])

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
