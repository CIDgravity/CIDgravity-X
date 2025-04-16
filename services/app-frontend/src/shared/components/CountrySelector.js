import Select from "react-select";
import enLocale from 'i18n-iso-countries/langs/en.json'
import frLocale from 'i18n-iso-countries/langs/fr.json'
import zhLocale from 'i18n-iso-countries/langs/zh.json'

import { useTranslation } from 'react-i18next'

export const CountrySelector = ({ fieldName, fieldId, defaultValueCountryCode, onChange }) => {
    const { i18n } = useTranslation()
    const countriesLib = require("i18n-iso-countries");

    // Register locale based on the current selected language
    if (i18n.language === 'fr') {
        countriesLib.registerLocale(frLocale)    
    } else if (i18n.language === 'zh') {
        countriesLib.registerLocale(zhLocale)
    } else {
        countriesLib.registerLocale(enLocale)
    }

    // Get list of countries to a valid array for react-select component
    var countries = Object.entries(countriesLib.getNames("en", { select: "official"} )).map(([key, value]) => { 
        return { label: value, value: key }
    })

    // Get current / default value
    var currentValue = countries.find(country => country.value === defaultValueCountryCode)

    return (
        <Select 
            defaultValue={defaultValueCountryCode ? currentValue : null}
            name={fieldName} 
            options={countries} 
            style={{ marginLeft: 20 + 'px' }}
            id={fieldId}
            onChange={(e) => onChange(e)}
        />
    )
}

export const GetCountryNameFromCode = (i18n, code) => {
    const countriesLib = require("i18n-iso-countries");

    if (i18n.language === 'fr') {
        countriesLib.registerLocale(frLocale)
    } else if (i18n.language === 'zh') {
        countriesLib.registerLocale(zhLocale) 
    } else {
        countriesLib.registerLocale(enLocale)
    }

    return countriesLib.getName(code, i18n.language, {select: "official"}); 
}