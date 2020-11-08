import {
	CmdLineInput,
	RunButton,
	TerminalContainerStyled,
	TerminalControls,
	TerminalInnerContainer,
} from './TerminalContainer.styles'
import React, { useCallback, useRef } from 'react'

import { Button } from '../Controls'
import Terminal from '../Terminal/Terminal'
import { terminalCommand } from '../state/actions'
import { useDispatch } from 'react-redux'

const TerminalContainer: React.FC = () => {
	const dispatch = useDispatch()

	const cmdLineInputRef = useRef<HTMLInputElement>(null)

	const onKeyUp = useCallback(
		(evt: React.KeyboardEvent<HTMLInputElement>) => {
			const domImput = evt.target as HTMLInputElement
			if (evt.key === 'Enter') {
				dispatch(terminalCommand(domImput.value))
			}
		},
		[dispatch],
	)
	const onRun = useCallback(() => {
		const cmd = cmdLineInputRef.current?.value
		if (cmd) {
			dispatch(terminalCommand(cmd))
		}
	}, [dispatch])

	return (
		<TerminalContainerStyled>
			<TerminalInnerContainer>
				<Terminal />
				<CmdLineInput ref={cmdLineInputRef} onKeyUp={onKeyUp} />
			</TerminalInnerContainer>
			<TerminalControls>
				<Button>Clear</Button>
				<Button>Scroll</Button>
				<RunButton onClick={onRun}>Run</RunButton>
			</TerminalControls>
		</TerminalContainerStyled>
	)
}

export default TerminalContainer
