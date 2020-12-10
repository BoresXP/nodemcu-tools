import { getDeviceInfo, useRootStore } from '../../state/selectors'

import React from 'react'
import ReactTooltip from 'react-tooltip'
import StatusBarItem from '../StatusBarItem/StatusBarItem'
import { StatusBarStyled } from './StatusBar.styles'

const StatusBar: React.FC = () => {
	const info = useRootStore(getDeviceInfo)

	return (
		<StatusBarStyled>
			{typeof info.heapFree !== 'undefined' ? (
				<StatusBarItem text={`${info.heapFree.toLocaleString()}b`} tooltip="Free heap" />
			) : null}
			{info.numberType ? <StatusBarItem text={info.numberType} tooltip="Number type" /> : null}
			<ReactTooltip effect="solid" />
		</StatusBarStyled>
	)
}

export default StatusBar
