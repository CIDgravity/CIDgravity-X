// Pure functions that can be easily tested and reused

// returns true if aclEntry (returned from back) is a Peer ID ACL
// returns false if aclEntry (returned from back) is a client ACL
export const isPeerIdAcl = (aclEntry) => {
    return (
        aclEntry.peerId !== '' &&
        aclEntry.peerId !== undefined &&
        aclEntry.peerId !== null
    )
}

// returns true if aclEntry (returned from back) is a client ACL
// returns false if aclEntry (returned from back) is a Peer ID ACL
export const isClientAcl = (aclEntry) => {
    return aclEntry.client?.name !== '' && aclEntry.client?.name !== undefined
}

export const isAlreadyInAclList = (selectedPeerOrClientId, aclList) => {
    if (
        selectedPeerOrClientId === null ||
        selectedPeerOrClientId === undefined ||
        aclList === undefined ||
        aclList.length === 0
    ) {
        return false
    }
    if (aclList.length === 0) {
        return false
    }
    if (selectedPeerOrClientId.isClient) {
        const aclListHasClient = aclList.find(
            (aclElem) => aclElem.client?.id === selectedPeerOrClientId.value
        )
        return aclListHasClient !== undefined && aclListHasClient.length !== 0
    } else {
        const aclListHasPeerId = aclList.find(
            (aclElem) => aclElem.peerId === selectedPeerOrClientId.value
        )
        return aclListHasPeerId !== undefined && aclListHasPeerId.length !== 0
    }
}

export const calculateNewModifiedListOnAdd = (
    modifiedAclList,
    elementToAdd,
    comment,
    clients
) => {
    const newModifiedList = [...modifiedAclList]
    let newAcl
    if (elementToAdd.isClient) {
        newAcl = {
            isWhitelisted: true,
            isBlacklisted: false,
            comment: comment,
            client: clients.find((client) => client.id === elementToAdd.value),
        }
    } else {
        newAcl = {
            isWhitelisted: true,
            isBlacklisted: false,
            comment: comment,
            peerId: elementToAdd.value,
        }
    }
    newModifiedList.push(newAcl)
    return newModifiedList
}

export const calculateRemoved = (aclList, modifiedAclList) => {
    const modifiedAclIds = modifiedAclList.map((aclElem) => aclElem.id)
    const removedList = aclList.filter(
        (aclElem) => !modifiedAclIds.includes(aclElem.id)
    )
    return removedList
}

export const calculateAdded = (aclList, modifiedAclList) => {
    const aclIds = aclList.map((aclElem) => aclElem.id)
    const addedList = modifiedAclList.filter(
        (aclElem) => !aclIds.includes(aclElem.id)
    )
    return addedList
}

export const filterOutAcl = (aclEntry, aclList) => {
    let newModifiedAcl = [...aclList]
    if (isClientAcl(aclEntry)) {
        newModifiedAcl = newModifiedAcl.filter(
            (currAcl) => currAcl.client?.id !== aclEntry.client.id
        )
    } else if (isPeerIdAcl(aclEntry)) {
        newModifiedAcl = newModifiedAcl.filter(
            (currAcl) => currAcl.peerId !== aclEntry.peerId
        )
    }
    return newModifiedAcl
}

// elementToRemove is type of 'selectedPeerOrClientId'
export const removeFromAcl = (elementToRemove, aclList) => {
    if (elementToRemove.isClient) {
        return aclList.filter(
            (aclElem) => aclElem.client?.id !== elementToRemove.value
        )
    } else {
        return aclList.filter(
            (aclElem) => aclElem.peerId !== elementToRemove.value
        )
    }
}

export const currentBehaviorToString = (currentBehaviorBool) => {
    if (currentBehaviorBool) {
        return 'whitelist'
    } else {
        return 'blacklist'
    }
}

export const currentBehaviorToBool = (currentBehaviorStr) => {
    return currentBehaviorStr === 'whitelist'
}

// typeStr == 'whitelist' || typeStr == 'blacklist'
export const getOtherTypeValue = (typeStr) => {
    if (typeStr === 'whitelist') {
        return 'blacklist'
    } else {
        return 'whitelist'
    }
}

