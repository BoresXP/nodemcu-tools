import { Page } from './App.styles'
import React from 'react'
import SnippetsContainer from '../snippets/SnippetsContainer/SnippetsContainer'
import StatusBar from '../statusBar/StatusBar/StatusBar'
import TerminalContainer from '../terminal/TerminalContainer/TerminalContainer'

const App: React.FC = () => (
	<Page>
		<TerminalContainer />
		<SnippetsContainer />
		<StatusBar />
	</Page>
)

export default App
