import * as l10n from '@vscode/l10n'

import { HoverTooltipGLobalClass, StatusBarItemStyled } from './StatusBarItem.styles'
import React, { useMemo } from 'react'

interface IStatusBarModulesItemProps {
	modules: string
	chipArch: string
}

let docLinkRoot: string

const StatusBarModulesItem: React.FC<IStatusBarModulesItemProps> = ({ modules, chipArch }) => {
	docLinkRoot =
		chipArch === 'esp32'
			? 'https://nodemcu.readthedocs.io/en/dev-esp32/modules'
			: 'https://nodemcu.readthedocs.io/en/dev/modules'
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
			<StatusBarItemStyled data-tooltip-id="modules-tooltip" data-tooltip-html={modulesWithLinks}>
				{l10n.t('modules')}
			</StatusBarItemStyled>
		</>
	)
}

export default StatusBarModulesItem
