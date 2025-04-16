import axios from 'axios'
import { SERVER_API_URL } from '../../config/constants'

const apiURL = `${SERVER_API_URL}/wizard`

export const CompleteMinerFromScratch = async (data) =>
    await axios.post(`${apiURL}/complete-from-scratch`, data)

export const CompleteMinerAlreadyExists = async (data) =>
    await axios.post(`${apiURL}/complete-already-exists`, data)
