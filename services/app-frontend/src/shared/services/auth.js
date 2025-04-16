import axios from 'axios'

import { SERVER_API_URL } from '../../config/constants'

const apiURL = `${SERVER_API_URL}/authorize`

export const CheckAccessMiner = async (minerId) =>
    await axios.get(apiURL, {
        headers: {
            'Miner-Id': minerId,
        },
    })
