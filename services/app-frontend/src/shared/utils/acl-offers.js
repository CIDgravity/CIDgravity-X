
// This function will return an array of acl offers to display
// If client is free and enterprise, not necessary to display free
// But if client is enterprise and opt1, must display both options
export const GetAclOffersToDisplay = (aclOffers) => {
    const hasProviderOffer = aclOffers.some(offer => offer.startsWith('offer-sp'));
    const hasClientOffer = aclOffers.some(offer => offer.startsWith('offer-client'));

    if (hasProviderOffer) {
        if (aclOffers.includes('offer-sp-premium') && aclOffers.includes('offer-sp-free')) {
            aclOffers = aclOffers.filter(offer => offer !== 'offer-sp-free');
        }
    }

    if (hasClientOffer) {
        if (aclOffers.includes('offer-client-premium') && aclOffers.includes('offer-client-free')) {
            aclOffers = aclOffers.filter(offer => offer !== 'offer-client-free');
        }
    }

    return aclOffers
}

// This function will return single offer, only to display Free or Premium in TopNavBar
// Here the options will not be displayed
export const GetFreeOrPremiumTenant = aclOffers => {
    if (aclOffers === null || aclOffers === undefined) {
        return "free"
    }

    if (aclOffers.includes('offer-sp-premium') || aclOffers.includes('offer-client-premium')) {
        return "premium"
    } else {
        return "free"
    }
}

// This function will true if aclOffer in param is a premium offer, false in other caes
export const CheckOfferIsPremium = aclOffer => {
    if (aclOffer === null || aclOffer === undefined) {
        return false
    }

    if (aclOffer === 'offer-sp-premium' || aclOffer === 'offer-client-premium') {
        return true
    } 

    // options are considered premium
    if (aclOffer.startsWith("option")) {
        return true
    }

    return false
}

// This function will return className to apply for specific offer
export const GetOfferClassName = (aclOffer, isLarge = false, index = 0) => {
    let className = isLarge ? "badge-large" : "badge"

    if (aclOffer === null || aclOffer === undefined) {
        className = className + " free"
    }

    if (aclOffer.startsWith("option")) {
        className = className + " option"
    }

    if (aclOffer.endsWith("premium")) {
        className = className + " premium"
    }

    if (aclOffer.endsWith("free")) {
        className = className + " free"
    }

    return className + (index > 0 ? " mt-2" : "") + " p-2"
}