// typeStr == 'whitelist' || typeStr == 'blacklist'
export const getOtherTypePassive = (typeStr) => {
    if (typeStr === 'whitelist') {
        return 'blacklisted'
    } else {
        return 'whitelisted'
    }
}

export const calculateSelectedPeerId = (value) => {
    if (value !== null) {
        return {
            value: value,
            label: value,
            isClient: false,
        }
    } else {
        return null
    }
}

export const calculateSelectedClient = (value) => {
    if (value !== null) {
        return {
            value: value.value,
            label: value.label,
            isClient: value.isClient,
        }
    } else {
        return null
    }
}

// When we can update elements, we will have to compare aclList with modifiedAclList directly
// Or add a modifiedElementsList param
export const isAclUnmodified = (
    addedWhitelist,
    removedWhitelist,
    addedBlacklist,
    removedBlacklist,
    modifiedCurrentBehaviorBool,
    currentBehaviorBool
) => {
    return (
        addedWhitelist.length === 0 &&
        removedWhitelist.length === 0 &&
        addedBlacklist.length === 0 &&
        removedBlacklist.length === 0 &&
        modifiedCurrentBehaviorBool === currentBehaviorBool
    )
}

export const getAmountChanges = (
    addedWhitelist,
    removedWhitelist,
    addedBlacklist,
    removedBlacklist,
    modifiedCurrentBehaviorBool,
    currentBehaviorBool
) => {
    const amountAdded = addedWhitelist.length + addedBlacklist.length
    const amountRemoved = removedWhitelist.length + removedBlacklist.length
    const oneIfHasModifiedBehavior =
        currentBehaviorBool !== modifiedCurrentBehaviorBool ? 1 : 0
    const amountChanges = amountAdded + amountRemoved + oneIfHasModifiedBehavior

    return amountChanges
}

export const isChangingToEmptyWhitelist = (
    modifiedWhitelist,
    modifiedCurrentBehaviorBool,
    currentBehaviorBool
) => {
    return (
        modifiedCurrentBehaviorBool !== currentBehaviorBool && // changing...
        modifiedCurrentBehaviorBool === true && // ...to whitelist
        modifiedWhitelist.length === 0 // ... without any item in it!
    )
}

export const filterOutClientsThatAreInList = (clients, aclList) => {
    if (aclList === undefined || aclList.length === 0) {
        return clients
    }
    const aclListClientIds = aclList
        .filter(
            (aclElem) => aclElem.client !== undefined && aclElem.client !== null
        )
        .map((aclElem) => aclElem.client.id)
    return clients.filter((client) => !aclListClientIds.includes(client.id))
}

export const getClientIdsFromAclList = (aclList) => {
    if (aclList === undefined || aclList.length === 0) {
        return []
    }
    return aclList
        .filter(
            (aclElem) => aclElem.client !== undefined && aclElem.client !== null
        )
        .map((aclElem) => aclElem.client.id)
}

export const getPeerIdsFromAclList = (aclList) => {
    if (aclList === undefined || aclList.length === 0) {
        return []
    }
    return aclList
        .filter(
            (aclElem) =>
                aclElem.peerId !== undefined &&
                aclElem.client !== null &&
                aclElem.peerId !== ''
        )
        .map((aclElem) => aclElem.peerId)
}

export const calculateRemovedDTO = (removedWhitelist, removedBlacklist) => {
    const removedWhitelistDTO = calculateRemovedListDTO(removedWhitelist)
    const removedBlacklistDTO = calculateRemovedListDTO(removedBlacklist)
    return removedWhitelistDTO.concat(removedBlacklistDTO)
}

const calculateRemovedListDTO = (removedList) => {
    if (removedList === undefined) {
        return []
    }
    const newRemovedList = removedList.map((aclElem) => {
        if (isClientAcl(aclElem)) {
            return {
                clientId: aclElem.client.id,
            }
        } else {
            return {
                peerId: aclElem.peerId,
            }
        }
    })
    return newRemovedList
}

export const calculateAddedDTO = (addedList) => {
    if (addedList === undefined) {
        return []
    }
    const newAddedList = addedList.map((aclElem) => {
        if (isClientAcl(aclElem)) {
            return {
                clientId: aclElem.client.id,
                comment: aclElem.comment,
            }
        } else {
            return {
                peerId: aclElem.peerId,
                comment: aclElem.comment,
            }
        }
    })
    return newAddedList
}
