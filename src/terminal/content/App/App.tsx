import { GlobalStyles, Page } from './App.styles'
import React, { useEffect } from 'react'

import CmdLineContainer from '../CmdLineContainer/CmdLineContainer'
import IMessage from '../../messages/IMessage'
import SnippetsContainer from '../SnippetsContainer/SnippetsContainer'
import TerminalContainer from '../TerminalContainer/TerminalContainer'
import { isTerminalLine } from '../../messages/TerminalLine'
import { terminalLineAdd } from '../state/actions'
import { useDispatch } from 'react-redux'

const App: React.FC = () => {
	const dispatch = useDispatch()
	useEffect(() => {
		window.addEventListener('message', evt => {
			console.log(evt)
			const message = evt.data as IMessage
			if (isTerminalLine(message)) {
				dispatch(terminalLineAdd(message.text))
			}
		})
	}, [dispatch])

	return (
		<Page>
			<GlobalStyles />
			<TerminalContainer />
			<CmdLineContainer />
			<SnippetsContainer />
		</Page>
	)
}

export default App
