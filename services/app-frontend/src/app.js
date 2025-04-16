import React, { Suspense } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Route, Switch } from 'react-router-dom'

// Provider components (located in views/provider)
import { DashboardContainer } from 'views/provider/dashboard'
import { ClientContainer, CreateClientContainer } from 'views/provider/client/'
import {
    CreatePricingModelContainer,
    PricingModelContainer,
} from 'views/provider/pricing-model'
import { SettingsContainer } from 'views/provider/settings/'
import { BlacklistContainer } from 'views/provider/blacklist/'
import {
    StorageAcceptanceLogicContainer,
    CreateStorageAcceptanceLogicContainer,
} from 'views/provider/storage-acceptance-logic'
import { PlaygroundContainer } from 'views/provider/playground'
import { RetrievalAclContainer } from 'views/provider/retrieval-acl'
import { StorageDashboardContainer } from 'views/provider/storage-dashboard/'
import { RetrievalDashboardContainer } from 'views/provider/retrieval-dashboard/'
import { StorageHistoryContainer } from 'views/provider/storage-history/'
import { RetrievalHistoryContainer } from 'views/provider/retrieval-history'
import { ProviderInformationContainer } from 'views/provider/information'

// Client components (located in views/client)
import { ClientDashboardContainer } from 'views/client/dashboard'
import { ClientSettingsContainer } from 'views/client/settings'
import { ClientInformationContainer } from 'views/client/information'
import { OnboardingPolicyContainer, CreateOnboardingPolicyGroupContainer} from 'views/client/onboarding-policy'
import { ClientBlacklistContainer } from 'views/client/blacklist'
import { ClientStorageDealsHistoryContainer } from 'views/client/storage-history'
import { ProviderDetailsContainer } from 'views/client/provider-details'

// Global components (located in views/global)
import { Loading, SideNavBar, TopNavBar } from 'shared/components'
import { UserProfileContainer } from 'views/global/user-profile'
import { MyAddressesContainer } from 'views/global/my-addresses'
import {
    HelpCenterContainer,
    DiagnosisContainer,
} from 'views/global/help-center/'
import { Homepage } from 'views/global/home'
import { OnboardingContainer } from 'views/global/onboarding'
import { WizardContainer } from 'views/global/wizard'

// Other components (located in views/)
import { Unavailable } from 'views/Unavailable'
import ErrorBoundaryRoute from 'views/ErrorBoundaryRoute'
import NotAuthorized from 'views/NotAuthorized'

import ClientProtectedRoute from './auth/client-protected-route'
import ProviderProtectedRoute from './auth/provider-protected-route'
import ProtectedRoute from './auth/protected-route'

import { InitAxiosInterceptorsAndRefreshLogic } from './config/axiosInterceptors'
import { InitMomentConfiguration } from './config/moment'
import { AUTH0_ERROR_RETRY } from './config/constants'

import * as buffer from 'buffer'
window.Buffer = buffer.Buffer

