import React, { Suspense } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Route, Routes } from 'react-router'

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
import { ClaimFromGatewayContainer } from 'views/global/claim-from-gateway'

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
                            <Routes>
                                {/* Token protected route for homepage (no tenant selected) */}
                                <Route path="/" element={<ProtectedRoute component={Homepage} />} />
                                <Route path="/onboarding" element={<ProtectedRoute component={OnboardingContainer} />} />
                                <Route path="/wizard" element={<ProtectedRoute component={WizardContainer} />} />

                                <Route path="/not-found" element={<ErrorBoundaryRoute />} />
                                <Route path="/not-authorized" element={<NotAuthorized />} />

                                {/* Following route are protected with Auth0 token but not under miner context */}
                                <Route path="/claim/:signedMessage" element={<ProtectedRoute component={ClaimFromGatewayContainer} />} />
                                <Route path="/profile" element={<ProtectedRoute component={UserProfileContainer} />} />
                                <Route path="/my-addresses" element={<ProtectedRoute component={MyAddressesContainer} />} />
                                <Route path="/help" element={<ProtectedRoute component={HelpCenterContainer} />} />

                                {/* Following route are protected by Auth0 and access to client (actorType = account) */}
                                <Route path="/client/:address" element={<ClientProtectedRoute component={ClientDashboardContainer} />} />
                                <Route path="/client/:address/information" element={<ClientProtectedRoute component={ClientInformationContainer} />} />
                                <Route path="/client/:address/settings" element={<ClientProtectedRoute component={ClientSettingsContainer} />} />
                                <Route path="/client/:address/onboarding-policy" element={<ClientProtectedRoute component={OnboardingPolicyContainer} />} />
                                <Route path="/client/:address/onboarding-policy/:policyGroupId" element={<ClientProtectedRoute component={CreateOnboardingPolicyGroupContainer} />} />
                                <Route path="/client/:address/blacklist" element={<ClientProtectedRoute component={ClientBlacklistContainer} />} />
                                <Route path="/client/:address/storage-history" element={<ClientProtectedRoute component={ClientStorageDealsHistoryContainer} />} />
                                <Route path="/client/:address/provider-details/:providerAddress" element={<ClientProtectedRoute component={ProviderDetailsContainer} />} />

                                {/* Following route are protected by Auth0 and access to provider (actorType = storageminer) */}
                                <Route path="/provider/:address/storage-acceptance-logic" element={<ProviderProtectedRoute component={StorageAcceptanceLogicContainer} />} />
                                <Route path="/provider/:address/storage-acceptance-logic/:acceptanceLogicId" element={<ProviderProtectedRoute component={CreateStorageAcceptanceLogicContainer} />} />
                                <Route path="/provider/:address/diagnosis/:errorCode?" element={<ProviderProtectedRoute component={DiagnosisContainer} />} />
                                <Route path="/provider/:address" element={<ProviderProtectedRoute component={DashboardContainer} />} />
                                <Route path="/provider/:address/information" element={<ProviderProtectedRoute component={ProviderInformationContainer} />} />
                                <Route path="/provider/:address/settings/:tab?" element={<ProviderProtectedRoute component={SettingsContainer} />} />
                                <Route path="/provider/:address/pricing-model" element={<ProviderProtectedRoute component={PricingModelContainer} />} />
                                <Route path="/provider/:address/pricing-model/:pricingModelId" element={<ProviderProtectedRoute component={CreatePricingModelContainer} />} />
                                <Route path="/provider/:address/storage-history" element={<ProviderProtectedRoute component={StorageHistoryContainer} />} />
                                <Route path="/provider/:address/retrieval-acl" element={<ProviderProtectedRoute component={RetrievalAclContainer} />} />
                                <Route path="/provider/:address/storage-dashboard" element={<ProviderProtectedRoute component={StorageDashboardContainer} />} />
                                <Route path="/provider/:address/retrieval-dashboard" element={<ProviderProtectedRoute component={RetrievalDashboardContainer} />} />
                                <Route path="/provider/:address/retrieval-history" element={<ProviderProtectedRoute component={RetrievalHistoryContainer} />} />
                                <Route path="/provider/:address/playground" element={<ProviderProtectedRoute component={PlaygroundContainer} />} />
                                <Route path="/provider/:address/playground/:dealProposalId" element={<ProviderProtectedRoute component={PlaygroundContainer} />} />
                                <Route path="/provider/:address/blacklist" element={<ProviderProtectedRoute component={BlacklistContainer} />} />
                                <Route path="/provider/:address/client" element={<ProviderProtectedRoute component={ClientContainer} />} />
                                <Route path="/provider/:address/client/:clientId" element={<ProviderProtectedRoute component={CreateClientContainer} />} />
                                <Route path="*" element={<ErrorBoundaryRoute />} />
                            </Routes>
                        </Suspense>
                    </div>
                </div>
            </div>
        )
    }
}
export default App
