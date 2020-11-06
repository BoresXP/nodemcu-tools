import { TerminalContainerStyled, TerminalControls } from './TerminalContainer.styles'

import { Button } from '../Controls'
import React from 'react'
import Terminal from '../Terminal/Terminal'

const TerminalContainer: React.FC = () => (
	<TerminalContainerStyled>
		<Terminal />
		<TerminalControls>
			<Button>Clear</Button>
			<Button>Scroll</Button>
		</TerminalControls>
	</TerminalContainerStyled>
)

export default TerminalContainer
