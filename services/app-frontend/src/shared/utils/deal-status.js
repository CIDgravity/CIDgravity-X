import ReactTooltip from 'react-tooltip'
import { useTranslation } from 'react-i18next'

import { dashToCamelCase } from './string'

const generateDealStatusFilterDropdownOptions = (t, successValues, errorValues) => [
    {
        label: t('dealStatusAndFilters.allSuccess.sectionTitle'),
        options: generateDealStatusDropdownOption(t, successValues)
    },
    {
        label: t('dealStatusAndFilters.allErrors.sectionTitle'),
        options: generateDealStatusDropdownOption(t, errorValues)
    }
];

const generateDealStatusDropdownOption = (t, values) => {
    return values.map(value => ({
        value,
        label: t(`dealStatusAndFilters.${dashToCamelCase(value)}.dropdownName`)
    }));
};

// return dropdown options for deal status filter
export const GetDecisionsAndStatusesDropdownOptions = (isForClient = false) => {
    const { t } = useTranslation('dealStatus'); // second param ignored i18n

    const successValues = ["allSuccess", "accept", "published", "active", "expired"];
    var errorValues = [
        "allErrors", "reject", "blacklist", "clientBlocked", "error",
        "invalidProposal", "curioBackPressure", "maintenance", "noFundsLeft", "noSpaceLeft",
        "rateLimit", "sizeRateLimit", "startEpochBelowSealingBuffer",
        "storageAcceptanceLogic",  "unsupportedTransferProtocol", "never-published", 
        "published-expired", "slashed", 
    ];

    if (isForClient) {
        errorValues = [
            "allErrors", "reject", "busy", "clientNotAuthorized", "clientNotEnoughtDatacap",
            "dealTypeNotAccepted", "priceTooLow", "serviceUnavailable", "startEpochTooEarly", 
            "never-published", "published-expired", "slashed"
        ];
    }

    return generateDealStatusFilterDropdownOptions(t, successValues, errorValues);
};

const generateIconWithTextAndTooltipForDealStatus = (iconName, iconColor, tooltip, text = null) => {
    return (
        <span data-for="dealStatusTooltip" data-tip={tooltip}>
            <i style={{ color: iconColor, marginRight: 5 + 'px' }} className={iconName} /> 

            {text !== null && (
                <span style={{ color: iconColor }}>
                    {text}
                </span>
            )}

            <ReactTooltip place="bottom" id="dealStatusTooltip" />
        </span>
    )
}

export const GenerateTableColumnForDealStatus = (t, deal, displayText = false) => {
    var color = "red"
    var icon = "fas fa-circle-xmark"

    // we use dashToCamelCase to convert status like never-published to neverPublished
    // this help to remove dash for translations key and keep consistency
    const dealStatusTooltip = t(`dealStatusAndFilters.${dashToCamelCase(deal.lastDealStatus)}.tooltip`, { ns: 'dealStatus' })
    const dealStatusText = t(`dealStatusAndFilters.${dashToCamelCase(deal.lastDealStatus)}.name`, { ns: 'dealStatus' })

    switch (deal.lastDealStatus) {
        case 'expired':
            color = "grey"
            icon = "fas fa-circle-check"
            break

        case 'active':
            color = "green"
            icon = "fas fa-circle-check"
            break

        case 'accept':
        case 'accepted':
        case 'published':
            color = "green"
            icon = "fas fa-arrow-right"
            break

        default:
            color = "red"
            icon = "fas fa-circle-xmark"
            break
    }

    return generateIconWithTextAndTooltipForDealStatus(icon, color, dealStatusTooltip, displayText ? dealStatusText : null)
}