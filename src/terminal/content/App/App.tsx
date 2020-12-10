import { Page } from './App.styles'
import React from 'react'
import ReactTooltip from 'react-tooltip'
import SnippetsContainer from '../snippets/SnippetsContainer/SnippetsContainer'
import StatusBar from '../statusBar/StatusBar/StatusBar'
import TerminalContainer from '../terminal/TerminalContainer/TerminalContainer'

const App: React.FC = () => (
	<>
		<Page data-tip data-for="main-tooltip">
			<TerminalContainer />
			<SnippetsContainer />
			<StatusBar />
		</Page>
		<ReactTooltip id="main-tooltip" effect="solid" />
	</>
)

export default App
