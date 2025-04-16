import axios from 'axios'

import { SERVER_API_URL } from '../../config/constants'

export const GetVersionInfos = async () =>
    await axios.get(`${SERVER_API_URL}/version`)

export const MissingTranslation = async (language, namespace, key) =>
    await axios.post(`${SERVER_API_URL}/translations/missing-key`, {
        language: language[0],
        namespace: namespace,
        key: key,
    })
