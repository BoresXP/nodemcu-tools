import styled from 'styled-components'

export const Page = styled.div`
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	min-height: 0;
	display: flex;
	flex-direction: column;
	background-color: var(--vscode-editor-background);
	color: var(--vscode-editor-foreground);
	font: var(--vscode-font-weight) var(--vscode-font-size) var(--vscode-font-family);

	& > DIV {
		margin: 7px 3px;
	}
`
