import React, { useCallback } from 'react'

import { SnippetButtonStyled } from './SnippetButton.styles'
import { terminalCommand } from '../state/actions'
import { useDispatch } from 'react-redux'

interface ISnippetButtonProps {
	caption: string
	command: string
}

const SnippetButton: React.FC<ISnippetButtonProps> = ({ caption, command }) => {
	const dispatch = useDispatch()

	const onClicked = useCallback(
		() => dispatch(terminalCommand(command)),
		[command, dispatch]
	)

	return <SnippetButtonStyled onClick={onClicked}>{caption}</SnippetButtonStyled>
}

export default SnippetButton
