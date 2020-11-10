import { Page } from './App.styles'
import React from 'react'
import SnippetsContainer from '../snippets/SnippetsContainer/SnippetsContainer'
import TerminalContainer from '../terminal/TerminalContainer/TerminalContainer'

const App: React.FC = () => (
	<Page>
		<TerminalContainer />
		<SnippetsContainer />
	</Page>
)

export default App
