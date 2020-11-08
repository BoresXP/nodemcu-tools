import { Page } from './App.styles'
import React from 'react'
import SnippetsContainer from '../SnippetsContainer/SnippetsContainer'
import TerminalContainer from '../TerminalContainer/TerminalContainer'

const App: React.FC = () => (
	<Page>
		<TerminalContainer />
		<SnippetsContainer />
	</Page>
)

export default App
