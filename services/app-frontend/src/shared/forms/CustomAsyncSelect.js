import React from 'react'
import AsyncSelect from 'react-select/async'

const filterData = (inputValue, data) =>
    data.filter(
        (i) => i.label.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
    )

const promiseOptions = (inputValue, data) =>
    new Promise((resolve) => {
        resolve(filterData(inputValue, data))
    })

const CustomAsyncSelect = ({
    data,
    field,
    onChange,
    placeholder,
    defaultValue,
}) => {
    return (
        <AsyncSelect
            defaultOptions
            cacheOptions
            defaultValue={defaultValue}
            placeholder={placeholder}
            loadOptions={(value) => promiseOptions(value, data)}
            {...field}
            onChange={onChange}
        />
    )
}

export default CustomAsyncSelect
