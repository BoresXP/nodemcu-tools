import { Page } from './App.styles'
import React from 'react'
import ReactTooltip from 'react-tooltip'
import SnippetsContainer from '../snippets/SnippetsContainer/SnippetsContainer'
import StatusBar from '../statusBar/StatusBar/StatusBar'
import TerminalContainer from '../terminal/TerminalContainer/TerminalContainer'

const App: React.FC = () => (
	<Page data-tip data-for="main-tooltip">
		<TerminalContainer />
		<SnippetsContainer />
		<StatusBar />
		<ReactTooltip
			id="main-tooltip"
			effect="solid"
			delayShow={500}
			padding='10px 4px 12px 4px'
			backgroundColor='var(--vscode-badge-background)'
			textColor='var(--vscode-badge-foreground)'
		/>

		<svg display="none">
			<symbol viewBox="0 0 489.7 489.7" id="svg-garbage">
				<path d="M411.8 131.7c-9.5 0-17.2 7.7-17.2 17.2v288.2c0 10.1-8.2 18.4-18.4 18.4H113.3c-10.1 0-18.4-8.2-18.4-18.4V148.8c0-9.5-7.7-17.2-17.1-17.2-9.5 0-17.2 7.7-17.2 17.2V437c0 29 23.6 52.7 52.7 52.7h262.9c29 0 52.7-23.6 52.7-52.7V148.8c0-9.5-7.7-17.1-17.1-17.1zM457.3 75.9H353V56.1C353 25.2 327.8 0 296.9 0H192.7c-31 0-56.1 25.2-56.1 56.1v19.8H32.3c-9.5 0-17.1 7.7-17.1 17.2s7.7 17.1 17.1 17.1h425c9.5 0 17.2-7.7 17.2-17.1-.1-9.6-7.7-17.2-17.2-17.2zM170.9 56.1c0-12 9.8-21.8 21.8-21.8h104.2c12 0 21.8 9.8 21.8 21.8v19.8H170.9V56.1z" />
				<path d="M262 396.6V180.9c0-9.5-7.7-17.1-17.1-17.1s-17.1 7.7-17.1 17.1v215.7c0 9.5 7.7 17.1 17.1 17.1 9.4 0 17.1-7.6 17.1-17.1zM186.1 396.6V180.9c0-9.5-7.7-17.1-17.2-17.1s-17.1 7.7-17.1 17.1v215.7c0 9.5 7.7 17.1 17.1 17.1 9.5 0 17.2-7.6 17.2-17.1zM337.8 396.6V180.9c0-9.5-7.7-17.1-17.1-17.1s-17.1 7.7-17.1 17.1v215.7c0 9.5 7.7 17.1 17.1 17.1s17.1-7.6 17.1-17.1z" />
			</symbol>
			<symbol viewBox="0 0 489.8 489.8" id="svg-play-button">
				<path d="M244.9 0C109.8 0 0 109.8 0 244.9s109.9 244.9 244.9 244.9c135.1 0 244.9-109.9 244.9-244.9C489.8 109.8 380 0 244.9 0zm0 455.5c-116.1 0-210.6-94.5-210.6-210.6S128.8 34.3 244.9 34.3s210.6 94.5 210.6 210.6S361 455.5 244.9 455.5z" />
				<path d="M375.9 230.5L200.1 117.7c-5.3-3.4-12-3.6-17.5-.6s-8.9 8.8-8.9 15v225.5c0 6.3 3.4 12 8.9 15 2.6 1.4 5.4 2.1 8.2 2.1 3.2 0 6.4-.9 9.3-2.7l175.8-112.7c4.9-3.2 7.9-8.6 7.9-14.4-.1-5.8-3-11.3-7.9-14.4zm-168 95.8V163.5l126.9 81.4-126.9 81.4z" />
			</symbol>
			<symbol viewBox="0 0 489.701 489.701" id="svg-download">
				<path d="M244.9 0c-9.5 0-17.1 7.7-17.1 17.2v312.3l-77.6-77.6c-6.7-6.7-17.6-6.7-24.3 0-6.7 6.7-6.7 17.6 0 24.3l106.9 106.9c3.2 3.2 7.6 5 12.1 5 4.6 0 8.9-1.8 12.1-5l106.9-107c6.7-6.7 6.7-17.6 0-24.3s-17.6-6.7-24.3 0L262 329.4V17.2c.1-9.5-7.6-17.2-17.1-17.2zM455.8 472.6c0-9.5-7.7-17.2-17.2-17.2H51.1c-9.5 0-17.2 7.7-17.2 17.2s7.7 17.1 17.2 17.1h387.6c9.501.1 17.1-7.6 17.1-17.1z" />
			</symbol>
		</svg>
	</Page>
)

export default App
