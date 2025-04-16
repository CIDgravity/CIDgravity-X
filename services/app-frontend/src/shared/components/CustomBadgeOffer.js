import React from 'react'

import { UPGRADE_PAGE_LINK } from 'config/constants'
import { GetFreeOrPremiumTenant, GetAclOffersToDisplay, CheckOfferIsPremium, GetOfferClassName } from 'shared/utils/acl-offers'

const CustomBadgeOffer = ({ aclOffers, displayAllOffers = false, isLarge = false, i18nObject }) => {
    const aclOfferToDisplay = GetFreeOrPremiumTenant(aclOffers)

    return (
        <>
            {displayAllOffers ? (
                <>
                    {GetAclOffersToDisplay(aclOffers).map((aclOffer, index) => (
                        <div className="flex-fill d-flex align-items-center">
                            {CheckOfferIsPremium(aclOffer) ? (
                                <div className={GetOfferClassName(aclOffer, isLarge, index)}>
                                    {i18nObject && i18nObject[aclOffer] !== undefined ? i18nObject[aclOffer] : aclOffer}
                                </div>
                            ) : (
                                <a className={GetOfferClassName(aclOffer, isLarge, index)} target="_blank" rel="noreferrer" href={UPGRADE_PAGE_LINK}>
                                    {i18nObject && i18nObject[aclOffer] !== undefined ? i18nObject[aclOffer] : aclOffer}
                                </a>
                            )}
                        </div>
                    ))}
                </>
            ) : (
                <>
                    {aclOfferToDisplay === "free" ? (
                        <a className={GetOfferClassName(aclOfferToDisplay, isLarge)} target="_blank" rel="noreferrer" href={UPGRADE_PAGE_LINK}>
                            {i18nObject && i18nObject[aclOfferToDisplay] !== undefined ? i18nObject[aclOfferToDisplay] : aclOfferToDisplay}
                        </a>
                    ) : (
                        <span className={GetOfferClassName(aclOfferToDisplay, isLarge)}>
                            {i18nObject && i18nObject[aclOfferToDisplay] !== undefined ? i18nObject[aclOfferToDisplay] : aclOfferToDisplay}
                        </span>
                    )}
                </>
            )}
        </>
    )
}

export default CustomBadgeOffer