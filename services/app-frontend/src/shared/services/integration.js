import axios from 'axios'

import { SERVER_API_URL } from '../../config/constants'

const apiURL = `${SERVER_API_URL}/integration`

export const LoadConnectedIntegrations = async () => await axios.get(apiURL)

export const GetLatestTicker = async () =>
    await axios.get(`${apiURL}/ticker/get-latest`)
