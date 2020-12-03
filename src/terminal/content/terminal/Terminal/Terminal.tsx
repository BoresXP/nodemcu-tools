import React, { useEffect, useRef } from 'react'
import { TerminalLine, TerminalStyled } from './Terminal.styles'
import { getTerminalLines, useRootStore } from '../../state/selectors'

import { terminalLinesStore } from '../../state/store'
import { useList } from 'effector-react'

const Terminal: React.FC = () => {
	const messageEndRef = useRef(null)

	const lines = useRootStore(getTerminalLines)
	useEffect(() => {
		const divElement = messageEndRef.current as HTMLDivElement | null
		if (divElement) {
			divElement.scrollIntoView()
		}
	}, [lines])

	return (
		<TerminalStyled>
			{useList(terminalLinesStore, line =>
				<TerminalLine type={line.type}>{line.text}</TerminalLine>
			)}
			<div ref={messageEndRef} />
		</TerminalStyled>
	)
}

export default Terminal
