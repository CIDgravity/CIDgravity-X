import axios from 'axios'

import { CLIENT_BACKEND_SERVICE_URL } from 'config/constants'
const apiURL = `${CLIENT_BACKEND_SERVICE_URL}/v1/client-backend/onboarding-policy/settings`

export const InitOnboardingPolicySettings = async (policySettings) => 
    await axios.post(`${apiURL}/new`, policySettings)
    
export const GetOnboardingPolicySettingsForCurrentTenant = async () => 
    await axios.post(`${apiURL}/get`)

export const UpdateOnboardingPolicySettings = async (settings) =>
    await axios.post(`${apiURL}/update`, settings)

export const GetExportationFormatForCurrentTenant = async () =>
    await axios.post(`${CLIENT_BACKEND_SERVICE_URL}/v1/onboarding-policy/export`)

export const ImportOnboardingPolicyForCurrentTenant = async (policyToImport) => 
    await axios.post(`${CLIENT_BACKEND_SERVICE_URL}/v1/onboarding-policy/import`, policyToImport)