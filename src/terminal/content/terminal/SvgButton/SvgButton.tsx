import React from 'react'
import { SvgButtonStyled } from './SvgButton.styles'

export interface ISvgButtonProps {
	svgName: string
	onClick: () => void
	disabled?: boolean
}

const SvgButton: React.FC<ISvgButtonProps> = ({ svgName, onClick, disabled }) => (
	<SvgButtonStyled onClick={onClick} disabled={disabled}>
		<svg>
			<use href={svgName} />
		</svg>
	</SvgButtonStyled>
)

export default SvgButton
