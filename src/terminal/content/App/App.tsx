import { CmdlineContainer, Page, SnippetsContainer, TerminalContainer } from './App.styles'

import React from 'react'

const App: React.FC = () => (
	<Page>
		<TerminalContainer></TerminalContainer>
		<CmdlineContainer></CmdlineContainer>
		<SnippetsContainer></SnippetsContainer>
	</Page>
)

export default App
