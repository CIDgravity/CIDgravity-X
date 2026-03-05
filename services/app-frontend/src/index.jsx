import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'

import { ToastContainer } from 'react-toastify'

import { BrowserRouter as Router } from 'react-router'

import Auth0ProviderWithHistory from './auth/auth0-provider-with-history'
import { I18nextProvider } from 'react-i18next'

import 'react-tooltip/dist/react-tooltip.css'
import './scss/index.scss'
import i18next from './i18n'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <Router>
        <I18nextProvider i18n={i18next}>
            <Auth0ProviderWithHistory>
                <ToastContainer
                    position="bottom-right"
                    autoClose={4000}
                    limit={5}
                    draggablePercent={60}
                    hideProgressBar={true}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    theme="dark"
                    pauseOnHover
                />
                <App />
            </Auth0ProviderWithHistory>
        </I18nextProvider>
    </Router>
)
