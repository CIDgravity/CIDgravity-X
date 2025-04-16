import axios from 'axios'

import { SERVER_API_URL } from '../../config/constants'

const apiURL = `${SERVER_API_URL}/help-center`

export const CreateHelpCenterTicket = async (ticketDetails) =>
    await axios.post(`${apiURL}/create-ticket`, ticketDetails)
