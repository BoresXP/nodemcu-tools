import styled from 'styled-components'

export interface ISvgButtonStyledProps {
	disabled?: boolean
}

export const SvgButtonStyled = styled.div<ISvgButtonStyledProps>`
	cursor: pointer;
	background-color: var(
		${props => (props.disabled ? '--vscode-button-secondaryBackground' : '--vscode-button-background')}
	);
	border: 0;
	height: 2.5em;
	width: 2.5em;
	position: relative;

	&:hover {
		background-color: var(--vscode-button-hoverBackground);
	}

	&:focus {
		outline: 1px solid var(--vscode-button-background);
		outline-offset: 2px;
	}

	& SVG {
		height: 2em;
		width: 2em;
		fill: var(${props => (props.disabled ? '--vscode-button-secondaryForeground' : '--vscode-button-foreground')});
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
`