const App = () => {
    InitMomentConfiguration()
    InitAxiosInterceptorsAndRefreshLogic()
    const { isLoading, loginWithRedirect, error } = useAuth0()

    if (isLoading) {
        return <Loading />
    }

    if (error) {
        // If the error occurs for the first time, try again
        // otherwise display of the error page and reset of the variable
        const errorAlreadyHappened = sessionStorage.getItem(AUTH0_ERROR_RETRY)

        if (!errorAlreadyHappened) {
            sessionStorage.setItem(AUTH0_ERROR_RETRY, true)
            loginWithRedirect()
        } else {
            sessionStorage.removeItem(AUTH0_ERROR_RETRY)

            return <Unavailable errorMessage={error.message} />
        }
    } else {
        sessionStorage.removeItem(AUTH0_ERROR_RETRY)
        return (
            <div className="app-container d-flex">
                <div className="sidebar-wrapper">
                    <Suspense fallback={null}>
                        <SideNavBar />
                    </Suspense>
                </div>
                <div className="page-content-wrapper d-flex flex-column">
                    <Suspense fallback={null}>
                        <TopNavBar />
                    </Suspense>

                    <div className="container-wrapper">
                        <Suspense fallback={null}>
                            <Switch>
                                {/* Token protected route for homepage (no tenant selected) */}
                                <ProtectedRoute
                                    exact
                                    path="/"
                                    component={Homepage}
                                />
                                <ProtectedRoute
                                    path="/onboarding"
                                    component={OnboardingContainer}
                                />
                                <ProtectedRoute
                                    path="/wizard"
                                    component={WizardContainer}
                                />

                                <Route
                                    exact
                                    path="/not-found"
                                    component={ErrorBoundaryRoute}
                                />
                                <Route
                                    exact
                                    path="/not-authorized"
                                    component={NotAuthorized}
                                />

                                {/* Following route are protected with Auth0 token but not under miner context */}
                                <ProtectedRoute
                                    exact
                                    path="/profile"
                                    component={UserProfileContainer}
                                />
                                <ProtectedRoute
                                    exact
                                    path="/my-addresses"
                                    component={MyAddressesContainer}
                                />
                                <ProtectedRoute
                                    exact
                                    path="/help"
                                    component={HelpCenterContainer}
                                />

                                {/* Following route are protected by Auth0 and access to client (actorType = account) */}
                                <ClientProtectedRoute
                                    exact
                                    path="/client/:address"
                                    component={ClientDashboardContainer}
                                />

                                <ClientProtectedRoute
                                    exact
                                    path="/client/:address/information"
                                    component={ClientInformationContainer}
                                />

                                <ClientProtectedRoute
                                    exact
                                    path="/client/:address/settings"
                                    component={ClientSettingsContainer}
                                />

                                <ClientProtectedRoute
                                    exact
                                    path="/client/:address/onboarding-policy"
                                    component={OnboardingPolicyContainer}
                                />
                                <ClientProtectedRoute
                                    exact
                                    path="/client/:address/onboarding-policy/:policyGroupId"
                                    component={CreateOnboardingPolicyGroupContainer}
                                />
                                <ClientProtectedRoute
                                    exact
                                    path="/client/:address/blacklist"
                                    component={ClientBlacklistContainer}
                                />
                                <ClientProtectedRoute
                                    exact
                                    path="/client/:address/storage-history"
                                    component={ClientStorageDealsHistoryContainer}
                                />
                                <ClientProtectedRoute
                                    exact
                                    path="/client/:address/provider-details/:providerAddress"
                                    component={ProviderDetailsContainer}
                                />

                                {/* Following route are protected by Auth0 and access to provider (actorType = storageminer) */}
                                <ProviderProtectedRoute
                                    exact
                                    path="/provider/:address/storage-acceptance-logic"
                                    component={StorageAcceptanceLogicContainer}
                                />
                                <ProviderProtectedRoute
                                    exact
                                    path="/provider/:address/storage-acceptance-logic/:acceptanceLogicId"
                                    component={
                                        CreateStorageAcceptanceLogicContainer
                                    }
                                />
                                <ProviderProtectedRoute
                                    exact
                                    path="/provider/:address/diagnosis/:errorCode?"
                                    component={DiagnosisContainer}
                                />
                                <ProviderProtectedRoute
                                    exact
                                    path="/provider/:address"
                                    component={DashboardContainer}
                                />
                                <ProviderProtectedRoute
                                    exact
                                    path="/provider/:address/information"
                                    component={ProviderInformationContainer}
                                />
                                <ProviderProtectedRoute
                                    exact
                                    path="/provider/:address/settings/:tab?"
                                    component={SettingsContainer}
                                />
                                <ProviderProtectedRoute
                                    exact
                                    path="/provider/:address/pricing-model"
                                    component={PricingModelContainer}
                                />
                                <ProviderProtectedRoute
                                    exact
                                    path="/provider/:address/pricing-model/:pricingModelId"
                                    component={CreatePricingModelContainer}
                                />
                                <ProviderProtectedRoute
                                    exact
                                    path="/provider/:address/storage-history"
                                    component={StorageHistoryContainer}
                                />
                                <ProviderProtectedRoute
                                    exact
                                    path="/provider/:address/retrieval-acl"
                                    component={RetrievalAclContainer}
                                />
                                <ProviderProtectedRoute
                                    exact
                                    path="/provider/:address/storage-dashboard"
                                    component={StorageDashboardContainer}
                                />
                                <ProviderProtectedRoute
                                    exact
                                    path="/provider/:address/retrieval-dashboard"
                                    component={RetrievalDashboardContainer}
                                />
                                <ProviderProtectedRoute
                                    exact
                                    path="/provider/:address/retrieval-history"
                                    component={RetrievalHistoryContainer}
                                />
                                <ProviderProtectedRoute
                                    exact
                                    path="/provider/:address/playground"
                                    component={PlaygroundContainer}
                                />
                                <ProviderProtectedRoute
                                    exact
                                    path="/provider/:address/playground/:dealProposalId"
                                    component={PlaygroundContainer}
                                />
                                <ProviderProtectedRoute
                                    exact
                                    path="/provider/:address/blacklist"
                                    component={BlacklistContainer}
                                />
                                <ProviderProtectedRoute
                                    exact
                                    path="/provider/:address/client"
                                    component={ClientContainer}
                                />
                                <ProviderProtectedRoute
                                    exact
                                    path="/provider/:address/client/:clientId"
                                    component={CreateClientContainer}
                                />
                                <Route exact component={ErrorBoundaryRoute} />
                            </Switch>
                        </Suspense>
                    </div>
                </div>
            </div>
        )
    }
}
export default App
