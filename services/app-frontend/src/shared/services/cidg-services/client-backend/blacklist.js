import axios from 'axios'

import { CLIENT_BACKEND_SERVICE_URL } from 'config/constants'
const apiURL = `${CLIENT_BACKEND_SERVICE_URL}/v1/client-backend/blacklist`

// Must use post instead of get here, because on backend side shouldBindJson not working with params
export const GetAllBlacklistedAddressesForCurrentTenantPaginated = async (currentPage, itemPerPage, searchTerm) =>
    await axios.post(`${apiURL}/get-by-search-term`, {
        searchTerm: searchTerm,
        page: currentPage,
        size: itemPerPage
    })

export const InsertAddressToBlacklist = async (address) =>
    await axios.post(`${apiURL}/new`, address)

export const RemoveAddressFromBlacklist = async (addressId) =>
    await axios.post(`${apiURL}/delete`, { "id": parseInt(addressId) })

export const CheckIfAddressIsBlacklisted = async (address) =>
    await axios.post(`${apiURL}/is-blacklisted`, address)