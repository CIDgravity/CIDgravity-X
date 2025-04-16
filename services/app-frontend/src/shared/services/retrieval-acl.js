import axios from 'axios'

import { SERVER_API_URL } from '../../config/constants'

const apiURL = `${SERVER_API_URL}/retrieval-acl`

export const GetAllBlacklistedPaginated = async (currentPage, pageSize) =>
    await axios.get(`${apiURL}/blacklisted/${currentPage}/${pageSize}`)

export const GetAllBlacklisted = async () =>
    await axios.get(`${apiURL}/blacklisted`)

export const GetAllWhitelistedPaginated = async (currentPage, pageSize) =>
    await axios.get(`${apiURL}/whitelisted/${currentPage}/${pageSize}`)

export const GetAllWhitelisted = async () =>
    await axios.get(`${apiURL}/whitelisted`)

export const UpdateRetrievalDefaultBehavior = async (defaultBehaviorStr) =>
    await axios.patch(`${apiURL}/default-behavior`, {
        retrievalDefaultBehavior: defaultBehaviorStr,
    })

export const AddWhitelistItem = async (peerOrClientId) =>
    await axios.patch(`${apiURL}/whitelisted`, peerOrClientId)

export const AddBlacklistItem = async (peerOrClientId) =>
    await axios.patch(`${apiURL}/blacklisted`, peerOrClientId)

export const RemoveWhitelistItem = async (peerOrClientId) => {
    if (peerOrClientId.clientId !== undefined) {
        await axios.delete(
            `${apiURL}/whitelisted?clientId=${peerOrClientId.clientId}`
        )
    } else {
        await axios.delete(
            `${apiURL}/whitelisted?peerId=${peerOrClientId.peerId}`
        )
    }
}

export const RemoveBlacklistItem = async (peerOrClientId) => {
    if (peerOrClientId.clientId !== undefined) {
        await axios.delete(
            `${apiURL}/blacklisted?clientId=${peerOrClientId.clientId}`
        )
    } else {
        await axios.delete(
            `${apiURL}/blacklisted?peerId=${peerOrClientId.peerId}`
        )
    }
}

export const ApplyAclChanges = async (aclChangesDTO) =>
    await axios.post(`${apiURL}`, aclChangesDTO)
