import React, { PureComponent } from 'react'
import { Row, Col, Button } from 'reactstrap'
import { withAuth0 } from '@auth0/auth0-react'

import { isMobile } from 'react-device-detect'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRefresh } from '@fortawesome/free-solid-svg-icons'

import { DashboardLoader } from 'shared/components'
import { withTranslation } from 'react-i18next'
import Retool from 'react-retool'
import { RETOOL_STORAGE_DASHBOARD_PUBLIC_LINK } from 'config/constants'

import DatePicker from 'react-datepicker'
import moment from 'moment'

class StorageDashboard extends PureComponent {
    render() {
        const {
            isFullyLoaded,
            t,
            onCustomDateChangeRaw,
            onUnitChange,
            onCustomDateChange,
            onTimeRangeChange,
            tenantId,
            token,
            selectedTimeRange,
            selectedCustomDate,
            selectedUnit,
            onRefresh,
            iframeUpdate,
            onIframePostMessage,
        } = this.props

        return (
            <>
                <Row className="justify-content-center mt-4 mb-4">
                    <Col
                        xs={12}
                        md={selectedTimeRange === 'specificDate' ? 3 : 4}
                        lg={selectedTimeRange === 'specificDate' ? 3 : 4}
                    >
                        <select
                            disabled={!isFullyLoaded}
                            style={{ marginLeft: 20 + 'px' }}
                            className="form-select"
                            name="timeRange"
                            id="timeRange-type"
                            defaultValue={selectedTimeRange}
                            placeholder={t('filter.timeRange.placeholder')}
                            onChange={(e) => onTimeRangeChange(e.target.value)}
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
                            md={3}
                            lg={3}
                            style={{ marginLeft: 20 + 'px' }}
                        >
                            <DatePicker
                                disabled={!isFullyLoaded}
                                onChangeRaw={onCustomDateChangeRaw}
                                disabledKeyboardNavigation
                                dateFormat={this.dateFormat}
                                monthsShown={2}
                                selected={selectedCustomDate}
                                onChange={(value) => onCustomDateChange(value)}
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

                    <Col
                        xs={12}
                        className={isMobile ? 'mt-4' : ''}
                        md={selectedTimeRange === 'specificDate' ? 3 : 4}
                        lg={selectedTimeRange === 'specificDate' ? 3 : 4}
                        style={
                            selectedTimeRange !== 'specificDate'
                                ? { marginLeft: 20 + 'px' }
                                : {}
                        }
                    >
                        <select
                            disabled={!isFullyLoaded}
                            className="form-select"
                            name="unit"
                            id="unit"
                            defaultValue={selectedUnit}
                            placeholder={t('filter.unit.placeholder')}
                            onChange={(e) => onUnitChange(e.target.value)}
                        >
                            <option value="numberOfProposals">
                                {t('filter.unit.numberOfProposals')}
                            </option>
                            <option value="cumulativeRawSize">
                                {t('filter.unit.cumulativeRawSize')}
                            </option>
                            <option value="qualityAdjustedPower">
                                {t('filter.unit.qualityAdjustedPower')}
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
                        {tenantId &&
                        token &&
                        selectedUnit &&
                        selectedTimeRange ? (
                            <Retool
                                onData={onIframePostMessage}
                                height={isMobile ? '6300px' : '8000px'}
                                url={RETOOL_STORAGE_DASHBOARD_PUBLIC_LINK}
                                data={{
                                    selectedTenant: tenantId,
                                    timeRange:
                                        selectedTimeRange === 'specificDate'
                                            ? moment(selectedCustomDate).unix()
                                            : selectedTimeRange,
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

export default withAuth0(withTranslation('StorageDashboard')(StorageDashboard))
