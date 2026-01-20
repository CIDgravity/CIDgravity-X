import axios from 'axios'

import { REPUTATION_DISCOVERY_SERVICE_URL } from '../../../config/constants'

export const GetDealProposalLabelEncoded = async (price, currency, pieceCID) => 
    await axios.post(`${REPUTATION_DISCOVERY_SERVICE_URL}/v1/get-erc20-encoded-label`, {
        'price': price,
        'currency': currency,
        'pieceCID': pieceCID
    })