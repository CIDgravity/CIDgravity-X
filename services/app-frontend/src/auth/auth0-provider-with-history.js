import React from 'react'
import { useHistory } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import {
    AUTH0_DOMAIN,
    AUTH0_CLIENT_ID,
    AUTH0_AUDIENCE,
} from '../config/constants'

const Auth0ProviderWithHistory = ({ children }) => {
    const history = useHistory()

    const onRedirectCallback = (appState) => {
        history.push(appState?.returnTo || window.location.pathname)
    }

    return (
        <Auth0Provider
            domain={AUTH0_DOMAIN}
            clientId={AUTH0_CLIENT_ID}
            redirectUri={window.location.origin}
            onRedirectCallback={onRedirectCallback}
            audience={AUTH0_AUDIENCE}
            useRefreshTokens={true}
            cacheLocation="localstorage" // Necessary on some browser to avoid cookies to be lost when refresh pages
        >
            {children}
        </Auth0Provider>
    )
}

export default Auth0ProviderWithHistory
