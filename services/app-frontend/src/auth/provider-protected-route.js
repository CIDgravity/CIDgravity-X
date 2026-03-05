import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router'
import { withAuthenticationRequired } from '@auth0/auth0-react'
import { Loading } from '../shared/components/index'
import { HasAccessToAddress } from '../shared/services/addresses_claim'
import { useAuth0 } from '@auth0/auth0-react'

import { SESSION_STORAGE_TENANT_KEY, LAST_SEEN_ADDRESS_COOKIE_NAME } from '../config/constants'
import { SetTenantValuesInSessionStorage } from '../shared/utils/auth'
import { getSpecificAddressActorTypeFromJwt } from '../shared/utils/addresses'
import { isShortAddressFromFilecoinAddressString } from 'shared/utils/filecoinUtil'

import Cookies from 'js-cookie'

const ProviderProtectedRoute = ({ component }) => {
    const [hasAccess, setHasAccess] = useState(false)
    const { getAccessTokenSilently, loginWithRedirect, isAuthenticated } = useAuth0()
    const navigate = useNavigate()
    const params = useParams()
    const { address } = params
    const location = useLocation()

    // Use refs for values that should not re-trigger the effect
    const getTokenRef = useRef(getAccessTokenSilently)
    const navigateRef = useRef(navigate)
    getTokenRef.current = getAccessTokenSilently
    navigateRef.current = navigate

    // Check if user is authenticated, if not redirect to login page
    useEffect(() => {
        if (!isAuthenticated) {
            loginWithRedirect()
        } else {
            // Check if current user has access to requested address
            // If yes, get address from JWT, to check if actorType match (to avoid redirect on /provider for client address)
            // Also check the provided address is a short address (not supporting long address in URL)
            if (address !== null && address !== undefined && address !== '' && isShortAddressFromFilecoinAddressString(address)) {
                HasAccessToAddress(address).then(function (result) {
                    if (result.status === 200) {
                        getTokenRef.current().then((JWTToken) => {
                            const actorTypeFromJwt = getSpecificAddressActorTypeFromJwt(address, JWTToken)

                            if (actorTypeFromJwt !== null) {
                                if (actorTypeFromJwt === 'storageminer') {
                                    SetTenantValuesInSessionStorage(address, 'storageminer')

                                        // If lastSeenAddress from cookie isn't the same than selected address, update
                                    if (Cookies.get(LAST_SEEN_ADDRESS_COOKIE_NAME) !== address) {
                                        Cookies.set(LAST_SEEN_ADDRESS_COOKIE_NAME, address)
                                    }

                                    window.dispatchEvent(new Event(SESSION_STORAGE_TENANT_KEY))
                                    setHasAccess(true)

                                } else {
                                    sessionStorage.removeItem(SESSION_STORAGE_TENANT_KEY)
                                    window.dispatchEvent(new Event(SESSION_STORAGE_TENANT_KEY))
                                    navigateRef.current('/not-found')
                                }

                            } else {
                                sessionStorage.removeItem(SESSION_STORAGE_TENANT_KEY)
                                window.dispatchEvent(new Event(SESSION_STORAGE_TENANT_KEY))
                                navigateRef.current('/not-authorized')
                            }
                        })

                    } else {
                        sessionStorage.removeItem(SESSION_STORAGE_TENANT_KEY)
                        window.dispatchEvent(new Event(SESSION_STORAGE_TENANT_KEY))
                        navigateRef.current('/not-authorized')
                    }
                })
                .catch(() => {
                    sessionStorage.removeItem(SESSION_STORAGE_TENANT_KEY)
                    window.dispatchEvent(new Event(SESSION_STORAGE_TENANT_KEY))
                    navigateRef.current('/not-authorized')
                })

            } else {
                sessionStorage.removeItem(SESSION_STORAGE_TENANT_KEY)
                window.dispatchEvent(new Event(SESSION_STORAGE_TENANT_KEY))
                navigateRef.current('/not-found')
            }
        }
    }, [address, isAuthenticated, loginWithRedirect])

    const AuthenticatedComponent = useMemo(
        () => withAuthenticationRequired(component, { onRedirecting: () => <Loading /> }),
        [component]
    )

    const match = useMemo(() => ({ params }), [params])
    const history = useMemo(() => ({
        push: (path, options) => navigate(path, options),
        replace: (path) => navigate(path, { replace: true }),
        goBack: () => navigate(-1),
        go: (n) => navigate(n),
    }), [navigate])

    return hasAccess ? <AuthenticatedComponent match={match} history={history} navigate={navigate} params={params} location={location} /> : null
}

export default ProviderProtectedRoute
