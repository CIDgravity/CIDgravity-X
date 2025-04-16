import axios from 'axios'

import { CLIENT_BACKEND_SERVICE_URL } from 'config/constants'
const apiURL = `${CLIENT_BACKEND_SERVICE_URL}/v1/client-backend`

export const GetProviderDetailsForClient = async (providerAddress) => 
    await axios.post(`${apiURL}/provider-details`, { "addressId": providerAddress })
    