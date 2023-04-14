import React, { useCallback } from 'react'
import { getDeviceBusy, useRootStore } from '../../state/selectors'

import { SnippetButtonStyled } from './SnippetButton.styles'
import { terminalCommand } from '../../state/events'

interface ISnippetButtonProps {
	caption: string
	command: string
}

const SnippetButton: React.FC<ISnippetButtonProps> = ({ caption, command }) => {
	const isDeviceBusy = useRootStore(getDeviceBusy)

	const onClicked = useCallback(() => terminalCommand(command), [command])

	return (
		<SnippetButtonStyled disabled={isDeviceBusy} onClick={onClicked} data-tooltip-id="snippet-tooltip" data-tooltip-content={command}>
			{caption}
		</SnippetButtonStyled>
	)
}

export default SnippetButton
