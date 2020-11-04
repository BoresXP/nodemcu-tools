import styled from 'styled-components'

export const Page = styled.div`
	background-color: var(--vscode-editor-background);
	color: var(--vscode-editor-foreground);
	display: flex;
	flex-direction: column;
	height: 100%;
`

export const TerminalContainer = styled.div`
	display: flex;
	flex: 1;
`

export const CmdlineContainer = styled.div`
	display: flex;
`

export const SnippetsContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
`
