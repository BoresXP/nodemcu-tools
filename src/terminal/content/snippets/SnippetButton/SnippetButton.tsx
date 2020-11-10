import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { SnippetButtonStyled } from './SnippetButton.styles'
import { getDeviceBusy } from '../../state/selectors'
import { terminalCommand } from '../../state/actions'

interface ISnippetButtonProps {
	caption: string
	command: string
}

const SnippetButton: React.FC<ISnippetButtonProps> = ({ caption, command }) => {
	const dispatch = useDispatch()

	const isDeviceBusy = useSelector(getDeviceBusy)

	const onClicked = useCallback(
		() => dispatch(terminalCommand(command)),
		[command, dispatch]
	)

	return <SnippetButtonStyled disabled={isDeviceBusy} onClick={onClicked}>{caption}</SnippetButtonStyled>
}

export default SnippetButton
