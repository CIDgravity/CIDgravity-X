import { FastField, useField } from 'formik'
import { useTranslation } from 'react-i18next'
import { Col, FormGroup, Label, Row } from 'reactstrap'
import { boolean, number, object, string } from 'yup'

import Switch from 'react-switch'
import ReactTooltip from 'react-tooltip'

export const WizardSettingsStep = (stepTitle) => ({
    id: 'settings',
    label: stepTitle,
    initialValues: {
        storageDealsPerHour: 5,
        dealSize: 0,
        retrievalDealsPerHour: 10000,
        acceptDealsFromUnknownClients: false,
        customMessage: '',
    },
    validationSchema: object().shape({
        storageDealsPerHour: number(
            'validation.isStorageDealsPerHourValidNumber'
        )
            .min(0, 'validation.isStorageDealsPerHourPositiveNumber')
            .integer('validation.isStorageDealsPerHourInteger')
            .required('validation.isStorageDealsPerHourMandatory'),
        dealSize: number('validation.isDealSizeValidNumber')
            .min(0, 'validation.isDealSizePositiveNumber')
            .integer('validation.isDealSizeInteger')
            .required('validation.isDealSizeMandatory'),
        retrievalDealsPerHour: number(
            'validation.isRetrievalDealsPerHourValidNumber'
        )
            .min(0, 'validation.isRetrievalDealsPerHourPositiveNumber')
            .integer('validation.isRetrievalDealsPerHourInteger')
            .required('validation.isRetrievalDealsPerHourMandatory'),
        acceptDealsFromUnknownClients: boolean(),
        customMessage: string(),
    }),
    keepValuesOnPrevious: true,
    component: Form,
})

