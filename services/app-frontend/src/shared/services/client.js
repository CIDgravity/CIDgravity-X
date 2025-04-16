import axios from 'axios'

import { SERVER_API_URL } from '../../config/constants'

const apiURL = `${SERVER_API_URL}/client`

export const GetAllClientsForCurrentUserPaginated = async (
    currentPage,
    pageSize
) => await axios.get(`${apiURL}/paginated/${currentPage}/${pageSize}`)

export const GetAllClientsForCurrentUser = async () =>
    await axios.put(`${apiURL}`, {
        onlyRetrieval: false,
        onlyStorage: false,
    })

export const GetAllRetrievalClientsForCurrentUser = async () =>
    await axios.put(`${apiURL}`, {
        onlyRetrieval: true,
    })

export const GetClientById = async (clientId) =>
    await axios.get(`${apiURL}/${clientId}`)

export const UpdateClient = async (client) => await axios.patch(apiURL, client)

export const RemoveClient = async (client) =>
    await axios.delete(`${apiURL}/${client.id}`)

export const CreateClient = async (client) => await axios.post(apiURL, client)

// check if address is already used & if address ID exist
// if everything is OK,
// then return the corresponding long address if a short address were sent
export const checkAddressValidityAndResolveId = async (address) =>
    await axios.post(`${apiURL}/check-address-validity`, address)

export const checkAlreadyUsedName = async (name) =>
    await axios.post(`${apiURL}/check-used-name`, name)

export const checkAlreadyUsedPeerId = async (peerId) =>
    await axios.post(`${apiURL}/check-used-peerId`, peerId)

export const ChangeLockClientState = async (client, customMessage) =>
    await axios.patch(`${apiURL}/lock-state`, {
        client: client,
        message: customMessage,
    })

export const CheckHasAssociatedAcl = async (clientId) =>
    await axios.get(`${apiURL}/has-associated-acl/${clientId}`)
