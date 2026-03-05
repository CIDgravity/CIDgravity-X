import { useRef, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router'
import { useAuth0 } from '@auth0/auth0-react'

import { SESSION_STORAGE_TENANT_KEY, TOKEN_REFRESHED_DISPATCH_EVENT } from './constants'
import { GetSelectedAddressIdFromSessionStorage } from '../shared/utils/auth'

export function InitAxiosInterceptorsAndRefreshLogic() {
    const { getAccessTokenSilently } = useAuth0()
    const navigate = useNavigate()

    // Use refs so interceptors always access the latest function references
    // even though the interceptors themselves are registered only once
    const getTokenRef = useRef(getAccessTokenSilently)
    const navigateRef = useRef(navigate)

    getTokenRef.current = getAccessTokenSilently
    navigateRef.current = navigate

    useEffect(() => {
        /* Axios Interceptor to add Authorization header and Tenant-Id headers */
        const requestInterceptor = axios.interceptors.request.use(async (req) => {

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
            const token = await getTokenRef.current()
            req.headers['Authorization'] = `Bearer ${token}`

            if (selectedAddress !== null) {
                req.headers['X-Address-ID'] = selectedAddress
            }

            return req
        })

        // Create the refresh logic to refresh the token on 401
        const responseInterceptor = axios.interceptors.response.use(
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
                        getTokenRef.current({ cacheMode: 'off' })
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
                        if (failedRequest.response && failedRequest.response.status === 401) {
                            sessionStorage.removeItem(SESSION_STORAGE_TENANT_KEY)
                            window.dispatchEvent(
                                new Event(SESSION_STORAGE_TENANT_KEY)
                            )
                            navigateRef.current('/not-authorized')
                        }

                        throw failedRequest
                    }
                })
            }
        )

        // Cleanup: eject interceptors on unmount to prevent stacking
        return () => {
            axios.interceptors.request.eject(requestInterceptor)
            axios.interceptors.response.eject(responseInterceptor)
        }
    }, [])
}
