import React, { PureComponent } from 'react'
import { Container, Row, Col, Button } from 'reactstrap'
import { withAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'
import { withTranslation, Trans } from 'react-i18next'

import { Loader } from 'shared/components'
import { GetSelectedAddressIdFromSessionStorage } from 'shared/utils/auth'
import {  GetCurrentClientAddress } from 'shared/services/cidg-services/client-backend/address'

import ClientDashboard from './ClientDashboard'

class ClientDashboardContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            isLoading: true,
            isFullyLoaded: false,
            isError: false,
            iframeUpdate: false,
            userName: null,
            tenantId: null,
            token: null,
            selectedTimeRange: '30days',
            selectedUnit: 'volume',
            loadingInterval: null,
            currentAddress: {
                address: '',
                addressId: '',
                actorTyp: '',
                claimedOn: '',
                friendlyName: '',
                information: {
                    addressId: '',
                    contactEmail: '',
                    contactFullName: '',
                    contactSlack: '',
                    datacapRequestLink: '',
                    entityCountry: '',
                    entityName: '',
                    entityType: '',
                    entityWebsite: ''
                }
            },
        }
    }

    async componentDidMount() {
        const { user } = this.props.auth0
        const { name } = user

        // Here selectedAddress can return { addressId: null, actorType: null } is session storage contain invalid values
        try {
            const selectedAddress = GetSelectedAddressIdFromSessionStorage()

            await this.loadExistingTokenOrRenew()
            this.setState({ userName: name, tenantId: selectedAddress })

            // Here we also have to retrieve client information for Retool dashboard
            // We will use some client information (such as datacap request link)
            try {
                const response = await GetCurrentClientAddress()

                if (response.data) {
                    this.setState({ isLoading: false, currentAddress: response.data.result })
                }
            } catch (error) {
                this.setState({ isLoading: false, isError: true })
                console.error(error)
            }

            // If not loaded, we will consider dashboard loaded after 10 seconds
            const interval = setInterval(
                () => this.setState({ isFullyLoaded: true }),
                20000
            )

            this.setState({ loadingInterval: interval })
        } catch (error) {
            this.setState({ isLoading: false, isError: true })
            console.error(error)
        }
    }

    loadExistingTokenOrRenew = async () => {
        const { getAccessTokenSilently } = this.props.auth0

        await getAccessTokenSilently().then((value) => {
            this.setState({ token: value })
        })
    }

    onTimeRangeChange = async (selected) => {
        await this.loadExistingTokenOrRenew()

        this.setState({
            selectedTimeRange: selected,
            selectedCustomDate: new Date(),
        })
    }

    onUnitChange = async (selected) => {
        await this.loadExistingTokenOrRenew()
        this.setState({ selectedUnit: selected })
    }

    onRefresh = async () => {
        await this.loadExistingTokenOrRenew()

        // we use iframeUpdate just to tell Retool to reload requests
        // so we don't care about the value, just need to change the value each time
        this.setState({ iframeUpdate: !this.state.iframeUpdate })
    }

    handleIframePostMessage = (data) => {
        const { loadingInterval } = this.state

        if (data && data.type === 'REPORT_FULLY_LOADED') {
            this.setState({ isFullyLoaded: true })
            clearInterval(loadingInterval)
        }
    }

    render() {
        const {
            currentAddress,
            isLoading,
            isFullyLoaded,
            isError,
            userName,
            iframeUpdate,
            tenantId,
            token,
            selectedTimeRange,
            selectedUnit
        } = this.state
        const { t } = this.props

        return (
            <Container>
                {isLoading ? (
                    <Loader />
                ) : isError ? (
                    <Row className="mt-4">
                        <Col xs={12} md={12}>
                            <h1>{t('title', { userFirstName: userName })}</h1>
                        </Col>

                        <Col xs={12} md={12}>
                            <section className="card-form mt-4">
                                {t('error.unableToLoadMinerSettings')}
                                <br />
                                <br />
                                <Button
                                    tag={Link}
                                    to="../dashboard"
                                    type="submit"
                                    color="danger"
                                    size="1x"
                                    className="me-4"
                                >
                                    <span className="as--light">
                                        {t('button.reloadDashboard')}
                                    </span>
                                </Button>
                            </section>
                        </Col>
                    </Row>
                ) : (
                    <>
                        <Row className="mt-4 mb-4">
                            <Col xs={12} md={12}>
                                <h1>
                                    {t('title', { userFirstName: userName })}
                                </h1>
                                <p>
                                    <Trans t={t} i18nKey="subtitle" />
                                </p>
                            </Col>
                        </Row>

                        <ClientDashboard
                            currentAddressInformation={currentAddress && currentAddress.information}
                            onUnitChange={this.onUnitChange}
                            tenantId={tenantId}
                            token={token}
                            onTimeRangeChange={this.onTimeRangeChange}
                            selectedTimeRange={selectedTimeRange}
                            selectedUnit={selectedUnit}
                            onRefresh={this.onRefresh}
                            onIframePostMessage={this.handleIframePostMessage}
                            iframeUpdate={iframeUpdate}
                            isFullyLoaded={isFullyLoaded}
                        />
                    </>
                )}
            </Container>
        )
    }
}

export default withAuth0(
    withTranslation('ClientDashboardContainer')(ClientDashboardContainer)
)
