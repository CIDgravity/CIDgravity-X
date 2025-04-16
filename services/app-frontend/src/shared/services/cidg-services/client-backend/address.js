import axios from 'axios'

import { CLIENT_BACKEND_SERVICE_URL } from 'config/constants'

const apiURL = `${CLIENT_BACKEND_SERVICE_URL}/v1/client-backend/addresses`

export const GetCurrentClientAddress = async () => await axios.post(`${apiURL}/get-current-address`)

export const GetSpecificClientAddress = async (address) => await axios.post(`${apiURL}/get-current-address?specificAddress=${address}`)

export const GetCurrentAddressIsPremium = async () =>
    await axios.post(`${apiURL}/get-is-premium`)

export const UpdateClientAddressFriendlyName = async (address) =>
    await axios.post(`${apiURL}/update-friendly-name`, address)

export const RegenerateClientToken = async () =>
    await axios.post(`${apiURL}/regenerate-token`)

export const UpdateClientInformations = async (address) =>
    await axios.post(`${apiURL}/update-informations`, address)

export const AddOrRemoveAlternateAddress = async (alternateAddress) =>
    await axios.post(`${apiURL}/add-remove-alternate-address`, alternateAddress)