import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { Tooltip } from 'react-tooltip'

// enable adding tooltip
// see https://github.com/JedWatson/react-select/discussions/4915#discussioncomment-1646128 for inspiration
// and https://react-select.com/props#components for list of components to override
export const CustomCreatableLabelWithTooltipAndCopy = (props) => {
    const { t } = useTranslation('CustomCreatableLabel') // second param ignored i18n
    const { value, tooltipContent } = props.data

    const copyToClipboard = () => {
        let area = document.createElement('textarea')
        document.body.appendChild(area)
        area.value = value
        area.select()
        document.execCommand('copy')
        document.body.removeChild(area)
        toast.success(t('notification.success.onCopyToClipboard'))
    }

    return (
        <div>
            <span
                className="p-2"
                {...props}
                data-tooltip-id={value}
                data-tooltip-content={tooltipContent}
            />

            <span
                data-tooltip-id="copyTooltip"
                data-tooltip-content={t('tooltip.copy')}
                className="p-2"
                onClick={copyToClipboard}
            >
                <FontAwesomeIcon className="command-copy" icon={faCopy} />
                <Tooltip place="bottom" id="copyTooltip" />
            </span>

            <Tooltip place="right" id={value} />
        </div>
    )
}

export const CustomCreatableLabelWithCopy = (props) => {
    const { t } = useTranslation('CustomCreatableLabel') // second param ignored i18n
    const { value } = props.data

    const copyToClipboard = () => {
        let area = document.createElement('textarea')
        document.body.appendChild(area)
        area.value = value
        area.select()
        document.execCommand('copy')
        document.body.removeChild(area)
        toast.success(t('notification.success.onCopyToClipboard'))
    }

    return (
        <div>
            <span className="p-2" {...props} />

            <span
                data-tooltip-id="copyTooltip"
                data-tooltip-content={t('tooltip.copy')}
                className="p-2"
                onClick={copyToClipboard}
            >
                <FontAwesomeIcon className="command-copy" icon={faCopy} />
                <Tooltip place="bottom" id="copyTooltip" />
            </span>
        </div>
    )
}
