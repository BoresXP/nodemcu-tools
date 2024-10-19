import { TerminalLineColor } from '../../../messages/TerminalLine'
import styled from 'styled-components'

export const TerminalStyled = styled.div`
	white-space: pre;
	overflow-y: scroll;
	flex-grow: 1;
	background-color: var(--vscode-panel-background);
	color: var(--vscode-editor-foreground);
	border: 1px solid var(--vscode-panel-border);
	font: var(--vscode-editor-font-weight) var(--vscode-editor-font-size) var(--vscode-editor-font-family);
`

export const TerminalLine = styled.div<{ $lineColor: TerminalLineColor }>`
	margin: 2px 5px;
	color: ${props => {
		switch (props.$lineColor) {
			case 'red': {
				return '#cd0000'
			}
			case 'green': {
				return '#00cd00'
			}
			case 'yellow': {
				return '#cdcd00'
			}
			case 'blue': {
				return '#569cd6'
			}
			case 'magenta': {
				return '#cd00cd'
			}
			case 'cyan': {
				return '#00cdcd'
			}
			default: {
				return 'inherit'
			}
		}
	}};
`
