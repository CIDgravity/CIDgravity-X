import { trimString } from '../../shared/utils/string'

export const stringArrayToSelectObjectList = (pricingModelArray) =>
    pricingModelArray.map((pricingModel) => ({
        value: pricingModel.name,
        label: pricingModel.name,
    }))

export const clientArrayToSelectObjectWithAddresses = (clients) => {
    const options = []

    for (const client of clients) {
        if (!client.archived) {
            for (const addresse of client.addresses) {
                options.push({
                    label: client.name + ' - ' + trimString(addresse),
                    value: addresse,
                })
            }
        }
    }

    return options
}

export const clientArrayToSelectObjectWithPeerIds = (
    clients,
    unwantedClientIds,
    unwantedPeerIds
) => {
    const options = []

    for (const client of clients) {
        if (!client.archived && client.peerIds != null) {
            if (
                unwantedClientIds === undefined ||
                !unwantedClientIds.includes(client.id)
            ) {
                options.push({
                    label: `${client.name} - All Peer IDs`,
                    value: client.id,
                    isClient: true,
                })
            }
            for (const peerId of client.peerIds) {
                if (
                    unwantedPeerIds === undefined ||
                    !unwantedPeerIds.includes(peerId)
                ) {
                    options.push({
                        label: `${client.name} - ${trimString(peerId)}`,
                        value: peerId,
                        isClient: false,
                    })
                }
            }
        }
    }

    return options
}
