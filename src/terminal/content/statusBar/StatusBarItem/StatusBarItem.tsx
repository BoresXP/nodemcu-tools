import React from 'react'
import { StatusBarItemStyled } from './StatusBarItem.styles'

export interface IStatusBarItemProps {
	text: string
	tooltip?: string
}

const StatusBarItem: React.FC<IStatusBarItemProps> = ({ text, tooltip }) => (
	<StatusBarItemStyled data-tip={tooltip}>{text}</StatusBarItemStyled>
)

export default StatusBarItem
