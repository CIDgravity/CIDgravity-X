import React from "react";
import { Alert } from "reactstrap";

import { convertBytesToGiB } from '../../shared/utils/file_size'
import { computePriceEquivalence, convertToFilecoinRate } from 'shared/utils/fil'
import { GetDealProposalLabelEncoded } from 'shared/services/cidg-services/reputation-discovery'

import i18next from "../../i18n";

export const SupportedCurrencies = {
    attofil_gib_epoch: {
        unit: "FIL",
        priceField: "price_for_30days_fil",
        maxDecimals: 0, // max decimals allowed for a rule price in that currency
        computeUnit: "FIL", // compute using FIL logic
        extraFields: [
            { 
                field: "price_for_30days_usd", 
                computeUnit: "USD" 
            }
        ]
    },
    usd_tib_month: {
        default: true,
        unit: "USD",
        maxDecimals: 3, // max decimals allowed for a rule price in that currency
        computeUnit: null, // direct price, no conversion needed
        extraFields: [
            { 
                field: "price_fil_per_gib_per_epoch", 
                computeFn: (price, tickerPrice) => convertToFilecoinRate(price, tickerPrice) 
            }
        ]
    },
    usdfc_tib_month: {
        unit: "USDFC",
        priceField: "price_for_30days_usdfc",
        maxDecimals: 3, // max decimals allowed for a rule price in that currency
        computeUnit: null // direct price, no conversion needed
    }
};

/**
 * Returns the translated label for a given currency key.
 *
 * Uses i18next to fetch the translation from the "label" property of the currency in the translation file.
 *
 * @param {string} currencyKey - The key of the currency (e.g., "attofil_gib_epoch", "usd_tib_month").
 * @returns {string} - The translated label for the currency.
 *
 * @example
 * getCurrencyLabelTranslation("attofil_gib_epoch"); // "attoFIL/GiB/Epoch"
 */
export const getCurrencyLabelTranslation = (currencyKey) => {
    return i18next.t(`${currencyKey}.label`);
};

/**
 * Returns the translated unit for a given currency key.
 *
 * Uses i18next to fetch the translation from the "currency" property of the currency in the translation file.
 *
 * @param {string} currencyKey - The key of the currency (e.g., "attofil_gib_epoch", "usd_tib_month").
 * @returns {string} - The translated currency unit.
 *
 * @example
 * getCurrencyTranslation("usd_tib_month"); // "USD"
 */
export const getCurrencyTranslation = (currencyKey) => {
    return i18next.t(`${currencyKey}.currency`);
};

/**
 * Returns the key of the default currency defined in SupportedCurrencies.
 *
 * Finds the first currency in the SupportedCurrencies configuration that has `default: true`.
 *
 * @returns {string|undefined} - The key of the default currency, or undefined if none is marked as default.
 *
 * @example
 * getDefaultCurrency(); // "attofil_gib_epoch"
 */
export const getDefaultCurrency = () =>
    Object.entries(SupportedCurrencies).find(([k, v]) => v.default)?.[0];

/**
 * Returns an array of { value, label } for all supported currencies
 */
export const getCurrencyOptions = () => {
    return Object.entries(SupportedCurrencies).map(([key, cfg]) => ({
        value: key,
        label: getCurrencyLabelTranslation(key),
    }));
};

/**
 * Compute only the dependent prices for a single input value, dynamically based on SupportedCurrencies
 */
export const computePriceForInput = (value, currencyKey, ticker) => {
    const result = {};

    const cfg = SupportedCurrencies[currencyKey];
    if (!cfg) return result;

    // Compute main price field
    if (cfg.computeUnit) {
        result[cfg.priceField] = computePriceEquivalence(value, cfg.computeUnit);
    } else {
        result[cfg.priceField] = value;
    }

    // Compute extra fields if defined
    if (cfg.extraFields?.length) {
        cfg.extraFields.forEach((fieldCfg) => {
            if (fieldCfg.computeUnit) {
                result[fieldCfg.field] = computePriceEquivalence(value, fieldCfg.computeUnit, ticker?.weightedPrice);
            } else if (fieldCfg.computeFn) {
                result[fieldCfg.field] = fieldCfg.computeFn(value, ticker?.weightedPrice);
            }
        });
    }

    return result;
};

