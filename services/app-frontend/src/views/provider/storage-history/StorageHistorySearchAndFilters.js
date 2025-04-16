import React, { Fragment, PureComponent } from 'react'
import { InputGroup, Input, Row, Col } from 'reactstrap'
import { withTranslation } from 'react-i18next'

import { DecisionAndStatusAsyncSelect, PricingModelSelect } from 'shared/forms'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

class StorageHistorySearchAndFilters extends PureComponent {
    constructor(props) {
        super(props)
        this.dateFormat = 'yyyy/MM/dd'
        this.minDate = new Date(
            new Date().getFullYear(),
            new Date().getMonth() - 3,
            new Date().getDate()
        )
    }

    render() {
        const {
            onSearchClientName,
            onSearchNameKeyDown,
            onSearchDate,
            onSearchMatchingPricing,
            onSearchDecisionOrStatus,
            loadPricingModels,
            t,
            startDate,
            endDate
        } = this.props

        return (
            <Fragment>
                <Row className="mt-4">
                    <Col xs={12} md={12} lg={12} className="mb-2">
                        <InputGroup>
                            <Input
                                id="search"
                                placeholder={t('inputSearch.placeholder')}
                                onKeyDown={onSearchNameKeyDown}
                                onChange={(e) =>
                                    onSearchClientName(e.target.value)
                                }
                                className="form-control"
                            />
                        </InputGroup>
                    </Col>
                </Row>

                <Row className="mt-2" style={{ marginBottom: 50 + 'px' }}>
                    <Col xs={12} md={4} lg={4} className="mt-2 mt-md-0">
                        <DatePicker
                            disabledKeyboardNavigation
                            dateFormat={this.dateFormat}
                            selectsRange={true}
                            monthsShown={2}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(value) =>
                                onSearchDate(value[0], value[1])
                            }
                            isClearable={true}
                            className="form-control"
                            maxDate={new Date()}
                            minDate={this.minDate}
                            placeholderText={t('dateRangePicker.placeholder', {
                                dateFormat: this.dateFormat,
                            })}
                        />
                    </Col>

                    <Col xs={12} md={5} lg={5}>
                        <DecisionAndStatusAsyncSelect
                            onChange={onSearchDecisionOrStatus}
                            id="status"
                            name="statusName"
                            placeholder={t('status.placeholder')}
                        />
                    </Col>

                    <Col xs={12} md={3} lg={3}>
                        <PricingModelSelect
                            onChange={onSearchMatchingPricing}
                            loadPricingModels={loadPricingModels}
                        />
                    </Col>
                </Row>
            </Fragment>
        )
    }
}

export default withTranslation('StorageHistorySearchAndFilters')(
    StorageHistorySearchAndFilters
)
