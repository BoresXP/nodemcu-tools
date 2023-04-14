import 'react-tooltip/dist/react-tooltip.css'
import { Page } from './App.styles'
import React from 'react'
import SnippetsContainer from '../snippets/SnippetsContainer/SnippetsContainer'
import StatusBar from '../statusBar/StatusBar/StatusBar'
import TerminalContainer from '../terminal/TerminalContainer/TerminalContainer'
import { Tooltip } from 'react-tooltip'

const App: React.FC = () => (
	<Page>
		<TerminalContainer />
		<SnippetsContainer />
		<StatusBar />
		<Tooltip
			id="main-tooltip"
			delayShow={500}
			className='nodemcu-tools-tooltip'
		/>
		<Tooltip
			id='snippet-tooltip'
			delayShow={2000}
			className='nodemcu-tools-tooltip'
		/>
		<Tooltip
			id="modules-tooltip"
			delayShow={500}
			delayHide={500}
			clickable={true}
			className='nodemcu-tools-modules-tooltip'
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
			<symbol viewBox="0 0 254.833 254.833" id="svg-folder-delete">
				<path d="M32.648,62.917l9.928-23.656c1.065-3.652,4.619-6.344,8.827-6.344h73.694c4.207,0,7.761,2.691,8.826,6.344l9.927,23.656
				H32.648z M212.833,137.917c23.159,0,42,18.841,42,42s-18.841,42-42,42s-42-18.841-42-42S189.674,137.917,212.833,137.917z
	 			M220.198,162.946l-6.365,6.365l-6.365-6.365c-2.928-2.928-7.677-2.929-10.606,0.001c-2.929,2.929-2.929,7.678,0.001,10.606
				l6.364,6.363l-6.364,6.363c-2.93,2.929-2.93,7.678-0.001,10.606c1.465,1.465,3.384,2.197,5.304,2.197
				c1.919,0,3.839-0.732,5.303-2.196l6.365-6.365l6.365,6.365c1.464,1.464,3.384,2.196,5.303,2.196s3.839-0.732,5.304-2.197
				c2.929-2.929,2.929-7.678-0.001-10.606l-6.364-6.363l6.364-6.363c2.93-2.929,2.93-7.678,0.001-10.606
				S223.127,160.017,220.198,162.946z M155.833,179.917c0-31.43,25.404-57,56.833-57c5.736,0,11.334,0.86,16.334,2.444V84.667
				c0-3.728-2.689-6.75-6.417-6.75H7.083C3.355,77.917,0,80.939,0,84.667v120.5c0,3.728,3.355,6.75,7.083,6.75H165.69
				C159.473,202.787,155.833,191.77,155.833,179.917z"/>
			</symbol>
		</svg>
	</Page>
)

export default App
