import React from 'react'
import AsyncSelect from 'react-select/async'

import { GetDecisionsAndStatusesDropdownOptions } from 'shared/utils/deal-status'

const filterData = (inputValue, data) =>
    data.filter(
        (i) => i.label.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
    )

const promiseOptions = (inputValue, data) =>
    new Promise((resolve) => {
        resolve(filterData(inputValue, data))
    })

const DecisionAndStatusAsyncSelect = ({ field, onChange, placeholder, isForClient = false }) => {
    const data = GetDecisionsAndStatusesDropdownOptions(isForClient)

    return (
        <AsyncSelect
            isClearable
            defaultOptions
            cacheOptions
            placeholder={placeholder}
            loadOptions={(value) => promiseOptions(value, data)}
            onChange={onChange}
            {...field}
        />
    )
}

export default DecisionAndStatusAsyncSelect
