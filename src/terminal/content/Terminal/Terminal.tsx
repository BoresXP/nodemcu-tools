import React, { useCallback } from 'react'
import { TerminalLine, TerminalStyled } from './Terminal.styles'

import { getTerminalLines } from '../state/selectors'
import { useSelector } from 'react-redux'

const Terminal: React.FC = () => {
	const lines = useSelector(getTerminalLines)

	const toElements = useCallback(() => {
		if (!lines) {
			return void 0
		}

		return lines.map((l, indx) => <TerminalLine key={indx}>{l}</TerminalLine>)
	}, [lines])

	return <TerminalStyled>{toElements()}</TerminalStyled>
}

export default Terminal
