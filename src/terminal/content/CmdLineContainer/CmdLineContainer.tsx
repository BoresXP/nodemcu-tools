import { CmdLineInput, CmdlineContainerStyled } from './CmdLineContainer.styles'

import { Button } from '../Controls'
import React from 'react'

const CmdLineContainer: React.FC = () => (
	<CmdlineContainerStyled>
		<CmdLineInput />
		<Button>Run</Button>
	</CmdlineContainerStyled>
)

export default CmdLineContainer
