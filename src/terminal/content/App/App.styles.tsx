import styled, { createGlobalStyle } from 'styled-components'

export const Page = styled.div`
	background-color: var(--vscode-editor-background);
	color: var(--vscode-editor-foreground);
	display: flex;
	flex-direction: column;
	height: 100%;
	font: var(--vscode-font-weight) var(--vscode-font-size) var(--vscode-font-family);

	& > DIV {
		margin: 7px 3px;
	}
`

// eslint-disable-next-line @typescript-eslint/naming-convention
export const GlobalStyles = createGlobalStyle`
HTML {
	height: 100%;
}

BODY {
	height: 100%;
	margin: 0;
}

#root {
	height: 100%;
}
`
