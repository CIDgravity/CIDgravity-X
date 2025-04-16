import React, { PureComponent } from 'react'
import { Row, Col, Button } from 'reactstrap'
import { withAuth0 } from '@auth0/auth0-react'

import { isMobile } from 'react-device-detect'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRefresh, faGlobe } from '@fortawesome/free-solid-svg-icons'

import { DashboardLoader } from 'shared/components'
import { withTranslation } from 'react-i18next'
import Retool from 'react-retool'
import { RETOOL_MINER_STATUS_CHECKER_PUBLIC_LINK } from 'config/constants'

class MinerStatusDashboard extends PureComponent {
    render() {
        const {
            isFullyLoaded,
            t,
            onTimeRangeChange,
            tenantId,
            token,
            selectedTimeRange,
            onRefresh,
            iframeUpdate,
            onIframePostMessage,
        } = this.props

        return (
            <>
                {/* Load the iframe but hidde it until fully loaded, display a loader during this time */}
                {/* We have to use display: none to create the iframe but just hide it to the user = smooth retool loading */}
                <Row className="mt-4 mb-4">
                    <Col xs={12} md={6} lg={6}>
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
                            <option value="72hours">
                                {t('filter.timeRange.72hours')}
                            </option>
                            <option value="7days">
                                {t('filter.timeRange.7days')}
                            </option>
                        </select>
                    </Col>

                    <Col className="text-end">
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={'https://filscan.io/miner/' + tenantId}
                            style={{ marginRight: 20 + 'px' }}
                            className="btn btn-secondary"
                        >
                            <FontAwesomeIcon icon={faGlobe} size="2xs" />
                            <span style={{ marginLeft: 10 + 'px' }}>
                                {t('button.viewOnFilscan')}
                            </span>
                        </a>

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
                                onData={onIframePostMessage}
                                height={isMobile ? '1300px' : '2000px'}
                                url={RETOOL_MINER_STATUS_CHECKER_PUBLIC_LINK}
                                data={{
                                    selectedTenant: tenantId,
                                    timeRange: selectedTimeRange,
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

export default withAuth0(
    withTranslation('MinerStatusDashboard')(MinerStatusDashboard)
)
