import React, { useCallback, useEffect } from 'react'
import { getDeviceInfo, useRootStore } from '../../state/selectors'

import ReactTooltip from 'react-tooltip'
import StatusBarItem from '../StatusBarItem/StatusBarItem'
import StatusBarModulesItem from '../StatusBarItem/StatusBarModulesItem'
import { StatusBarStyled } from './StatusBar.styles'
import { deviceInfoRequest } from '../../../messages/DeviceInfoRequest'
import vscode from '../../state/vscode'

const StatusBar: React.FC = () => {
	const info = useRootStore(getDeviceInfo)

	useEffect(() => {
		ReactTooltip.rebuild()
	}, [info])

	const onItemClick = useCallback(() => {
		vscode.postMessage(deviceInfoRequest())
	}, [])

	return (
		<StatusBarStyled>
			{typeof info.heapFree !== 'undefined' ? (
				<StatusBarItem text={info.heapFree.toLocaleString()} tooltip="Free heap (bytes)" onClick={onItemClick} />
			) : null}
			{info.numberType ? <StatusBarItem text={info.numberType} tooltip="Number type" onClick={onItemClick} /> : null}
			{info.ssl ? <StatusBarItem text="ssl" onClick={onItemClick} /> : null}
			{info.modules ? <StatusBarModulesItem modules={info.modules} /> : null}
			{info.fsTotal ? (
				<StatusBarItem
					text={`${info.fsUsed?.toLocaleString()} / ${info.fsTotal.toLocaleString()} (${Math.round(
						((info.fsUsed ?? 0) * 100) / info.fsTotal,
					)}%)`}
					tooltip="File system used"
					onClick={onItemClick}
				/>
			) : null}
		</StatusBarStyled>
	)
}

export default StatusBar
