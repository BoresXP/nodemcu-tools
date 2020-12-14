import { HoverTooltipGLobalClass, StatusBarItemStyled } from './StatusBarItem.styles'
import React, { useMemo } from 'react'

export interface IStatusBarModulesItemProps {
	modules: string
}

const docLinkRoot = 'https://nodemcu.readthedocs.io/en/release/modules'

const StatusBarModulesItem: React.FC<IStatusBarModulesItemProps> = ({ modules }) => {
	const modulesWithLinks = useMemo(
		() =>
			modules
				.split(',')
				.map(mod => `<a href="${docLinkRoot}/${mod}/" target="_blank">${mod}</a>`)
				.join(', '),
		[modules],
	)

	return (
		<>
			<HoverTooltipGLobalClass />
			<StatusBarItemStyled
				data-for="main-tooltip"
				data-tip={modulesWithLinks}
				data-html={true}
				data-class="nodemcu-tools-hover-tooltip"
			>
				modules
			</StatusBarItemStyled>
		</>
	)
}

export default StatusBarModulesItem
