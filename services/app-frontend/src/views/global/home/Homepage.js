import React, { useEffect } from 'react'

import { useHistory } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

import { GetAddressActorType } from 'shared/services/addresses_claim'
import { loadFirstAvailableAddressFromJwt } from 'shared/utils/addresses'
import { isShortAddressFromFilecoinAddressString } from 'shared/utils/filecoinUtil'

import { SESSION_STORAGE_TENANT_KEY, LAST_SEEN_ADDRESS_COOKIE_NAME } from 'config/constants'
import { Loader } from 'shared/components'

import Cookies from 'js-cookie'

const Homepage = () => {
    const history = useHistory()
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
                    history.replace({ pathname: `/provider/${lastSeenAddress}` })
                } else if (actorType.data.actor_type === 'account') {
                    history.replace({ pathname: `/client/${lastSeenAddress}` })
                }
            })

        } else {
            getAccessTokenSilently().then((JWTToken) => {
                const firstAddressFromJwt = loadFirstAvailableAddressFromJwt(JWTToken)

                if (firstAddressFromJwt !== null) {
                    const [ actorType, addressId ] = firstAddressFromJwt

                    if (actorType === 'storageminer') {
                        history.replace({ pathname: `/provider/${addressId}` })
                    } else if (actorType === 'account') {
                        history.replace({ pathname: `/client/${addressId}` })
                    } else {
                        history.replace({ pathname: `/onboarding` })
                    }

                } else {
                    history.replace({ pathname: `/onboarding` })
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
