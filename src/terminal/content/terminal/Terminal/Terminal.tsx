import React, { useCallback, useEffect, useRef } from 'react'
import { TerminalLine, TerminalStyled } from './Terminal.styles'

import { getTerminalLines } from '../../state/selectors'
import { useSelector } from 'react-redux'

const Terminal: React.FC = () => {
	const messageEndRef = useRef(null)

	const lines = useSelector(getTerminalLines)

	const toElements = useCallback(() => {
		if (!lines) {
			return void 0
		}

		return lines.map((l, indx) => (
			<TerminalLine key={indx} type={l.type}>
				{l.text}
			</TerminalLine>
		))
	}, [lines])

	useEffect(() => {
		const divElement = messageEndRef.current as HTMLDivElement | null
		if (divElement) {
			divElement.scrollIntoView({ behavior: 'smooth' })
		}
	}, [lines])

	return (
		<TerminalStyled>
			{toElements()}
			<div ref={messageEndRef} />
		</TerminalStyled>
	)
}

export default Terminal
