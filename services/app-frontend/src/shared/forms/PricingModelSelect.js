import React from 'react'
import AsyncSelect from 'react-select/async'

const customFilterOption = (option, rawInput) => {
    const words = rawInput.split()
    return words.reduce(
        (acc, cur) =>
            acc && option.label.toLowerCase().includes(cur.toLowerCase()),
        true
    )
}

const PricingModelSelect = ({ onChange, loadPricingModels }) => {
    return (
        <AsyncSelect
            isSearchable
            isClearable
            cacheOptions
            defaultOptions
            placeholder={'Pricing model'}
            loadOptions={loadPricingModels}
            filterOption={customFilterOption}
            onChange={onChange}
        />
    )
}

export default PricingModelSelect
