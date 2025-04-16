import axios from 'axios'

import { SERVER_API_URL } from '../../config/constants'

const apiURL = `${SERVER_API_URL}/blacklist`

export const GetAllBlacklistedForCurrentUser = async (data) => {
    const { activePage, size, searchTerm } = data

    return axios.get(`${apiURL}/by-search-term`, {
        params: {
            ...(searchTerm ? { searchTerm } : {}),
            ...(activePage ? { page: activePage } : {}),
            ...(size ? { size } : {}),
        },
    })
}

export const BlacklistAddress = async (addressToBlacklist) =>
    await axios.post(apiURL, addressToBlacklist)

export const WhitelistAddress = async (addressToWhitelist) =>
    await axios.delete(`${apiURL}/${addressToWhitelist.id}`)

export const CheckBlacklisted = async (addressToCheck) =>
    await axios.post(`${apiURL}/check-blacklisted`, addressToCheck)