/**
 * Computes the price for a given rule based on the specified currency and optionally formats it as a string.
 *
 * This function uses the configuration defined in `SupportedCurrencies` to determine:
 *   - The main price field to update on the rule object (`priceField`)
 *   - Whether a conversion is needed based on `computeUnit`
 *
 * Optionally, a custom conversion function can be applied to the computed price.
 */
export const formatRulePrice = (rule, currency, options = {}) => {
    const { format = false, convertFn = null } = options;

    const cfg = SupportedCurrencies[currency];
    if (!cfg) return format ? "" : rule;

    const field = cfg.priceField;

    // Compute main price
    let computedPrice = cfg.computeUnit
        ? computePriceEquivalence(rule.price, cfg.computeUnit)
        : rule.price;

    // Apply optional conversion function (e.g., convertToFIL)
    if (convertFn && typeof convertFn === "function") {
        computedPrice = convertFn(computedPrice, rule);
    }

    if (format) {
        const unitLabel = getCurrencyLabelTranslation(currency);
        return `${computedPrice} ${unitLabel}`;
    }

    // Default behavior: enrich the rule object
    rule[field] = computedPrice;
    return rule;
};

/**
 * Compute a rule price for a given currency.
 *
 * Options:
 * - format: boolean → return formatted string with unit instead of mutating rule
 * - t: translation function
 * - convertFn: optional custom conversion function (e.g., convertToFilecoinRate)
 */
export const computeRulePrice = (rule, currency, options = {}) => {
    const { format = false, convertFn = null } = options;

    const cfg = SupportedCurrencies[currency];
    if (!cfg) return format ? "" : rule;

    const field = cfg.priceField;

    // Compute base price
    let computedPrice = cfg.computeUnit
        ? computePriceEquivalence(rule.price, cfg.computeUnit)
        : rule.price;

    // Apply optional custom conversion
    if (convertFn && typeof convertFn === "function") {
        computedPrice = convertFn(computedPrice, rule);
    }

    // Return formatted string if requested
    // Otherwise, store field on rule
    if (format) {
        const unitLabel = getCurrencyTranslation(currency);
        return `${computedPrice} ${unitLabel}`;
    }   

    rule[field] = computedPrice;
    return rule;
};

/**
 * Compute the numeric price and label for a deal, depending on currency.
 * - attofil_gib_epoch: price as-is, label = "cidgravity_playground"
 * - usd_tib_month: converted to FIL using tickerPriceUsd and deal size, label = "cidgravity_playground"
 * - usdfc_tib_month: price = 0, label = fetched via backend
 * 
 * @param {number} dealPrice - Base deal price from input
 * @param {string} currency - Currency key, e.g., 'attofil_gib_epoch', 'usd_tib_month', 'usdfc_tib_month'
 * @param {number} dealSizeBytes - Deal size in bytes
 * @param {number} tickerPriceUsd - Price of FIL in USD (needed for USD conversion)
 * @param {string} pieceCID - Piece CID for encrypted label output
 * @returns {{ price: number, label: string }}
 */
