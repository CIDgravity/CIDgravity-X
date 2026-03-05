import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import Col from 'react-bootstrap/Col'
import FormControl from 'react-bootstrap/FormControl'
import InputGroup from 'react-bootstrap/InputGroup'
import Row from 'react-bootstrap/Row'
import { CustomAsyncSelect } from 'shared/forms'

import DatePicker from 'react-datepicker'

export function RetrievalHistorySearchAndFilters({
    onSearchClientName,
    onSearchClientNameKeyDown,
    onSearchDate,
    onSearchStatus,
    dealStatusSelected,
    startDate,
    endDate,
}) {
    const { t } = useTranslation('RetrievalHistorySearchAndFilters') // second param ignored i18n
    const dateFormat = 'yyyy/MM/dd'

    return (
        <Fragment>
            <Row className="mt-4">
                <Col xs={12} md={12} lg={12} className="mb-2">
                    <InputGroup>
                        <FormControl
                            id="search"
                            placeholder={t('inputSearch.placeholder')}
                            onChange={(e) => onSearchClientName(e.target.value)}
                            onKeyDown={onSearchClientNameKeyDown}
                            className="form-control"
                        />
                    </InputGroup>
                </Col>
            </Row>

            <Row style={{ marginBottom: '50px' }}>
                <Col xs={12} md={6} lg={6} className="mt-2 mt-md-0">
                    <DatePicker
                        disabledKeyboardNavigation
                        dateFormat={dateFormat}
                        selectsRange={true}
                        monthsShown={2}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(value) => onSearchDate(value[0], value[1])}
                        isClearable={true}
                        className="form-control"
                        maxDate={new Date()}
                        placeholderText={t('dateRangePicker.placeholder', {
                            dateFormat: dateFormat,
                        })}
                    />
                </Col>

                <Col xs={12} md={6} lg={6}>
                    <CustomAsyncSelect
                        onChange={onSearchStatus}
                        id="status"
                        name="statusName"
                        placeholder={t('status.placeholder')}
                        data={[
                            { label: t('status.all'), value: 'all' },
                            { label: t('status.accept'), value: 'accept' },
                            {
                                label: t('status.maintenance'),
                                value: 'maintenance',
                            },
                            {
                                label: t('status.retrievalRateLimit'),
                                value: 'retrievalRateLimit',
                            },
                            { label: t('status.acl'), value: 'acl' },
                        ]}
                        defaultValue={
                            dealStatusSelected === 'all'
                                ? { label: t('status.all'), value: 'all' }
                                : {
                                      label: dealStatusSelected,
                                      value: dealStatusSelected,
                                  }
                        }
                    />
                </Col>
            </Row>
        </Fragment>
    )
}
