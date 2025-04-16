import React, { useEffect, useState } from 'react'
import { Label, Row, Col } from 'reactstrap'
import { Field, useField, useFormikContext } from 'formik'
import { boolean, object, string } from 'yup'
import { useTranslation } from 'react-i18next'
import { loadAddressesFromJwt } from 'shared/utils/addresses'
import { useAuth0 } from '@auth0/auth0-react'

import Select from 'react-select'

export const WizardImportDataStep = (stepTitle) => ({
    id: 'clients_pricing',
    label: stepTitle,
    initialValues: {
        import: 'false',
        pricingModel: '',
    },
    validationSchema: object().shape({
        import: boolean().required(),
        pricingModel: string().when('import', {
            is: 'true',
            then: string().required('validation.isAddressSelectionMandatory'),
        }),
    }),
    keepValuesOnPrevious: true,
    component: Form,
})

export function Form() {
    const { t } = useTranslation('WizardImportDataStep') // second param ignored i18n
    const [options, setOptions] = useState([])
    const { getAccessTokenSilently } = useAuth0()

    // eslint-disable-next-line no-unused-vars
    const [field, meta, helpers] = useField('pricingModel')
    const { values } = useFormikContext()
    const { setValue } = helpers

    useEffect(() => {
        getAccessTokenSilently().then((JWTToken) => {
            loadAddressesFromJwt(JWTToken, false, true).then((res) => {
                const [, providerAddresses] = res

                // eslint-disable-next-line array-callback-return
                setOptions(
                    providerAddresses.map((item) => ({
                        value: item.addressId,
                        label: item.friendlyName
                            ? item.friendlyName + ' - ' + item.addressId
                            : item.addressId,
                    }))
                )
            })
            .catch((_) => {})
        }).catch((_) => {})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <Row className="card-form-header mb-4">
                <Col md="12" xs="12">
                    <h3 className="title is-4 is-styled">{t('title')}</h3>
                    <h5>{t('subtitle')}</h5>
                </Col>
            </Row>

            <Row className="p-0 ms-0 mt-4 pt-4">
                <Label for="do-you-want-to-import" className="form-label">
                    {t('doYouWantToImportRadio.label')}
                </Label>
            </Row>

            <Row className="p-0 ms-0 mt-2">
                <Col>
                    <Label>
                        <Field
                            type="radio"
                            id="clients_pricing"
                            name="import"
                            value={'false'}
                        />
                        &nbsp;{t('doYouWantToImportRadio.noOption')}
                    </Label>
                </Col>
            </Row>

            <Row className="p-0 ms-0 mt-2">
                <Col>
                    <Label>
                        <Field
                            type="radio"
                            id="clients_pricing"
                            name="import"
                            value={'true'}
                        />
                        &nbsp;{t('doYouWantToImportRadio.yesOption')}
                    </Label>
                </Col>
            </Row>

            {values.import === 'true' && (
                <Row className="mt-4 mb-4">
                    <Col>
                        <Select
                            options={options}
                            name={field.name}
                            onChange={(option) => setValue(option.value)}
                            placeholder={t('addressSelect.placeholder')}
                            value={field.value ? options.find((item) => item.value === field.value) : {}}
                        />

                        {meta.touched && meta.error ? (
                            <div style={{ height: 1 + 'rem' }} className="mt-2">
                                <small className="text-danger">
                                    {t(`${meta.error}`)}
                                </small>
                            </div>
                        ) : null}
                    </Col>
                </Row>
            )}
        </>
    )
}
