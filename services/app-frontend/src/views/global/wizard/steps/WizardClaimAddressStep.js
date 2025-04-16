import React from 'react'
import { ErrorMessage, FastField, Form, Formik } from 'formik'
import { Button, Row, Col } from 'reactstrap'
import { object, string } from 'yup'
import {
    CheckAddressAlreadyClaimed,
    GetAddressActorType,
} from 'shared/services/addresses_claim'
import { useTranslation } from 'react-i18next'

export function WizardClaimAddressStep({
    setAddress,
    address,
    setActorType,
    currentForm,
    setCurrentForm,
}) {
    const { t } = useTranslation('WizardClaimAddressStep') // second param ignored i18n

    return (
        <Formik
            initialValues={{ address: address }}
            validationSchema={object().shape({
                address: string().required(
                    t('validation.isAddressFieldMandatory')
                ),
            })}
            onSubmit={async (values, { setFieldError }) => {
                try {
                    const res = await GetAddressActorType(values.address)
                    if (
                        res.data.actor_type !== 'storageminer' &&
                        res.data.actor_type !== 'account'
                    ) {
                        setFieldError(
                            'address',
                            t('validation.isAddressNotAStorageMinerOrAccount')
                        )
                        return
                    }
                    const resClaimed = await CheckAddressAlreadyClaimed(
                        values.address
                    )
                    if (resClaimed.data) {
                        setFieldError(
                            'address',
                            t('validation.isAddressAlreadyClaimed')
                        )
                        return
                    }

                    // to improve the display, we transform the addresses in t by addresses in f (also done on the backend side)
                    let transformedAddress = values.address

                    if (transformedAddress.startsWith('t')) {
                        transformedAddress = 'f' + transformedAddress.slice(1);
                    }

                    setAddress(transformedAddress)
                    setActorType(res.data.actor_type)
                    setCurrentForm(currentForm + 1)
                } catch (_) {
                    setFieldError('address', t('validation.isAddressInvalid'))
                }
            }}
        >
            <section className="card-form mt-4">
                <Row className="card-form-header mb-4">
                    <Col md="12" xs="12">
                        <div>
                            <h3 className="title is-4 is-styled">
                                {t('title')}
                            </h3>
                            <h5>
                                {t('subtitle')}

                                <ul className="mt-2">
                                    <li>{t('subtitleProvider')}</li>
                                    <li>{t('subtitleClient')}</li>
                                </ul>
                            </h5>
                        </div>
                    </Col>
                </Row>

                <Row className="p-2">
                    <Col md="12" xs="12">
                        <Form>
                            <FastField
                                id="claim_address"
                                name="address"
                                className="form-control"
                                placeholder={t('claimAddressField.placeholder')}
                            />

                            <div style={{ height: 1 + 'rem' }} className="mt-2">
                                <small className="text-danger">
                                    <ErrorMessage name="address" />
                                </small>
                            </div>

                            <div className="text-end ms-2">
                                <Button
                                    className="text-end mt-4 custom-cidg-button"
                                    type="submit"
                                >
                                    {t('button.next')}
                                </Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </section>
        </Formik>
    )
}
