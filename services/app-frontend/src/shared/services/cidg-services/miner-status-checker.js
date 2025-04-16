import axios from 'axios'

import { MINER_STATUS_CHECKER_SERVICE_URL } from '../../../config/constants'

const minerStatusCheckerServiceUrl = `${MINER_STATUS_CHECKER_SERVICE_URL}/v1/miner-status-checker`

export const SendProposalTest = async () =>
    await axios.post(`${minerStatusCheckerServiceUrl}/send-test`)

export const CheckForTestResponseAvailable = async (checkId) =>
    await axios.post(`${minerStatusCheckerServiceUrl}/get-results`, {
        checkId: checkId,
    })

export const CheckErrorCodeHandled = (checkResultReason) =>
    GetErrorCodesArray().findIndex(
        (errorCode) => errorCode.code === checkResultReason
    ) !== -1

export const GenerateErrorCodesFromUriParam = (uriParam) => {
    const array = GetErrorCodesArray()

    if (uriParam in array) {
        return array[uriParam].code
    }

    return null
}

export const GenerateErrorCodesFromCheckResult = (checkResultReason) => {
    const errorCodeArray = GetErrorCodesArray()
    const indexToReason = errorCodeArray.findIndex(
        (errorCode) => errorCode.code === checkResultReason
    )

    // If indexToReason is -1 it means the error is a code related to CIDgravity (not in array)
    // Or an error not handled by the miner-status-check service
    if (indexToReason !== -1) {
        errorCodeArray.forEach((element, index) => {
            if (index < indexToReason) {
                errorCodeArray[index].status = 'passed'
            }

            if (checkResultReason === 'DIAGNOSIS_SUCCESS') {
                errorCodeArray[index].status = 'passed'
            } else if (index === indexToReason) {
                errorCodeArray[index].status = 'failed'
            }
        })

        // Because we don't want to display waiting steps, remove it from final array
        return errorCodeArray.filter(
            (errorCode) => errorCode.status !== 'waiting'
        )
    } else {
        return [{ code: 'ERR_CIDGRAVITY_SIDE', status: 'failed' }]
    }
}

export const GetErrorCodesArray = () => {
    // return an array with error codes related to user / miner
    // the error codes related to CIDgravity are not in this array
    return [
        { code: 'ERR_NO_PEER_ID_SET_ON_CHAIN', status: 'waiting' },
        { code: 'ERR_NO_MULTI_ADDRESS_SET_ON_CHAIN', status: 'waiting' },
        { code: 'ERR_INVALID_MULTI_ADDRESS_IN_MINER_INFO', status: 'waiting' },
        { code: 'ERR_CONNECT_MINER_PEER_ID', status: 'waiting' },
        { code: 'ERR_DEAL_PROTOCOL_UNSUPPORTED', status: 'waiting' },
        { code: 'ERR_NO_MATCHING_DEAL_PROTOCOL_SUPPORTED', status: 'waiting' },
        { code: 'ERR_GET_ASK', status: 'waiting' },
        { code: 'ERR_GET_ASK_PRICES_NOT_SET_TO_ZERO', status: 'waiting' },
        { code: 'ERR_GET_ASK_SIZES_NOT_PROPERLY_SET', status: 'waiting' },
        { code: 'ERR_SEND_PROPOSAL', status: 'waiting' },
        { code: 'ERR_CIDGRAVITY_CONNECTOR_MISCONFIGURED', status: 'waiting' },
        { code: 'ERR_CIDGRAVITY_INVALID_CONNECTOR_TYPE', status: 'waiting' },
        { code: 'ERR_CIDGRAVITY_INVALID_CONNECTOR_VERSION', status: 'waiting' },
        { code: 'DIAGNOSIS_SUCCESS', status: 'waiting' },
    ]
}
