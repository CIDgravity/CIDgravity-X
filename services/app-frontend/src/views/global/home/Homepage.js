import React, { useEffect } from 'react'

import { useNavigate } from 'react-router'
import { useAuth0 } from '@auth0/auth0-react'

import { GetAddressActorType } from 'shared/services/addresses_claim'
import { loadFirstAvailableAddressFromJwt } from 'shared/utils/addresses'
import { isShortAddressFromFilecoinAddressString } from 'shared/utils/filecoinUtil'

import { SESSION_STORAGE_TENANT_KEY, LAST_SEEN_ADDRESS_COOKIE_NAME } from 'config/constants'
import { Loader } from 'shared/components'

import Cookies from 'js-cookie'

const Homepage = () => {
    const navigate = useNavigate()
    const { getAccessTokenSilently } = useAuth0()

    useEffect(() => {
        sessionStorage.removeItem(SESSION_STORAGE_TENANT_KEY)

        // Read cookie that store the last seen address for user
        const lastSeenAddress = Cookies.get(LAST_SEEN_ADDRESS_COOKIE_NAME)
        
        // Check if user has a lastSeenAddress or not, if yes get actor type from API and redirect to dashboard
        // If not lastSeenAddress, get first available address from JWT to redirect to associated dashboard
        // In case no address found, redirect to onboarding page
        if (lastSeenAddress !== undefined && lastSeenAddress != null && isShortAddressFromFilecoinAddressString(lastSeenAddress)) {
            GetAddressActorType(lastSeenAddress).then(function (actorType) {
                if (actorType.data.actor_type === 'storageminer') {
                    navigate(`/provider/${lastSeenAddress}`, { replace: true })
                } else if (actorType.data.actor_type === 'account') {
                    navigate(`/client/${lastSeenAddress}`, { replace: true })
                }
            })

        } else {
            getAccessTokenSilently().then((JWTToken) => {
                const firstAddressFromJwt = loadFirstAvailableAddressFromJwt(JWTToken)

                if (firstAddressFromJwt !== null) {
                    const [ actorType, addressId ] = firstAddressFromJwt

                    if (actorType === 'storageminer') {
                        navigate(`/provider/${addressId}`, { replace: true })
                    } else if (actorType === 'account') {
                        navigate(`/client/${addressId}`, { replace: true })
                    } else {
                        navigate(`/onboarding`, { replace: true })
                    }

                } else {
                    navigate(`/onboarding`, { replace: true })
                }
            })
        }
    })

    return (
        <div className="container">
            <Loader />
        </div>
    )
}

export default Homepage
