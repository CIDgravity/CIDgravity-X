import React, { PureComponent } from 'react'
import { Container, Row, Col, Button } from 'reactstrap'
import { withAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'
import { withTranslation } from 'react-i18next'

import { Loader } from 'shared/components'
import { GetCurrentAddress } from 'shared/services/addresses_claim'
import { GetSelectedAddressIdFromSessionStorage } from 'shared/utils/auth'

import StorageDashboard from 'views/provider/storage-dashboard/StorageDashboard'
import MinerStatusDashboard from 'views/provider/miner-status-dashboard/MinerStatusDashboard'

class DashboardContainer extends PureComponent {
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
            selectedTimeRange: '24hours',
            selectedCustomDate: new Date(),
            selectedUnit: 'numberOfProposals',
            loadingInterval: null,
            currentAddress: {
                address: '',
                actorType: '',
                friendlyName: '',
                settings: {
                    enableStatusCheckService: false,
                },
            },
        }
    }

    async componentDidMount() {
        const { user } = this.props.auth0
        const { name } = user

        // Here selectedAddress return a string from value in session storage
        const selectedAddress = GetSelectedAddressIdFromSessionStorage()

        await this.loadExistingTokenOrRenew()
        this.setState({ userName: name, tenantId: selectedAddress })

        // Here we also have to retrieve tenant settings
        // Because if miner status checker is enabled, the dahsboard will be different
        // If not, we will display the storage deals dashboard from Retool
        try {
            const response = await GetCurrentAddress()

            if (response.data) {
                this.setState({
                    isLoading: false,
                    currentAddress: response.data,
                })
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

    onCustomDateChange = async (selectedDate) => {
        await this.loadExistingTokenOrRenew()
        this.setState({ selectedCustomDate: selectedDate })
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

    onCustomDateChangeRaw = (e) => {
        e.preventDefault()
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
            isLoading,
            isFullyLoaded,
            isError,
            userName,
            currentAddress,
            iframeUpdate,
            tenantId,
            token,
            selectedTimeRange,
            selectedCustomDate,
            selectedUnit,
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
                            <Col xs={12} md={6}>
                                <h1>
                                    {t('title', { userFirstName: userName })}
                                </h1>
                            </Col>
                        </Row>

                        {/* The dashboard depend on the enableStatusCheckService */}
                        {/* For MinerStatusChecker dashboard, user will not be able to choose a time period (fixed in Retool) */}
                        {currentAddress.settings.enableStatusCheckService ? (
                            <MinerStatusDashboard
                                tenantId={tenantId}
                                token={token}
                                onTimeRangeChange={this.onTimeRangeChange}
                                selectedTimeRange={selectedTimeRange}
                                onRefresh={this.onRefresh}
                                onIframePostMessage={
                                    this.handleIframePostMessage
                                }
                                iframeUpdate={iframeUpdate}
                                isFullyLoaded={isFullyLoaded}
                            />
                        ) : (
                            <StorageDashboard
                                onCustomDateChangeRaw={
                                    this.onCustomDateChangeRaw
                                }
                                onUnitChange={this.onUnitChange}
                                onCustomDateChange={this.onCustomDateChange}
                                onTimeRangeChange={this.onTimeRangeChange}
                                tenantId={tenantId}
                                token={token}
                                selectedTimeRange={selectedTimeRange}
                                selectedCustomDate={selectedCustomDate}
                                selectedUnit={selectedUnit}
                                onRefresh={this.onRefresh}
                                onIframePostMessage={
                                    this.handleIframePostMessage
                                }
                                iframeUpdate={iframeUpdate}
                                isFullyLoaded={isFullyLoaded}
                            />
                        )}
                    </>
                )}
            </Container>
        )
    }
}

export default withAuth0(
    withTranslation('DashboardContainer')(DashboardContainer)
)
