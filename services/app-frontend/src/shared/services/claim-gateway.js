import axios from 'axios'
import { SERVER_API_URL } from '../../config/constants'

const apiURL = `${SERVER_API_URL}/addresses/gateway`

export const LinkGatewayAddressToUser = async (signedMessage) =>
    await axios.post(`${apiURL}/link-address-to-user`, {
        'signedMessage': signedMessage
    })
