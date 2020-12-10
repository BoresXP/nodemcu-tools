import React, { useEffect } from 'react'
import { getDeviceInfo, useRootStore } from '../../state/selectors'

import ReactTooltip from 'react-tooltip'
import StatusBarItem from '../StatusBarItem/StatusBarItem'
import { StatusBarStyled } from './StatusBar.styles'

const StatusBar: React.FC = () => {
	const info = useRootStore(getDeviceInfo)

	useEffect(() => {
		ReactTooltip.rebuild()
	}, [info])

	return (
		<StatusBarStyled>
			{typeof info.heapFree !== 'undefined' ? (
				<StatusBarItem text={info.heapFree.toLocaleString()} tooltip="Free heap (bytes)" />
			) : null}
			{info.numberType ? <StatusBarItem text={info.numberType} tooltip="Number type" /> : null}
		</StatusBarStyled>
	)
}

export default StatusBar
