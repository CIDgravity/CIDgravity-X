import axios from 'axios'

import { SERVER_API_URL } from '../../config/constants'
const apiURL = `${SERVER_API_URL}`

export const CheckProviderShortAddressOnChainValidity = async (shortAddressToCheck) => 
    await axios.get(`${apiURL}/util/check-provider-short-address-validity/${shortAddressToCheck}`)
