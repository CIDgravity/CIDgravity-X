import React, { useEffect, useMemo } from 'react'
import { withAuthenticationRequired } from '@auth0/auth0-react'
import { Loading } from '../shared/components/index'

import { HasAccessToAddress } from '../shared/services/addresses_claim'

import { SESSION_STORAGE_TENANT_KEY } from '../config/constants'
import { GetTenantValuesFromSessionStorage } from '../shared/utils/auth'

const ProtectedRoute = ({ component }) => {
    useEffect(() => {
        const [addressId, actorType] = GetTenantValuesFromSessionStorage();

        if (addressId != null && addressId !== '' && actorType !== null && actorType !== '') {
            // Check if current user has access to requested address
            HasAccessToAddress(addressId)
                .then(function (result) {
                    if (result.status !== 200) {
                        sessionStorage.removeItem(SESSION_STORAGE_TENANT_KEY)
                    }
                })
                .catch(() => {
                    sessionStorage.removeItem(SESSION_STORAGE_TENANT_KEY)
                })
        }
    }, [])

    const AuthenticatedComponent = useMemo(
        () => withAuthenticationRequired(component, {
            onRedirecting: () => <Loading />
        }),
        [component]
    )

    return <AuthenticatedComponent />
}

export default ProtectedRoute
