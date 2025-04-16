import axios from 'axios'

import { SERVER_API_URL } from '../../config/constants'

const apiURL = `${SERVER_API_URL}/addresses`
const apiURLV1 = `${SERVER_API_URL}/addresses/extended`

export const GetCurrentAddress = async () => await axios.get(apiURLV1)

export const GetSpecificAddress = async (address) => await axios.get(`${apiURLV1}?specificAddress=${address}`)

export const GetListOfUsersWhoHaveAccessToAddress = async (address) =>
    await axios.get(`${apiURL}/get-users-with-access/${address}`)

export const GetChallengeAndWorkerKey = async (addressToClaim) =>
    await axios.get(`${apiURL}/get-challenge/${addressToClaim}`)

export const CheckAddressAlreadyClaimed = async (addressToClaim) =>
    await axios.get(`${apiURL}/check-claimed/${addressToClaim}`)

export const CheckAddressClaimedLimit = async () =>
    await axios.get(`${apiURL}/check-address-claimed-limit`)

export const CheckAtLeastOneAddressClaimed = async () =>
    await axios.get(`${apiURL}/check-claimed`)

export const CheckChallenge = async (claim) =>
    await axios.post(`${apiURL}/check-challenge`, claim)

export const DeleteLinkBetweenAddressAndCurrentUser = async (address) =>
    await axios.delete(`${apiURL}/${address}`)

export const DeleteLinkBetweenAddressAndUser = async (address, user) =>
    await axios.delete(`${apiURL}/${address}/${user}`)

export const HasAccessToAddress = async (address) =>
    await axios.get(`${apiURL}/has-access/${address}`)

export const GetAddressActorType = async (address) =>
    await axios.get(`${apiURL}/actor-type?address=${address}`)

export const RegenerateConnectorToken = async () =>
    await axios.get(`${apiURLV1}/regenerate-token`)

export const UpdateAddressSettings = async (settings) =>
    await axios.patch(`${apiURLV1}/settings`, settings)

export const UpdateAddressInformation = async (information) =>
    await axios.post(`${apiURLV1}/information`, information)

export const UpdateAddressFriendlyName = async (address) =>
    await axios.patch(`${apiURLV1}/friendly-name`, address)

export const UpdateMaintenanceModeState = async (settings) =>
    await axios.patch(`${apiURLV1}/maintenance`, settings)

export const GetCurrentGlobalLimits = async () =>
    await axios.get(`${apiURLV1}/current-global-limits`)

export const GetProvidersListWithCompanyName = async () =>
    await axios.get(`${apiURL}/providers-list`)