import * as Events from '../../state/events'

import React, { useCallback, useEffect, useRef } from 'react'
import { TerminalLine, TerminalStyled } from './Terminal.styles'
import { getTerminalAutoscrollEnabled, getTerminalLines, useRootStore } from '../../state/selectors'

import { terminalLinesStore } from '../../state/store'
import { useList } from 'effector-react'

const Terminal: React.FC = () => {
	const messageEndRef = useRef(null)

	const lines = useRootStore(getTerminalLines)
	const autoscrollEnabled = useRootStore(getTerminalAutoscrollEnabled)
	useEffect(() => {
		if (autoscrollEnabled) {
			const divElement = messageEndRef.current as HTMLDivElement | null
			if (divElement) {
				divElement.scrollIntoView()
			}
		}
	}, [autoscrollEnabled, lines])

	const onScroll = useCallback((evt: React.UIEvent<HTMLDivElement>) => {
		const divElement = evt.currentTarget
		Events.terminalAutoscrollSet(divElement.clientHeight + divElement.scrollTop === divElement.scrollHeight)
	}, [])

	return (
		<TerminalStyled onScroll={onScroll}>
			{useList(terminalLinesStore, line => (
				<TerminalLine type={line.type}>{line.text}</TerminalLine>
			))}
			<div ref={messageEndRef} />
		</TerminalStyled>
	)
}

export default Terminal
