import { Button } from '../Controls'
import styled from 'styled-components'

export const TerminalContainerStyled = styled.div`
	display: flex;
	flex-grow: 1;
	min-height: 0;
`

export const TerminalInnerContainer = styled.div`
	display: flex;
	flex-direction: column;
	flex-grow: 1;
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

export const RunButton = styled(Button)`
	margin-top: auto;
	margin-bottom: 0;
`
