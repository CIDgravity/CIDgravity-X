export function fromBytesToReadableFormat(value) {
    return toReadableFormat(value, 'B')
}

export function toReadableFormat(value, unit) {
    const units = ['B', 'KiB', 'MiB', 'GiB']

    if (units.includes(unit) && unit !== 'GiB') {
        let counter = units.indexOf(unit)
        while (value >= 1024 && value % 1024 === 0) {
            value /= 1024
            counter += 1
        }
        return [value, units[counter]]
    }
    return [value, unit]
}

export function toReadableSize(unit, destUnit, value) {
    const units = ['B', 'KiB', 'MiB', 'GiB']

    if (units.includes(unit) && units.includes(destUnit)) {
        let pow = units.indexOf(unit) - units.indexOf(destUnit)
        return value * Math.pow(1024, pow)
    }

    return value
}

export const formatValueToInt = (value) => {
    const hasDecimal = value - Math.floor(value) !== 0

    if (hasDecimal) {
        return value.toFixed(0)
    } else {
        return value
    }
}

export const toReadableDurationFormatNew = (fromUnit, destUnit, value) => {
    if (value === '') {
        return ''
    }

    if (fromUnit === 'Days' && destUnit === 'Epochs') {
        return parseInt((value * 24 * 120).toFixed(0))
    } else if (fromUnit === 'Epochs' && destUnit === 'Days') {
        return parseInt((value / 24 / 120).toFixed(0))
    } else if (fromUnit === 'Hours' && destUnit === 'Epochs') {
        return parseInt((value * 120).toFixed(0))
    } else if (fromUnit === 'Epochs' && destUnit === 'Hours') {
        return parseInt((value / 120).toFixed(0))
    } else {
        return parseInt(value)
    }
}

export const toReadableDurationFormat = (durationInEpochsOrDays) => {
    const division = durationInEpochsOrDays / 24 / 120
    const containsDecimals = division - Math.floor(division) !== 0

    // If the result in days contains decimals, return in Epochs
    // If not, return the result in days
    if (containsDecimals) {
        return [parseInt(durationInEpochsOrDays), 'Epochs']
    } else {
        return [parseInt(division), 'Days']
    }
}

export const convertToEpochs = (durationValue) => {
    if (durationValue.charAt(durationValue.length - 1) === 'd') {
        return parseInt(durationValue.slice(0, -1)) * 24 * 120
    } else if (durationValue.charAt(durationValue.length - 1) === 'e') {
        return parseInt(durationValue.slice(0, -1))
    }
}

export const convertToBytes = (fileSizeValue) => {
    if (fileSizeValue.charAt(fileSizeValue.length - 1) === 'B') {
        return parseFloat(fileSizeValue.slice(0, -1))
    } else if (fileSizeValue.charAt(fileSizeValue.length - 1) === 'M') {
        return parseFloat(fileSizeValue.slice(0, -1)) * 1e6
    } else if (fileSizeValue.charAt(fileSizeValue.length - 1) === 'G') {
        return parseFloat(fileSizeValue.slice(0, -1)) * 1e9
    }
}

export const convertBytesToGiB = (sizeInBytes) => {
    return sizeInBytes / 1073741824
}
