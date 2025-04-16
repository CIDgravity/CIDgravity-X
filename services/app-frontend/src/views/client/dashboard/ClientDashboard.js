import React, { PureComponent } from 'react'
import { Row, Col, Button } from 'reactstrap'
import { withAuth0 } from '@auth0/auth0-react'

import { isMobile } from 'react-device-detect'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRefresh } from '@fortawesome/free-solid-svg-icons'

import { RETOOL_CLIENT_DASHBOARD_PUBLIC_LINK } from 'config/constants'
import { DashboardLoader } from 'shared/components'
import { withTranslation } from 'react-i18next'

import Retool from 'react-retool'

class ClientDashboard extends PureComponent {
    render() {
        const {
            currentAddressInformation,
            onUnitChange,
            isFullyLoaded,
            t,
            onTimeRangeChange,
            tenantId,
            token,
            selectedTimeRange,
            selectedUnit,
            onRefresh,
            iframeUpdate,
            onIframePostMessage,
        } = this.props

        return (
            <>
                {/* Load the iframe but hidde it until fully loaded, display a loader during this time */}
                {/* We have to use display: none to create the iframe but just hide it to the user = smooth retool loading */}
                <Row className="mt-4 mb-4">
                    <Col xs={12} md={4} lg={4}>
                        <select
                            className="form-select"
                            style={{ marginLeft: 20 + 'px' }}
                            name="timeRange"
                            id="timeRange-type"
                            disabled={!isFullyLoaded}
                            defaultValue={selectedTimeRange}
                            placeholder={t('filter.timeRange.placeholder')}
                            onChange={(e) => onTimeRangeChange(e.target.value)}
                        >
                            <option value="24hours">
                                {t('filter.timeRange.24hours')}
                            </option>
                            <option value="7days">
                                {t('filter.timeRange.7days')}
                            </option>
                            <option value="30days">
                                {t('filter.timeRange.30days')}
                            </option>
                            <option value="3months">
                                {t('filter.timeRange.3months')}
                            </option>
                        </select>
                    </Col>

                    <Col xs={12} className={isMobile ? 'mt-4' : ''} md={4} lg={4} style={{ marginLeft: 20 + 'px' }}>
                        <select
                            disabled={!isFullyLoaded}
                            className="form-select"
                            name="unit"
                            id="unit"
                            defaultValue={selectedUnit}
                            placeholder={t('filter.unit.placeholder')}
                            onChange={(e) => onUnitChange(e.target.value)}
                        >
                            <option value="volume">
                                {t('filter.unit.volume')}
                            </option>
                            <option value="deals">
                                {t('filter.unit.dealsCount')}
                            </option>
                        </select>
                    </Col>

                    <Col className="text-end">
                        <Button
                            disabled={!isFullyLoaded}
                            onClick={onRefresh}
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

                <Row className="mt-4 mb-4" style={{ display: !isFullyLoaded ? 'block' : 'none' }}>
                    <Col xs={12} md={12} lg={12} style={{ marginLeft: 20 + 'px', marginRight: 20 + 'px'}}>
                        <DashboardLoader />
                    </Col>
                </Row>

                <Row
                    className="justify-content-center mt-4 mb-4"
                    style={{ display: isFullyLoaded ? 'block' : 'none' }}
                >
                    <Col>
                        {tenantId && token && selectedTimeRange && selectedUnit ? (
                            <Retool
                                onData={onIframePostMessage}
                                height={isMobile ? '1000px' : '11500px'}
                                url={RETOOL_CLIENT_DASHBOARD_PUBLIC_LINK}
                                data={{
                                    selectedTenant: tenantId,
                                    currentAddressInformation: currentAddressInformation,
                                    timeRange: selectedTimeRange,
                                    displayUnit: selectedUnit,
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
            </>
        )
    }
}

export default withAuth0(withTranslation('ClientDashboard')(ClientDashboard))