export function Form() {
    // eslint-disable-next-line no-unused-vars
    const [fieldUnknownClients, metaUnknownClients, helpersUnknownClients] =
        useField('acceptDealsFromUnknownClients')
    // eslint-disable-next-line no-unused-vars
    const [fieldStorageDeal, metaStorageDeal, helpersStorageDeal] = useField(
        'storageDealsPerHour'
    )
    // eslint-disable-next-line no-unused-vars
    const [fieldDealSize, metaDealSize, helpersDealSize] = useField('dealSize')
    // eslint-disable-next-line no-unused-vars
    const [fieldRetrievalDeal, metaRetrievalDeal, helpersRetrievalDeal] =
        useField('retrievalDealsPerHour')
    const { setValue } = helpersUnknownClients
    const { t } = useTranslation('WizardSettingsStep') // second param ignored i18n

    return (
        <>
            <Row className="card-form-header mb-4">
                <Col md="12" xs="12">
                    <h3 className="title is-4 is-styled">{t('title')}</h3>
                    <h5>{t('subtitle')}</h5>
                </Col>
            </Row>

            <Row className="p-2 mb-4 pt-4">
                <Col md="6" xs="6">
                    <FormGroup>
                        <Label
                            for="storage-global-hourly-deal-limit"
                            className="form-label"
                        >
                            {t('numberOfStorageDealsPerHourField.label')}
                        </Label>

                        <i
                            style={{ marginTop: '4px' }}
                            data-for="storageGlobalDealsLimitPerHour"
                            data-tip={t(
                                'numberOfStorageDealsPerHourField.tooltip'
                            )}
                            className="ms-4 fas fa-info-circle fa-sm"
                        />

                        <ReactTooltip
                            place="bottom"
                            id="storageGlobalDealsLimitPerHour"
                        />

                        <FastField
                            className="form-control"
                            type="number"
                            id="settings"
                            name="storageDealsPerHour"
                        />

                        {metaStorageDeal.touched && metaStorageDeal.error ? (
                            <div style={{ height: 1 + 'rem' }} className="mt-2">
                                <small className="text-danger">
                                    {t(`${metaStorageDeal.error}`)}
                                </small>
                            </div>
                        ) : null}
                    </FormGroup>
                </Col>

                <Col md="6" xs="6">
                    <FormGroup>
                        <Label
                            for="storage-global-hourly-deal-size-limit"
                            className="form-label"
                        >
                            {t('cumulativeDealSizeForStorageField.label')}
                        </Label>

                        <i
                            style={{ marginTop: '4px' }}
                            data-for="storageGlobalDealsLimitSizePerHour"
                            data-tip={t(
                                'cumulativeDealSizeForStorageField.tooltip'
                            )}
                            className="ms-4 fas fa-info-circle fa-sm"
                        />

                        <ReactTooltip
                            place="bottom"
                            id="storageGlobalDealsLimitSizePerHour"
                        />

                        <FastField
                            className="form-control"
                            type="number"
                            id="settings"
                            name="dealSize"
                        />

                        {metaDealSize.touched && metaDealSize.error ? (
                            <div style={{ height: 1 + 'rem' }} className="mt-2">
                                <small className="text-danger">
                                    {t(`${metaDealSize.error}`)}
                                </small>
                            </div>
                        ) : null}
                    </FormGroup>
                </Col>
            </Row>

            <Row className="p-2">
                <Col md="6" xs="6">
                    <FormGroup>
                        <Label
                            for="retrieval-global-hourly-deal-limit"
                            className="form-label"
                        >
                            {t('retrievalDealsPerHourField.label')}
                        </Label>

                        <i
                            style={{ marginTop: '4px' }}
                            data-for="retrievalGlobalDealsLimitPerHour"
                            data-tip={t('retrievalDealsPerHourField.tooltip')}
                            className="ms-4 fas fa-info-circle fa-sm"
                        />

                        <ReactTooltip
                            place="bottom"
                            id="retrievalGlobalDealsLimitPerHour"
                        />

                        <FastField
                            className="form-control"
                            type="number"
                            id="settings"
                            name="retrievalDealsPerHour"
                        />

                        {metaRetrievalDeal.touched &&
                        metaRetrievalDeal.error ? (
                            <div style={{ height: 1 + 'rem' }} className="mt-2">
                                <small className="text-danger">
                                    {t(`${metaRetrievalDeal.error}`)}
                                </small>
                            </div>
                        ) : null}
                    </FormGroup>
                </Col>

                <Col md="6" xs="6">
                    <FormGroup>
                        <Label for="custom-message" className="form-label">
                            {t('customMessageField.label')}
                        </Label>

                        <i
                            style={{ marginTop: '4px' }}
                            data-for="customMessageTooltip"
                            data-tip={t('customMessageField.tooltip')}
                            className="ms-4 fas fa-info-circle fa-sm"
                        />

                        <ReactTooltip
                            place="bottom"
                            id="customMessageTooltip"
                        />

                        <FastField
                            className="form-control"
                            name="customMessage"
                            type="text"
                        />

                        {metaUnknownClients.touched &&
                        metaUnknownClients.error ? (
                            <div style={{ height: 1 + 'rem' }} className="mt-2">
                                <small className="text-danger">
                                    {t(`${metaUnknownClients.error}`)}
                                </small>
                            </div>
                        ) : null}
                    </FormGroup>
                </Col>
            </Row>

            <Row className="p-2 mt-4">
                <Col>
                    <div id="unknownClients" className="input-group mb-3">
                        <Switch
                            name={fieldUnknownClients.name}
                            checked={fieldUnknownClients.value}
                            onChange={(value) => setValue(value)}
                        />

                        {metaUnknownClients.touched &&
                        metaUnknownClients.error ? (
                            <div style={{ height: 1 + 'rem' }} className="mt-2">
                                <small className="text-danger">
                                    {t(`${metaUnknownClients.error}`)}
                                </small>
                            </div>
                        ) : null}

                        <div className="input-group-prepend mt-1 ms-4">
                            {t('acceptDealsFromUnkownClientsField.label')}
                            <i
                                style={{ marginTop: '4px' }}
                                data-for="size"
                                data-tip={t(
                                    'acceptDealsFromUnkownClientsField.tooltip'
                                )}
                                className="ms-4 fas fa-info-circle"
                            />
                            <ReactTooltip place="bottom" id="size" />
                        </div>
                    </div>
                </Col>
            </Row>
        </>
    )
}
