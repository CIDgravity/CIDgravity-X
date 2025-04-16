const { newFromString, Protocol } = require('@glif/filecoin-address')
const moment = require('moment')

export const getFilecoinAddressIfValidAndSupported = (addressAsString) => {
    try {
        const filecoinAddress = newFromString(addressAsString) // checksum already validated here if necessary (f1 and f3)
        if (
            filecoinAddress.protocol() === Protocol.ID || // f0
            filecoinAddress.protocol() === Protocol.SECP256K1 || // f1
            filecoinAddress.protocol() === Protocol.BLS || // f3
            filecoinAddress.protocol() === Protocol.DELEGATED // f4 and f410
        ) {
            return filecoinAddress
        } else {
            return null // unsupported
        }
    } catch (error) {
        return undefined // invalid
    }
}

// filecoinAddress type === @glif/filecoin-address Address
export const isShortAddress = (filecoinAddress) => {
    return filecoinAddress.protocol() === Protocol.ID
}

export const isLongAddress = (filecoinAddress) => {
    return !isShortAddress(filecoinAddress)
}

export const isShortAddressFromFilecoinAddressString = (addressAsString) => {
    try {
        const filecoinAddress = newFromString(addressAsString)
        return filecoinAddress.protocol() === Protocol.ID
    } catch (error) {
        return false
    }
}

export const getCurrentFilecoinEpoch = () => {
    return Math.floor((moment().unix() - 1598306400) / 30)
}

export const shortenAddress = (address) => {
    if (address !== null && address !== '' && address !== undefined) {
        if (address.length > 15) {
            return (
                address.substring(0, 5) +
                ' [...] ' +
                address.substring(address.length - 5, address.length)
            )
        } else {
            return address
        }
    } else {
        return address
    }
}
