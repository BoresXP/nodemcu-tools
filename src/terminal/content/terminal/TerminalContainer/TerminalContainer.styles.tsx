import styled from 'styled-components'

export const TerminalContainerStyled = styled.div`
	display: flex;
	flex-grow: 1;
	min-height: 0;
	margin: 3px;
`

export const TerminalInnerContainer = styled.div`
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	min-width: 0;
`

export const TerminalControls = styled.div`
	display: flex;
	flex-direction: column;
	margin-left: 3px;
`

export const CmdLineInput = styled.input`
	color: var(--vscode-input-foreground);
	background-color: var(--vscode-input-background);
	border: 0;
	margin-top: 4px;
	min-height: 2em;

	&:focus {
		border: 1px solid var(--vscode-input-border);
		outline: 0;
	}
`

export const BottomContainer = styled.div`
	margin-top: auto;
	margin-bottom: 0;
`

export const MiddleContainer = styled.div`
	margin-top: 4px;
`
export const FormatContainer = styled.div`
	margin-top: 40px;
	margin-bottom: 4px;
`
