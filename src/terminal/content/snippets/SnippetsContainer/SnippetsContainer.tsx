import React from 'react'
import SnippetButton from '../SnippetButton/SnippetButton'
import { SnippetsContainerStyled } from './SnippetsContainer.styles'
import { snippetsStore } from '../../state/store'
import { useList } from 'effector-react'

const SnippetsContainer: React.FC = () => (
	<SnippetsContainerStyled>
		{useList(snippetsStore, s => (
			<SnippetButton caption={s.name} command={s.command} />
		))}
	</SnippetsContainerStyled>
)

export default SnippetsContainer
