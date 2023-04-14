import React from 'react'
import { StatusBarItemStyled } from './StatusBarItem.styles'

export interface IStatusBarItemProps {
	text: string
	tooltip?: string
	onClick?: () => void
}

const StatusBarItem: React.FC<IStatusBarItemProps> = ({ text, tooltip, onClick }) => (
	<StatusBarItemStyled data-tooltip-id="main-tooltip" data-tooltip-content={tooltip} onClick={onClick}>{text}</StatusBarItemStyled>
)

export default StatusBarItem
