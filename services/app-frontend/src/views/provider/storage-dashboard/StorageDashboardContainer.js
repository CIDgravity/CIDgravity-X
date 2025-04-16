import React, { PureComponent } from 'react'
import { Container, Row, Col } from 'reactstrap'
import { withAuth0 } from '@auth0/auth0-react'
import { withTranslation } from 'react-i18next'

import StorageDashboard from './StorageDashboard'

import { GetSelectedAddressIdFromSessionStorage } from 'shared/utils/auth'

class StorageDashboardContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            iframeUpdate: false,
            isFullyLoaded: false,
            tenantId: null,
            token: null,
            selectedTimeRange: '24hours',
            selectedCustomDate: new Date(),
            selectedUnit: 'numberOfProposals',
            loadingInterval: null,
        }
    }

    async componentDidMount() {
        const selectedAddress = GetSelectedAddressIdFromSessionStorage()
        await this.loadExistingTokenOrRenew()

        this.setState({ tenantId: selectedAddress })

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

    onCustomDateChangeRaw = (e) => {
        e.preventDefault()
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
            isFullyLoaded,
            iframeUpdate,
            tenantId,
            token,
            selectedTimeRange,
            selectedUnit,
            selectedCustomDate,
        } = this.state
        const { t } = this.props

        return (
            <Container>
                <Row className="mt-4 mb-4">
                    <Col xs={12} md={6}>
                        <h1>{t('title')}</h1>
                    </Col>
                </Row>

                <StorageDashboard
                    onCustomDateChangeRaw={this.onCustomDateChangeRaw}
                    onUnitChange={this.onUnitChange}
                    onCustomDateChange={this.onCustomDateChange}
                    onTimeRangeChange={this.onTimeRangeChange}
                    tenantId={tenantId}
                    token={token}
                    selectedTimeRange={selectedTimeRange}
                    selectedCustomDate={selectedCustomDate}
                    selectedUnit={selectedUnit}
                    onRefresh={this.onRefresh}
                    onIframePostMessage={this.handleIframePostMessage}
                    isFullyLoaded={isFullyLoaded}
                    iframeUpdate={iframeUpdate}
                />
            </Container>
        )
    }
}

export default withAuth0(
    withTranslation('StorageDashboardContainer')(StorageDashboardContainer)
)
