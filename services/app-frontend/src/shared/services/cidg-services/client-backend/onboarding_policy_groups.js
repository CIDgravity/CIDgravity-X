import axios from 'axios'

import { CLIENT_BACKEND_SERVICE_URL } from 'config/constants'
const apiURL = `${CLIENT_BACKEND_SERVICE_URL}/v1/client-backend/onboarding-policy/groups`

export const GetAllOnboardingPolicyGroupsForCurrentTenant = async () => 
    await axios.post(`${apiURL}/get-all`)

export const CreateOnboardingPolicyGroup = async (group) =>
    await axios.post(`${apiURL}/new`, group)

export const UpdateOnboardingPolicyGroup = async (group) =>
    await axios.post(`${apiURL}/update`, group)

export const GetOnboardingPolicyGroupByIdAndCurrentTenant = async (groupId) =>
    await axios.post(`${apiURL}/get-single`, { "id": parseInt(groupId) })

export const CheckOnboardingPolicyGroupNameAlreadyUsed = async (name) =>
    await axios.post(`${apiURL}/check-name-already-used`, name)

export const CheckProviderNotAlreadyUsedInPolicyGroup = async (provider) =>
    await axios.post(`${apiURL}/check-provider-in-group`, provider)

export const RemovePolicyGroup = async (groupId) =>
    await axios.post(`${apiURL}/delete`, { "id": parseInt(groupId) })