export const computeRulePriceAndLabelForProposal = async (dealPrice, currency, dealSizeBytes, tickerPriceUsd, pieceCID) => {
  let priceAsAttoFil = 0;
  let label = "cidgravity_playground";

  if (currency === "attofil_gib_epoch") {
    priceAsAttoFil = Math.ceil(dealPrice * convertBytesToGiB(dealSizeBytes));

  } else if (currency === "usd_tib_month") {
    const convertDealPrice = computeRulePrice(
        { price: dealPrice }, 
        currency, 
        { convertFn: (price) => convertToFilecoinRate(price, tickerPriceUsd)}
    )

    priceAsAttoFil = Math.ceil(convertDealPrice * convertBytesToGiB(dealSizeBytes))

  } else if (currency === "usdfc_tib_month") {
    priceAsAttoFil = 0;

    try {
        const response = await GetDealProposalLabelEncoded(dealPrice, "usdfc", pieceCID);
        label = response?.data?.result?.encodedLabel ?? "cidgravity_playground";
    } catch (err) {
        console.error("Error fetching USDFC label:", err);
    }
  }

  return { priceAsAttoFil, label };
};

/**
 * Validates a rule's price based on SupportedCurrencies config.
 * Throws an Error if the price is invalid.
 *
 * @param {string|number} price - The price to validate
 * @param {string} currency - Currency key (must exist in SupportedCurrencies)
 * @param {number} index - Rule index (for error messages)
 */
export const validateRulePrice = (price, currency, index) => {
    const cfg = SupportedCurrencies[currency];

    if (!cfg) {
        throw new Error(`Currency "${currency}" not supported for rule ${index}`);
    }

    const priceStr = String(price);

    if (priceStr.includes(".") || priceStr.includes(",")) {
        const [, decimalPart] = priceStr.replace(",", ".").split(".");
        const decimals = decimalPart ? decimalPart.length : 0;

        if (decimals > cfg.maxDecimals) {
            throw new Error(
                `Rule ${index}: Price has too many decimals (found: ${decimals}, max: ${cfg.maxDecimals})`
            );
        }
    }
};

/**
 * Computes all price fields for a rule based on SupportedCurrencies
 *
 * @param {object} rule - The rule object
 * @param {string} currency - Currency key
 * @param {number} [tickerPrice] - optional ticker price for conversions
 * @returns {object} rule with computed fields
 */
export const computeAllRulePrices = (rule, currency, tickerPrice = null) => {
    const cfg = SupportedCurrencies[currency];
    if (!cfg) return { ...rule };

    const updatedRule = { ...rule };

    updatedRule[cfg.priceField] = cfg.computeUnit
        ? computePriceEquivalence(rule.price, cfg.computeUnit, tickerPrice)
        : rule.price;

    if (cfg.extraFields) {
        cfg.extraFields.forEach((ef) => {
            if (ef.computeFn) {
                updatedRule[ef.field] = ef.computeFn(rule.price, tickerPrice);
            } else if (ef.computeUnit) {
                updatedRule[ef.field] = computePriceEquivalence(rule.price, ef.computeUnit, tickerPrice);
            } else {
                updatedRule[ef.field] = -1;
            }
        });
    }

    return updatedRule;
};

/**
 * Show the price conversion alert based on currency and computed fields
 *
 * Props:
 *  - priceData: object containing price and computed fields
 *  - currency: currency key (attofil_gib_epoch, usd_tib_month, etc.)
 *  - mainPriceField: (optional) field in priceData for main price
 */
export const PriceConversionAlert = ({ priceData, currency, mainPriceField = "price", className = "" }) => {
    const mainPrice = priceData?.[mainPriceField];

    if (mainPrice == null || mainPrice <= 0) return null;

    let content = null;

    switch (currency) {
        case "attofil_gib_epoch":
            content = (
                <>
                    ≈ {priceData.price_for_30days_fil}{" "}
                    {getCurrencyLabelTranslation("fil_tib_month")} (${priceData.price_for_30days_usd})
                </>
            );
            break;

        case "usd_tib_month":
            content = (
                <>
                    ≈ {priceData.price_fil_per_gib_per_epoch}{" "}
                    {getCurrencyLabelTranslation("attofil_gib_epoch")}
                </>
            );
            break;

        default:
            return null;
    }

    return (
        <Alert color="info" className={`mt-2 d-flex align-items-center ${className}`}>
            {content}
        </Alert>
    );
};