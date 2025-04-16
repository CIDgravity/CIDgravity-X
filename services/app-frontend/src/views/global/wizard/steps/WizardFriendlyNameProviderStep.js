import React, { useEffect } from 'react'
import { Row, Col } from 'reactstrap'
import { FastField, useField } from 'formik'
import { object, string } from 'yup'
import { useAuth0 } from '@auth0/auth0-react'

import { useTranslation } from 'react-i18next'

export const WizardFriendlyNameProviderStep = (stepTitle) => ({
    id: 'friendly_name',
    label: stepTitle,
    initialValues: {
        name: '',
    },
    validationSchema: object().shape({
        name: string().required('validation.isFriendlyNameMandatory'),
    }),
    keepValuesOnPrevious: true,
    component: FriendlyName,
})

export function FriendlyName() {
    // eslint-disable-next-line no-unused-vars
    const [field, meta, helpers] = useField('name')
    const { setValue } = helpers
    const { user } = useAuth0()
    const { t } = useTranslation('WizardFriendlyNameProviderStep') // second param ignored i18n

    useEffect(() => {
        setValue(
            t('defaultFriendlyName', {
                userNickname: user.nickname,
            })
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onClickInput = (e) => {
        e.target.select()
    }

    return (
        <>
            <Row className="card-form-header mb-4">
                <Col md="12" xs="12">
                    <h3 className="title is-4 is-styled">{t('title')}</h3>
                    <h5>{t('subtitle')}</h5>
                </Col>
            </Row>

            <Row className="p-2">
                <Col>
                    <FastField
                        className="form-control"
                        id="friendly_name_provider"
                        name="name"
                        autoFocus
                        onFocus={(e) => onClickInput(e)}
                    />

                    {meta.touched && meta.error ? (
                        <div style={{ height: 1 + 'rem' }} className="mt-2">
                            <small className="text-danger">
                                <div className="error">
                                    {t(`${meta.error}`)}
                                </div>
                            </small>
                        </div>
                    ) : null}
                </Col>
            </Row>
        </>
    )
}
