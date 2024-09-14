import React from 'react'
import { SvgButtonStyled } from './SvgButton.styles'

interface ISvgButtonProps {
	tooltip: string
	svgName: string
	onClick?: () => void
	disabled?: boolean
}

const SvgButton: React.FC<ISvgButtonProps> = ({ tooltip, svgName, onClick, disabled }) => (
	<SvgButtonStyled onClick={onClick} disabled={disabled} data-tooltip-id="main-tooltip" data-tooltip-place={'left'} data-tooltip-content={tooltip} >
		<svg>
			<use href={svgName} />
		</svg>
	</SvgButtonStyled>
)

export default SvgButton
