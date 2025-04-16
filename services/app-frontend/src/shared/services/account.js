import axios from 'axios'

import { SERVER_API_URL } from '../../config/constants'

const apiURL = `${SERVER_API_URL}/account`

export const GetCurrentUser = async () => await axios.get(apiURL)
