import axios from 'axios'

import { SERVER_API_URL, REPORTING_SERVICE_URL } from '../../config/constants'

const appServiceUrl = `${SERVER_API_URL}/deal-proposals`
const reportingServiceUrl = `${REPORTING_SERVICE_URL}/v1/reporting/storage-proposal`

export const GetAllDealsReceivedByCurrentUser = async (data) => {
    const { activePage, size, searchTerm, status, pricingModel, sort, order } =
        data

    return axios.get(`${appServiceUrl}/by-search-term`, {
        params: {
            ...(searchTerm ? { searchTerm } : {}),
            ...(status ? { status: status } : {}),
            ...(pricingModel ? { pricing: pricingModel } : {}),
            ...(activePage ? { page: activePage } : {}),
            ...(size ? { size } : {}),
            ...(sort ? { sort } : {}),
            ...(order ? { order } : {}),
        },
    })
}

export const GetAllClientDealsSentFromReportingService = async (data) => {
    const {
        activePage,
        size,
        searchTerm,
        startDate,
        endDate,
        status,
        sort,
        order,
    } = data

    return axios.post(`${reportingServiceUrl}/get-list-for-client-by-search-terms`, {
        ...(searchTerm ? { searchTerm } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(status ? { status: status } : {}),
        ...(activePage ? { page: activePage } : {}),
        ...(size ? { size } : {}),
        ...(sort ? { sort } : {}),
        ...(order ? { order } : {}),
    })
}

export const GetAllDealsReceivedFromReportingService = async (data) => {
    const {
        activePage,
        size,
        searchTerm,
        startDate,
        endDate,
        status,
        pricingModel,
        sort,
        order,
    } = data

    return axios.post(`${reportingServiceUrl}/get-list-by-search-terms`, {
        ...(searchTerm ? { searchTerm } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(status ? { status: status } : {}),
        ...(pricingModel ? { pricing: pricingModel } : {}),
        ...(activePage ? { page: activePage } : {}),
        ...(size ? { size } : {}),
        ...(sort ? { sort } : {}),
        ...(order ? { order } : {}),
    })
}

export const GetDealProposalByIdFromReporting = async (id) =>
    await axios.post(`${reportingServiceUrl}/get-single`, { id: id })

export const SendFromPlayground = async (dealProposal) =>
    await axios.post(`${appServiceUrl}/playground`, dealProposal, {
        headers: {
            'X-CIDgravity-Agent': 'CIDgravity-playground-Connector',
            'X-CIDgravity-Version': '2.0',
        },
    })
