import { REPORTING_SERVICE_URL } from '../../config/constants'
import axios from 'axios'

const reportingServiceUrl = `${REPORTING_SERVICE_URL}/v1/reporting/retrieval-proposal`

export const GetAllDealsReceivedFromReportingService = async (data) => {
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

    return axios.post(`${reportingServiceUrl}/get-list-by-search-terms`, {
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
