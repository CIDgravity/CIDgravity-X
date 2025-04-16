import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import ReactTooltip from 'react-tooltip'

export const CustomCodeHighlight = ({ text, wrapperClass }) => {
    const { t } = useTranslation('CustomCodeHighlight') // second param ignored i18n

    const copyToClipboard = () => {
        let area = document.createElement('textarea')
        document.body.appendChild(area)
        area.value = text
        area.select()
        document.execCommand('copy')
        document.body.removeChild(area)
        toast.success(t('notification.success.onCopyToClipboard'))
    }

    return (
        <div className={wrapperClass ? wrapperClass : 'code-block-wrapper'} data-for="copyTooltip" data-tip={t('copy.tooltip')} onClick={copyToClipboard}>
            <pre className="custom-pre">
                <code>
                    <span className="token code-line command">
                        {text}
                    </span>
                </code>
            </pre>

            <ReactTooltip place="bottom" id="copyTooltip" />
        </div>
    )
}
