import { GetSpecificAddress } from 'shared/services/addresses_claim'
import { GetSpecificClientAddress } from 'shared/services/cidg-services/client-backend/address'
import { jwtDecode } from "jwt-decode";

const appMetadataKey = "https://cidgravity.com/appMetadata"
const aclKey = "acl"

export const loadAddressesFromJwt = async (jwtToken, loadClient = true, loadProvider = true) => {
    const decoded = jwtDecode(jwtToken);

    // Arrays to store all retrieved addresses
    const providerAddresses = []
    const clientAddresses = []

    if (decoded[appMetadataKey]) {
        if (decoded[appMetadataKey][aclKey]) {
            const acl = decoded[appMetadataKey][aclKey]

            for (var i in acl) {
                if (acl[i].actorType === "storageminer" && loadProvider) {
                    try {
                        const providerAddress = await GetSpecificAddress(acl[i].address)
                        
                        // Check if API result return the same addressId to avoid the case where the address isn't claimed
                        if (providerAddress.data) {
                            if (providerAddress.data.addressId === acl[i].address) {
                                providerAddresses.push(providerAddress.data)
                            }
                        }
                    } catch (error) {
                        console.log('Error while fetching provider address ' + acl[i].address + ' with message ' + error)
                    }

                } else if (acl[i].actorType === "account" && loadClient) {
                    try {
                        const clientAddress = await GetSpecificClientAddress(acl[i].address)
                        
                        // Check if API result return the same addressId to avoid the case where the address isn't claimed
                        if (clientAddress.data) {
                            if (clientAddress.data?.result?.addressId === acl[i].address) {
                                clientAddresses.push(clientAddress.data?.result)
                            }
                        }
                    } catch (error) {
                        console.log('Error while fetching client address ' + acl[i].address + ' with message ' + error)
                    }
                }
            }
        }
    }

    // Will return two arrays using destructuration
    // Depending on value of loadClient and loadProvider, arrays can empty (and ignore when this function is called)
    return [clientAddresses, providerAddresses]
}

export const loadFirstAvailableAddressFromJwt = jwtToken => {
    const decoded = jwtDecode(jwtToken);

    if (decoded[appMetadataKey]) {
        if (decoded[appMetadataKey][aclKey]) {
            const acl = decoded[appMetadataKey][aclKey]

            if (acl.length > 0) {
                return [acl[0].actorType, acl[0].address]
            }

            return null
        }
    }
}

export const getSpecificAddressActorTypeFromJwt = (addressToSearch, jwtToken) => {
    const decoded = jwtDecode(jwtToken);

    if (decoded[appMetadataKey]) {
        if (decoded[appMetadataKey][aclKey]) {
            const acl = decoded[appMetadataKey][aclKey]

            for (var i in acl) {
                if (acl[i].address === addressToSearch) {
                    return acl[i].actorType
                }
            }

            return null
        }
    }
}

export const formatAddressesAsSelectFormat = (addresses, addressesToRemove = []) => {
    const output = [];

    for (var i in addresses) {
        if (!addressesToRemove.includes(addresses[i].addressId)) {
            if (addresses[i].friendlyName !== undefined && addresses[i].friendlyName !== null && addresses[i].friendlyName !== '') {
                output.push({ 'value': addresses[i].addressId, 'label': `${addresses[i].friendlyName} (${addresses[i].addressId})` });
            } else {
                output.push({ 'value': addresses[i].addressId, 'label': `${addresses[i].addressId}` });
            }
        }
    }

    return output
}

export const hasRightOnSpecificAddressFromJwt = (jwtToken, addressToCheck) => {
    const decoded = jwtDecode(jwtToken);

    if (decoded[appMetadataKey]) {
        if (decoded[appMetadataKey][aclKey]) {
            const acl = decoded[appMetadataKey][aclKey]

            for (var i in acl) {
                if (acl[i].address === addressToCheck) {
                    return true
                }
            }
        }
    }

    return false
}