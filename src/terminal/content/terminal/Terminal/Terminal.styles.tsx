import { TerminalLineType } from '../../../messages/TerminalLine'
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

export const TerminalLine = styled.div<{ type: TerminalLineType }>`
	margin: 2px 5px;
	color: ${props => props.type === 'echo' ? '#569cd6' : 'inherit'};
`
