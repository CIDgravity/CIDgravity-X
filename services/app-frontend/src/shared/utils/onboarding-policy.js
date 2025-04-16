
import { CheckProviderShortAddressOnChainValidity } from 'shared/services/filecoin'
import { isShortAddressFromFilecoinAddressString } from 'shared/utils/filecoinUtil'
import { CheckProviderNotAlreadyUsedInPolicyGroup } from 'shared/services/cidg-services/client-backend/onboarding_policy_groups'
import { CheckIfAddressIsBlacklisted } from 'shared/services/cidg-services/client-backend/blacklist'

// Function which check if all providers input are correctly filled
export const checkIfAllProvidersAreFilled = (providerList) => {
    let error = 0

    providerList.forEach(function (provider) {
        if (provider.addressId === '') {
            error++
        }
    })

    return error <= 0
}

// Function which check all the providers (address validity)
export const checkIfAllProvidersAreValid = async (providerList, policyGroupId) => {
    const err = await Promise.all(providerList.map(async (provider, index) => {

        // to avoid displaying long value, display index to help identify which provider
        if (provider.addressId.length >  30) {
            return "Provider " + (index + 1) + " address length is greater than 30"
        }

        // to avoid displaying long value, display index to help identify which provider
        if (provider.comment.length >  255) {
            return "Provider " + (index + 1) + " comment length is greater than 255"
        }
        
        if (!isShortAddressFromFilecoinAddressString(provider.addressId)) {
            return provider.addressId + ' is not a valid short address'
        }

        // Because this provider is in the list, we need to check that length not > 1 (it means duplicates)
        if (providerList.find((p) => p.addressId === provider.addressId).length > 1) {
            return provider.addressId + ' can be added single time to a group'
        }

        // Check provider addressId exist on chain
        const result = await CheckProviderShortAddressOnChainValidity(provider.addressId)

        if (result.data) {
            if (!result.data.isValid) {
                return provider.addressId + ' is not valid on chain'
            }
        } else {
            return provider.addressId + ' can\'t be checked on chain at this time. Retry in few seconds'
        }

        // Check provider not blacklisted
        const alreadyInBlacklist = await CheckIfAddressIsBlacklisted({ AddressId: provider.addressId })

        if (alreadyInBlacklist.data.result.isBlacklisted) {
            return provider.addressId + ' is currently blacklisted. Remove it from blacklist before adding it to a policy group'
        }

        // Check provider not already in another group
        const alreadyInAnotherGroup = await CheckProviderNotAlreadyUsedInPolicyGroup({ addressId: provider.addressId, groupId: policyGroupId })
        
        if (alreadyInAnotherGroup.data) {
            if (alreadyInAnotherGroup.data.result.isAlreadyInGroup) {
                return provider.addressId + ' is already in another policy group'
            }
        } else {
            return provider.addressId + ' can\'t be checked at this time. Retry in few seconds'
        }
    }));

    return err
}
