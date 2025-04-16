import { BigNumber, FilecoinNumber } from '@glif/filecoin-number'

export function convertToFIL(atto) {
    const filecoinNumber = new FilecoinNumber(atto, 'attofil')
    return filecoinNumber.toFil()
}

export function convertToAtto(fil) {
    const filecoinNumber = new FilecoinNumber(fil, 'fil')
    return filecoinNumber.toAttoFil()
}

export function attoFilIsGreaterThan(priceInAttoFil, valueToCompare) {
    const filecoinNumber = new BigNumber(priceInAttoFil)
    const bigNumberToCompareTo = new BigNumber(valueToCompare)
    const result = filecoinNumber.comparedTo(bigNumberToCompareTo)
    return result === 1
}

export function attoFilIsLowerThan(priceInAttoFil, valueToCompare) {
    const filecoinNumber = new BigNumber(priceInAttoFil)
    const bigNumberToCompareTo = new BigNumber(valueToCompare)
    const result = filecoinNumber.comparedTo(bigNumberToCompareTo)
    return result === -1
}

export function attoFilIsEqualTo(priceInAttoFil, valueToCompare) {
    const filecoinNumber = new BigNumber(priceInAttoFil)
    const bigNumberToCompareTo = new BigNumber(valueToCompare)
    const result = filecoinNumber.comparedTo(bigNumberToCompareTo)
    return result === 0
}

export function computePriceEquivalence(priceInAttoFil, unit, tickerPriceUsd = -1, decimals = 4) {
    const durationInEpochs = 120*24*30

    // throw error if unit == USD and tickerPriceUsd = -1
    if (unit === "USD" && tickerPriceUsd === -1) {
        throw new Error("ticker price must be specified to compute price in USD")
    }

    // if price is 0, return 0, without decimals
    if (priceInAttoFil === 0) {
        return "0"
    }

    if (unit === "FIL") {
        const value_fil = convertToFIL((priceInAttoFil * (durationInEpochs * 1024)))
        return Number(value_fil).toFixed(decimals)
    } else if (unit === "USD") {
        const value_usd = convertToFIL((priceInAttoFil * (durationInEpochs * 1024))) * tickerPriceUsd
        return Number(value_usd).toFixed(decimals)
    }
}

// This function is used in Playground to convert the price for deal proposal
// And in pricing model to display the Filecoin rate from filled price
// This function must be the same as backend function located in CIDgravity/shared/go/tools/filecoin/filecoin.go:44 (ParseFiatRateToAttoFil)
export function convertToFilecoinRate(dollarPerTiB30Days, tickerPriceUsd) {
   // if price is 0, return 0, without decimals
    if (dollarPerTiB30Days === 0) {
        return 0;
    }

    // cnvert $/TiB/30 days to $/GiB/day
    let dollarPerGiBPerDay = dollarPerTiB30Days / (1024 * 30);

    // convert $/GiB/day to $/GiB/Epoch
    let dollarPerGiBPerEpoch = dollarPerGiBPerDay / 2880;

    // convert $/GiB/Epoch to FIL/GiB/Epoch
    let filPerGiBPerEpoch = dollarPerGiBPerEpoch / tickerPriceUsd;

    return convertToAtto(filPerGiBPerEpoch);
}
