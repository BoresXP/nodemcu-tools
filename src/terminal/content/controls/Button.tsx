import styled from 'styled-components'

const Button = styled.button`
	color: var(--vscode-button-foreground);
	background-color: var(--vscode-button-background);
	border: 0;
	margin: 4px;
	padding: 4px 10px;
	min-height: 2.5em;

	&:hover {
		background-color: var(--vscode-button-hoverBackground);
	}

	&:focus {
		outline: 1px solid var(--vscode-button-background);
		outline-offset: 2px;
	}

	&:disabled {
		color: var(--vscode-button-secondaryForeground);
		background-color: var(--vscode-button-secondaryBackground);
	}
`

export default Button
