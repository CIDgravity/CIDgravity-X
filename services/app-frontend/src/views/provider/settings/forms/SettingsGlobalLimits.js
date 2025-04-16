import React, { PureComponent } from 'react'

import { Row, Col, FormGroup, Label, Button } from 'reactstrap'

import { Field, Form, withFormik } from 'formik'
import { toReadableSize } from 'shared/utils/file_size'
import 'react-tabs/style/react-tabs.css'
import ReactTooltip from 'react-tooltip'
import { withTranslation } from 'react-i18next'
import * as yup from 'yup'
import { toast } from 'react-toastify'
import { withRouter } from 'react-router'

class SettingsGlobalLimits extends PureComponent {
    render() {
        const { errors, touched, isSubmitting, t } = this.props

        return (
            <Form enableReinitialize>
                <Row>
                    <h5 className="mb-4">{t('client.rateLimit.title')}</h5>

                    <Col xs="4" md="4">
                        <FormGroup>
                            <Label
                                for="storage-global-hourly-deal-limit"
                                className="form-label"
                            >
                                {t('client.rateLimit.storageDealPerHour.label')}
                            </Label>{' '}
                            *
                            <i
                                style={{
                                    marginTop: '4px',
                                }}
                                data-for="storageGlobalDealsLimitPerHour"
                                data-tip={t(
                                    'client.rateLimit.storageDealPerHour.info'
                                )}
                                className="ms-4 fas fa-info-circle fa-sm"
                            />
                            <ReactTooltip
                                place="bottom"
                                id="storageGlobalDealsLimitPerHour"
                            />
                            <Field
                                id="storage-global-hourly-deal-limit"
                                className="form-control"
                                name="storageGlobalHourlyDealLimit"
                            />
                            {touched.storageGlobalHourlyDealLimit &&
                                errors.storageGlobalHourlyDealLimit && (
                                    <small className="text-danger">
                                        {t(
                                            `${errors.storageGlobalHourlyDealLimit}`
                                        )}
                                    </small>
                                )}
                        </FormGroup>
                    </Col>

                    <Col xs="4" md="4">
                        <FormGroup>
                            <Label
                                for="storage-global-hourly-deal-size-limit"
                                className="form-label"
                            >
                                {t('client.rateLimit.cumulativeDealSize.label')}
                            </Label>{' '}
                            *
                            <i
                                style={{
                                    marginTop: '4px',
                                }}
                                data-for="storageGlobalDealsLimitSizePerHour"
                                data-tip={t(
                                    'client.rateLimit.cumulativeDealSize.info'
                                )}
                                className="ms-4 fas fa-info-circle fa-sm"
                            />
                            <ReactTooltip
                                place="bottom"
                                id="storageGlobalDealsLimitSizePerHour"
                            />
                            <Field
                                id="storage-global-hourly-deal-size-limit"
                                className="form-control"
                                name="storageGlobalHourlyDealSizeLimit"
                            />
                            {touched.storageGlobalHourlyDealSizeLimit &&
                                errors.storageGlobalHourlyDealSizeLimit && (
                                    <small className="text-danger">
                                        {t(
                                            `${errors.storageGlobalHourlyDealSizeLimit}`
                                        )}
                                    </small>
                                )}
                        </FormGroup>
                    </Col>

                    <Col xs="4" md="4">
                        <FormGroup>
                            <Label
                                for="retrieval-global-hourly-deal-limit"
                                className="form-label"
                            >
                                {t(
                                    'client.rateLimit.retrievalDealPerHour.label'
                                )}
                            </Label>{' '}
                            *
                            <i
                                style={{
                                    marginTop: '4px',
                                }}
                                data-for="retrievalGlobalDealsLimitPerHour"
                                data-tip={t(
                                    'client.rateLimit.retrievalDealPerHour.info'
                                )}
                                className="ms-4 fas fa-info-circle fa-sm"
                            />
                            <ReactTooltip
                                place="bottom"
                                id="retrievalGlobalDealsLimitPerHour"
                            />
                            <Field
                                id="retrieval-global-hourly-deal-limit"
                                className="form-control"
                                name="retrievalGlobalHourlyDealLimit"
                            />
                            {touched.retrievalGlobalHourlyDealLimit &&
                                errors.retrievalGlobalHourlyDealLimit && (
                                    <small className="text-danger">
                                        {t(
                                            `${errors.retrievalGlobalHourlyDealLimit}`
                                        )}
                                    </small>
                                )}
                        </FormGroup>
                    </Col>
                </Row>

                <Row className="mt-2">
                    <Col className="text-start">
                        <i>{t('zeroMeanNoLimits')}</i>
                    </Col>

                    <Col className="text-end">
                        <Button
                            disabled={
                                Array.isArray(errors) ||
                                Object.values(errors).toString() !== '' ||
                                isSubmitting
                            }
                            type="submit"
                            className="custom-cidg-button"
                        >
                            {t('client.rateLimit.button.save')}
                        </Button>
                    </Col>
                </Row>
            </Form>
        )
    }
}

const formikConfig = {
    displayName: 'SettingsGlobalLimits',

    mapPropsToValues: ({ currentAddress }) => ({
        retrievalGlobalHourlyDealLimit:
            currentAddress.settings.retrievalGlobalHourlyDealLimit,
        storageGlobalHourlyDealLimit:
            currentAddress.settings.storageGlobalHourlyDealLimit,
        storageGlobalHourlyDealSizeLimit: toReadableSize(
            'B',
            'GiB',
            currentAddress.settings.storageGlobalHourlyDealSizeLimit
        ),
    }),

    validationSchema: () =>
        yup.object().shape({
            retrievalGlobalHourlyDealLimit: yup
                .number()
                .typeError('validation.isInvalidValue')
                .min(0, 'validation.isNotPositiveValue')
                .required('validation.isRequiredValue'),
            storageGlobalHourlyDealLimit: yup
                .number()
                .typeError('validation.isInvalidValue')
                .min(0, 'validation.isNotPositiveValue')
                .required('validation.isRequiredValue'),
            storageGlobalHourlyDealSizeLimit: yup
                .number()
                .typeError('validation.isInvalidValue')
                .min(0, 'validation.isNotPositiveValue')
                .required('validation.isRequiredValue'),
        }),

    handleSubmit: (values, { props, setSubmitting }) => {
        props
            .onSubmit(values)
            .then((returnValue) => {
                const { status, message } = returnValue

                if (status) {
                    setSubmitting(false)
                } else {
                    setSubmitting(false)
                    toast.error(message)
                }
            })
            .catch((e) => {
                console.log(e)
                setSubmitting(false)
                toast.error(e)
            })
    },
}

export default withRouter(
    withFormik(formikConfig)(
        withTranslation('SettingsGlobalLimits')(SettingsGlobalLimits)
    )
)
