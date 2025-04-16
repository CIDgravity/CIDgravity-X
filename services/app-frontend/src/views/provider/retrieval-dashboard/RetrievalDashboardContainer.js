import React, { PureComponent } from 'react'
import { Container, Row, Col, Button } from 'reactstrap'
import { withAuth0 } from '@auth0/auth0-react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRefresh } from '@fortawesome/free-solid-svg-icons'

import { DashboardLoader } from 'shared/components'
import { withTranslation } from 'react-i18next'

import Retool from 'react-retool'
import DatePicker from 'react-datepicker'
import moment from 'moment'

import { RETOOL_RETRIEVAL_DASHBOARD_PUBLIC_LINK } from 'config/constants'
import { GetSelectedAddressIdFromSessionStorage } from 'shared/utils/auth'

class RetrievalDashboardContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            iframeUpdate: false,
            isFullyLoaded: false,
            tenantId: null,
            token: null,
            selectedTimeRange: '24hours',
            selectedCustomDate: new Date(),
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

                {/* Load the iframe but hidde it until fully loaded, display a loader during this time */}
                {/* We have to use display: none to create the iframe but just hide it to the user = smooth retool loading */}
                <Row className="mt-4 mb-4">
                    <Col
                        xs={12}
                        md={selectedTimeRange === 'specificDate' ? 4 : 6}
                        lg={selectedTimeRange === 'specificDate' ? 4 : 6}
                    >
                        <select
                            disabled={!isFullyLoaded}
                            style={{ marginLeft: 20 + 'px' }}
                            className="form-select"
                            name="timeRange"
                            id="timeRange-type"
                            defaultValue={selectedTimeRange}
                            placeholder={t('filter.timeRange.placeholder')}
                            onChange={(e) =>
                                this.onTimeRangeChange(e.target.value)
                            }
                        >
                            <option value="60minutes">
                                {t('filter.timeRange.60minutes')}
                            </option>
                            <option value="24hours">
                                {t('filter.timeRange.24hours')}
                            </option>
                            <option value="30days">
                                {t('filter.timeRange.30days')}
                            </option>
                            <option value="3months">
                                {t('filter.timeRange.3months')}
                            </option>
                            <option value="specificDate">
                                {t('filter.timeRange.specificDate')}
                            </option>
                        </select>
                    </Col>

                    {selectedTimeRange === 'specificDate' && (
                        <Col
                            xs={12}
                            md={4}
                            lg={4}
                            style={{ marginLeft: 20 + 'px' }}
                        >
                            <DatePicker
                                disabled={!isFullyLoaded}
                                onChangeRaw={this.onCustomDateChangeRaw}
                                disabledKeyboardNavigation
                                dateFormat={this.dateFormat}
                                monthsShown={2}
                                selected={selectedCustomDate}
                                onChange={(value) =>
                                    this.onCustomDateChange(value)
                                }
                                isClearable={false}
                                className="form-control"
                                maxDate={new Date()}
                                minDate={this.minDate}
                                placeholderText={t(
                                    'filter.datePicker.placeholder',
                                    { dateFormat: this.dateFormat }
                                )}
                            />
                        </Col>
                    )}

                    <Col className="text-end">
                        <Button
                            disabled={!isFullyLoaded}
                            onClick={this.onRefresh}
                            style={{ marginRight: 20 + 'px' }}
                            color="primary"
                            size="1x"
                        >
                            <FontAwesomeIcon icon={faRefresh} size="2xs" />
                            <span style={{ marginLeft: 10 + 'px' }}>
                                {t('button.refresh')}
                            </span>
                        </Button>
                    </Col>
                </Row>

                <Row
                    className="mt-4 mb-4"
                    style={{ display: !isFullyLoaded ? 'block' : 'none' }}
                >
                    <Col
                        xs={12}
                        md={12}
                        lg={12}
                        style={{
                            marginLeft: 20 + 'px',
                            marginRight: 20 + 'px',
                        }}
                    >
                        <DashboardLoader />
                    </Col>
                </Row>

                <Row
                    className="justify-content-center mt-4 mb-4"
                    style={{ display: isFullyLoaded ? 'block' : 'none' }}
                >
                    <Col>
                        {tenantId && token && selectedTimeRange ? (
                            <Retool
                                onIframePostMessage={
                                    this.handleIframePostMessage
                                }
                                height={'3000px'}
                                url={RETOOL_RETRIEVAL_DASHBOARD_PUBLIC_LINK}
                                data={{
                                    selectedTenant: tenantId,
                                    timeRange:
                                        selectedTimeRange === 'specificDate'
                                            ? moment(selectedCustomDate).unix()
                                            : selectedTimeRange,
                                    authorizationToken: token,
                                    iframeUpdate: iframeUpdate,
                                    i18n: t('retool', { returnObjects: true }),
                                }}
                            />
                        ) : (
                            <DashboardLoader />
                        )}
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default withAuth0(
    withTranslation('RetrievalDashboardContainer')(RetrievalDashboardContainer)
)
