import axios from 'axios'

import { SERVER_API_URL } from '../../config/constants'

const apiURL = `${SERVER_API_URL}/integration`

export const LoadConnectedIntegrations = async () => await axios.get(apiURL)

export const GetLatestMessariTicker = async () =>
    await axios.get(`${apiURL}/messari/get-latest-ticker`)
