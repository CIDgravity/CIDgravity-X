import axios from 'axios'
import { useHistory } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

import { SESSION_STORAGE_TENANT_KEY, TOKEN_REFRESHED_DISPATCH_EVENT } from './constants'
import { GetSelectedAddressIdFromSessionStorage } from '../shared/utils/auth'

export function InitAxiosInterceptorsAndRefreshLogic() {
    const { getAccessTokenSilently } = useAuth0()
    const history = useHistory()

    /* Axios Interceptor to add Authorization header and Tenant-Id headers */
    axios.interceptors.request.use(async (req) => {

        // If req.params.addressToUse is set, use in X-Address-ID header instead of value from session storage
        // This will permit to retrieve data for specific address from decoded JWT token (MyAddresses page)
        var selectedAddress = GetSelectedAddressIdFromSessionStorage();

        // Extract param from url to detect if we want to load another address from JWT
        const paramsFromUrl = req.url.split("?", 2)

        if (paramsFromUrl.length >= 2) {
            const params = new URLSearchParams(paramsFromUrl[paramsFromUrl.length - 1]);

            if (params.get('specificAddress') !== null && params.get('specificAddress') !== undefined) {
                selectedAddress = params.get('specificAddress');
            }
        }

        // Get JWT Token and fill request headers
        const token = await getAccessTokenSilently()
        req.headers.common['Authorization'] = `Bearer ${token}`

        if (selectedAddress !== null) {
            req.headers['X-Address-ID'] = selectedAddress
        }

        return req
    })

    // Create the refresh logic to refresh the token on 401
    axios.interceptors.response.use(
        (response) => {
            return response
        },
        (failedRequest) => {
            return new Promise(function (resolve, reject) {
                if (
                    failedRequest.config &&
                    failedRequest.response &&
                    failedRequest.response.status === 401 &&
                    !failedRequest.config.__isRetry
                ) {
                    getAccessTokenSilently({ ignoreCache: true })
                        .then((newToken) => {
                            failedRequest.config.__isRetry = true
                            failedRequest.config.headers[
                                'Authorization'
                            ] = `Bearer ${newToken}`
                            axios(failedRequest.config).then(resolve, reject)
                            window.dispatchEvent(
                                new Event(TOKEN_REFRESHED_DISPATCH_EVENT)
                            )

                            return Promise.resolve()
                        })
                        .catch((error) => {
                            reject(error)
                        })
                } else {
                    // If the request has been retried one more time, and still get 401 status code = rights removed
                    // Remove all data from session storage and redirect to not-authorized page
                    if (failedRequest.response.status === 401) {
                        sessionStorage.removeItem(SESSION_STORAGE_TENANT_KEY)
                        window.dispatchEvent(
                            new Event(SESSION_STORAGE_TENANT_KEY)
                        )
                        history.push('/not-authorized')
                    }

                    throw failedRequest
                }
            })
        }
    )
}
