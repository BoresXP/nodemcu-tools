import styled, { createGlobalStyle } from 'styled-components'

export const StatusBarItemStyled = styled.div`
	padding: 2px 5px;
	cursor: pointer;

	&:hover {
		background-color: var(--vscode-statusBarItem-hoverBackground);
	}
`

// eslint-disable-next-line @typescript-eslint/naming-convention
export const HoverTooltipGLobalClass = createGlobalStyle`
.nodemcu-tools-modules-tooltip {
	background-color: var(--vscode-badge-background);
  color: var(--vscode-badge-foreground);
	text-align: center;
	width: 500px;
	font-size: 16px;
	pointer-events: auto;
	&:hover {
   		visibility: visible;
   		opacity: 1;
	}
}

.nodemcu-tools-tooltip {
	max-width: 600px;
  background-color: var(--vscode-badge-background);
  color: var(--vscode-badge-foreground);
  font: var(--vscode-font-weight) var(--vscode-font-size) var(--vscode-font-family);
}
`
