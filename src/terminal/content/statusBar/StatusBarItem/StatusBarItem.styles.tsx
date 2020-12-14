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
.nodemcu-tools-hover-tooltip {
	pointer-events: auto !important;
	&:hover {
   		visibility: visible !important;
   		opacity: 1 !important;
	}
}
`
