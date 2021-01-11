import { Button } from '../../controls'
import styled from 'styled-components'

export const SvgButtonStyled = styled(Button)`
	cursor: pointer;
	background-color: var(--vscode-button-background);
	border: 0;
	margin: 0 2px;
	padding: 0;
	height: 2.5em;
	width: 2.5em;

	&:hover {
		background-color: var(--vscode-button-hoverBackground);
	}

	&:focus {
		outline: 1px solid var(--vscode-button-background);
		outline-offset: 2px;
	}

	&:disabled {
		background-color: var(--vscode-button-secondaryBackground);
	}

	& SVG {
		height: 1.6em;
		width: 1.6em;
		fill: var(${props => (props.disabled ? '--vscode-button-secondaryForeground' : '--vscode-button-foreground')});
	}
`
