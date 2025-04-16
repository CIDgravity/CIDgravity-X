import axios from 'axios'

import { SERVER_API_URL } from '../../config/constants'

const apiURL = `${SERVER_API_URL}/storage-acceptance-logic`

export const CreateAcceptanceLogic = async (accetanceLogic) =>
    await axios.post(apiURL, accetanceLogic)

export const UpdateAcceptanceLogic = async (accetanceLogic) =>
    await axios.patch(`${apiURL}`, accetanceLogic)

export const UpdateDefaultAcceptanceLogic = async (acceptanceLogicId) =>
    await axios.put(`${apiURL}/default/${acceptanceLogicId}`)

export const GetAllAcceptanceLogicsForCurrentUserPaginated = async (
    currentPage,
    pageSize
) => await axios.get(`${apiURL}/paginated/${currentPage}/${pageSize}`)

export const GetAcceptanceLogicById = async (acceptanceLogicId) =>
    await axios.get(`${apiURL}/${acceptanceLogicId}`)

export const GetAllStorageAcceptanceLogicsForCurrentTenant = async () =>
    await axios.get(`${apiURL}`)

export const RemoveAcceptanceLogic = async (accetanceLogic) =>
    await axios.delete(`${apiURL}/${accetanceLogic.id}`)

export const CheckIfDefaultLogicExist = async () =>
    await axios.get(`${apiURL}/default-logic-exist`)

export const CheckAlreadyUsedName = async (name) =>
    await axios.post(`${apiURL}/check-used-name`, name)
