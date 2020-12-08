import React from 'react'
import ReactTooltip from 'react-tooltip'
import StatusBarItem from '../StatusBarItem/StatusBarItem'
import { StatusBarStyled } from './StatusBar.styles'

const StatusBar: React.FC = () => (
	<StatusBarStyled>
		<StatusBarItem text="1024 Kb" tooltip="Free heap" />
		<StatusBarItem text="integer" tooltip="Number type" />
		<ReactTooltip effect="solid" />
	</StatusBarStyled>
)

export default StatusBar
