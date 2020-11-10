import React from 'react'
import SnippetButton from '../SnippetButton/SnippetButton'
import { SnippetsContainerStyled } from './SnippetsContainer.styles'
import { getSnippets } from '../../state/selectors'
import { useSelector } from 'react-redux'

const SnippetsContainer: React.FC = () => {
	const snippets = useSelector(getSnippets)

	const getSnippetButton = (caption: string, command: string): React.ReactElement =>
		<SnippetButton key={caption + command} caption={caption} command={command} />

	return (
		<SnippetsContainerStyled>
			{Object.keys(snippets).map(key => getSnippetButton(key, snippets[key]))}
		</SnippetsContainerStyled>
	)
}

export default SnippetsContainer
