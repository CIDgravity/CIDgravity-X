import { toReadableSize, toReadableDurationFormatNew } from '../../shared/utils/file_size'
import { attoFilIsGreaterThan, attoFilIsLowerThan } from '../../shared/utils/fil'

// Function which check all the rules in a model are correctly filled
// To return a valid result, all inputs must be filled
export const checkIfRulesAreFilled = (rulesList) => {
    let error = 0

    rulesList.forEach(function (rule) {
        if (
            rule.price === '' ||
            rule.minSize === '' ||
            rule.maxSize === '' ||
            rule.minDuration === '' ||
            rule.maxDuration === ''
        ) {
            error++
        }
    })

    return error <= 0
}

// Function which check all the rules in a model are filled with valid values
// It's used to handle file size (min / max) with a string as unity and for duration (epochs / days)
export const checkIfRulesAreValid = (pricingModelCurrency, rulesList) => {
    rulesList.forEach((rule, index) => {

        // max 3 decimals for the price (used to handle comma in case the pricing currency is USD)
        // commas as forbidden is pricing model currency isn't USD
        if (pricingModelCurrency === 'usd_tib_month') {
            if (rule.price.includes(".") || rule.price.includes(",")) {
                const [, decimalPart] = rule.price.replace(",", ".").split(".");
                if (decimalPart.length > 3) {
                    throw new Error(`Rule ${index}: Price has too many decimal (found: ${decimalPart.length}, max: 3)`)
                }
            }
        } else {
            if (rule.price.includes(".") || rule.price.includes(",")) {
                throw new Error(`Rule ${index}: Price with decimal is not allowed`)
            }
        }

        if (attoFilIsLowerThan(rule.price, '0')) {
            throw new Error('Rule ' + index + ': Price must be > 0 FIL')
        }

        // value is 2 billions FIL in attoFil (2 x 10^27)
        if (attoFilIsGreaterThan(rule.price, '2000000000000000000000000000')) {
            throw new Error(
                'Rule ' + index + ': Max price allowed is 2 billion FIL'
            )
        }

        if (!Number.isInteger(rule.minSize)) {
            throw new Error(
                'Rule ' + index + ': Min size must be an integer value'
            )
        }

        if (!Number.isInteger(rule.maxSize)) {
            throw new Error(
                'Rule ' + index + ': Max size must be an integer value'
            )
        }

        if (rule.minSize < 256) {
            throw new Error('Rule ' + index + ': Min size allowed is 256 B')
        }

        if (rule.maxSize < rule.minSize) {
            throw new Error(
                'Rule ' + index + ": Max size can't be under min size!"
            )
        }

        if (rule.maxDuration < rule.minDuration) {
            throw new Error(
                'Rule ' + index + ": Max duration can't be under min duration!"
            )
        }

        if (rule.minDuration < 518400) {
            throw new Error('Rule ' + index + ': Min duration allowed is 180d')
        }

        if (rule.maxDuration > 3680640) {
            throw new Error('Rule ' + index + ': Max duration allowed is 1278d')
        }
    })
}

// Function which convert all values of each rules in a model to valid format for SQL
// i.e : size will be in bytes / duration in epoch
export const convertRulesValuesToCorrectFormat = (ruleList) => {
    const convertedRules = []

    ruleList.forEach(function callback(rule, index) {
        const convertedRule = {
            uniqueId: rule.uniqueId,
            verified: rule.verified.toString(),
            price: rule.price.toString(),
            transferType: rule.transferType,
            minSize: toReadableSize(rule.minSizeUnit, 'B', rule.minSize),
            maxSize: toReadableSize(rule.maxSizeUnit, 'B', rule.maxSize),
            minDuration: toReadableDurationFormatNew(
                rule.minDurationUnit,
                'Epochs',
                rule.minDuration
            ),
            maxDuration: toReadableDurationFormatNew(
                rule.maxDurationUnit,
                'Epochs',
                rule.maxDuration
            ),
            position: index,
        }

        convertedRules.push(convertedRule)
    })

    return convertedRules
}
