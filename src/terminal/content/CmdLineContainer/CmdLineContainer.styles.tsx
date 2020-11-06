import styled from 'styled-components'

export const CmdlineContainerStyled = styled.div`
	display: flex;
`

export const CmdLineInput = styled.input`
	flex: 1;
	margin-right: 3px;
	color: var(--vscode-input-foreground);
	background-color: var(--vscode-input-background);
	border: 0;
	&:focus {
		border: 1px solid var(--vscode-input-border);
		outline: 0;
	}
`
