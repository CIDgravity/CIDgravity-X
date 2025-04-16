import React, { useState, useEffect } from 'react'
import { Route, useHistory } from 'react-router-dom'
import { withAuthenticationRequired } from '@auth0/auth0-react'
import { Loading } from '../shared/components/index'
import { HasAccessToAddress } from '../shared/services/addresses_claim'
import { useAuth0 } from '@auth0/auth0-react'
import { withRouter } from 'react-router-dom'

import { SESSION_STORAGE_TENANT_KEY, LAST_SEEN_ADDRESS_COOKIE_NAME } from '../config/constants'
import { SetTenantValuesInSessionStorage } from '../shared/utils/auth'
import { getSpecificAddressActorTypeFromJwt } from '../shared/utils/addresses'
import { isShortAddressFromFilecoinAddressString } from 'shared/utils/filecoinUtil'

import Cookies from 'js-cookie'

const ClientProtectedRoute = ({ component, ...args }) => {
    const [hasAccess, setHasAccess] = useState(false)
    const { getAccessTokenSilently, loginWithRedirect, isAuthenticated } = useAuth0()
    const history = useHistory()

    // Check if user is authenticated, if not redirect to login page
    useEffect(() => {
        if (!isAuthenticated) {
            loginWithRedirect()
        } else {
            const address = args.computedMatch.params.address

            // Check if current user has access to requested address
            // If yes, get address from JWT, to check if actorType match (to avoid redirect on /provider for client address)
            // Also check the provided address is a short address (not supporting long address in URL)
            if (address !== null && address !== undefined && address !== '' && isShortAddressFromFilecoinAddressString(address)) {
                HasAccessToAddress(address).then(function (result) {
                    if (result.status === 200) {
                        getAccessTokenSilently().then((JWTToken) => {
                            const actorTypeFromJwt = getSpecificAddressActorTypeFromJwt(address, JWTToken)

                            if (actorTypeFromJwt !== null) {
                                if (actorTypeFromJwt === 'account') {
                                    SetTenantValuesInSessionStorage(address, 'account')

                                     // If lastSeenAddress from cookie isn't the same than selected address, update
                                    if (Cookies.get(LAST_SEEN_ADDRESS_COOKIE_NAME) !== address) {
                                        Cookies.set(LAST_SEEN_ADDRESS_COOKIE_NAME, address)     
                                    }

                                    window.dispatchEvent(new Event(SESSION_STORAGE_TENANT_KEY))
                                    setHasAccess(true)

                                } else {
                                    sessionStorage.removeItem(SESSION_STORAGE_TENANT_KEY)
                                    window.dispatchEvent(new Event(SESSION_STORAGE_TENANT_KEY))
                                    history.push('/not-found')
                                }

                            } else {
                                sessionStorage.removeItem(SESSION_STORAGE_TENANT_KEY)
                                window.dispatchEvent(new Event(SESSION_STORAGE_TENANT_KEY))
                                history.push('/not-authorized')
                            }
                        })

                    } else {
                        sessionStorage.removeItem(SESSION_STORAGE_TENANT_KEY)
                        window.dispatchEvent(new Event(SESSION_STORAGE_TENANT_KEY))
                        history.push('/not-authorized')
                    }
                })
                .catch(() => {
                    sessionStorage.removeItem(SESSION_STORAGE_TENANT_KEY)
                    window.dispatchEvent(new Event(SESSION_STORAGE_TENANT_KEY))
                    history.push('/not-authorized')
                })
            } else {
                sessionStorage.removeItem(SESSION_STORAGE_TENANT_KEY)
                window.dispatchEvent(new Event(SESSION_STORAGE_TENANT_KEY))
                history.push('/not-found')
            }
        }
    }, [args.computedMatch.params.address, history, isAuthenticated, getAccessTokenSilently, loginWithRedirect])

    return (
        hasAccess && (
            <Route component={withAuthenticationRequired(component, { onRedirecting: () => <Loading /> })} {...args} />
        )
    )
}

export default withRouter(ClientProtectedRoute)
