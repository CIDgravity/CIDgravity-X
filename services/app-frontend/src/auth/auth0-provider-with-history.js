import React from 'react'
import { useNavigate } from 'react-router'
import { Auth0Provider } from '@auth0/auth0-react'
import {
    AUTH0_DOMAIN,
    AUTH0_CLIENT_ID,
    AUTH0_AUDIENCE,
} from '../config/constants'

const Auth0ProviderWithHistory = ({ children }) => {
    const navigate = useNavigate()

    const onRedirectCallback = (appState) => {
        navigate(appState?.returnTo || window.location.pathname)
    }

    return (
        <Auth0Provider
            domain={AUTH0_DOMAIN}
            clientId={AUTH0_CLIENT_ID}
            authorizationParams={{
                redirect_uri: window.location.origin,
                audience: AUTH0_AUDIENCE,
            }}
            onRedirectCallback={onRedirectCallback}
            useRefreshTokens={true}
            cacheLocation="localstorage" // Necessary on some browser to avoid cookies to be lost when refresh pages
        >
            {children}
        </Auth0Provider>
    )
}

export default Auth0ProviderWithHistory
