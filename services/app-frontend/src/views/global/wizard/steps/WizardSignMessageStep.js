import React, { useEffect, useState } from 'react'
import {
    CheckChallenge,
    GetChallengeAndWorkerKey,
} from 'shared/services/addresses_claim'
import { CustomCodeHighlight } from 'shared/components/CustomCodeHighlight'
import { ErrorMessage, FastField, Form, Formik } from 'formik'
import { Button, Label, Row, Col, Alert } from 'reactstrap'
import { Loader } from 'shared/components'
import { object, string } from 'yup'
import { useTranslation } from 'react-i18next'

export function WizardSignMessageStep({
    address,
    setAddress,
    hexMessage,
    setHexMessage,
    setSignedMessage,
    currentForm,
    setCurrentForm,
    setClaimedInfo,
    err,
    setErr,
}) {
    const { t } = useTranslation('WizardSignMessageStep') // second param ignored i18n
    const [workerKey, setWorkerKey] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        GetChallengeAndWorkerKey(address)
            .then((res) => {
                if (res.status === 200) {
                    setWorkerKey(res.data.workerKey)
                    setHexMessage(res.data.hexMsg)
                    setError(null)
                    setLoading(false)
                }
            })
            .catch((err) => {
                setWorkerKey(null)
                setHexMessage(null)
                setError(err)
                setLoading(false)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Formik
            initialValues={{ message: '' }}
            validationSchema={object().shape({
                message: string().required(
                    t('validation.isSignedMessageMandatory')
                ),
            })}
            onSubmit={async (values, { setFieldError }) => {
                try {
                    const res = await CheckChallenge({
                        address: address,
                        signedMessage: values.message,
                    })
        
                    if (res.data.token) {
                        setClaimedInfo(res.data)
                    } else {
                        setCurrentForm(currentForm + 1)
                    }
                    setSignedMessage(values.message)
                } catch (_) {
                    setFieldError('message', t('validation.isSignatureInvalidOrChallengeExpired'))
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
                            <h5>{t('subtitle')}</h5>
                        </div>
                    </Col>
                </Row>

                <Row className="p-0 me-0">
                    <Col md="12" xs="12">
                        <Form>
                            {loading ? (
                                <Loader />
                            ) : error ? (
                                <Alert color="danger">
                                    {t('error.isUnableToGenerateChallenge')}
                                </Alert>
                            ) : (
                                <>
                                    <Row className="p-2 ms-0">
                                        <Label>
                                            {t('runThisCommandStep.label')}
                                        </Label>

                                        <div>
                                            <CustomCodeHighlight
                                                text={t(
                                                    'runThisCommandStep.codeHighlight.content',
                                                    {
                                                        workerKey: workerKey,
                                                        hexMessage: hexMessage,
                                                    }
                                                )}
                                            />
                                        </div>
                                    </Row>

                                    <Row className="p-2 mt-4 ms-0">
                                        <Label>
                                            {t('putSignedMessageStep.label')}
                                        </Label>

                                        <FastField
                                            className="form-control"
                                            id="signing_message"
                                            name="message"
                                        />

                                        <div
                                            style={{ height: 1 + 'rem' }}
                                            className="mt-2"
                                        >
                                            <small className="text-danger">
                                                <ErrorMessage name="message" />
                                            </small>
                                        </div>

                                        {err && (
                                            <small className="text-danger">
                                                <p>
                                                    {t(
                                                        'error.isUnableToCheckSignature'
                                                    )}
                                                </p>
                                            </small>
                                        )}
                                    </Row>
                                </>
                            )}

                            <div className="text-end ms-2">
                                {/* necessary or click on 'Enter' will activate Previous, not Next */}
                                <div className="d-flex flex-row-reverse">
                                    {!loading && !error && (
                                        <Button
                                            className="text-end mt-4 ms-2 custom-cidg-button"
                                            type="submit"
                                        >
                                            {t('button.next')}
                                        </Button>
                                    )}
                                    <Button
                                        className="text-end mt-4 custom-cidg-button"
                                        type="submit"
                                        onClick={() => {
                                            setErr(null)
                                            setClaimedInfo(null)
                                            setAddress(null)
                                            setCurrentForm(currentForm - 1)
                                        }}
                                    >
                                        {t('button.previous')}
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </section>
        </Formik>
    )
}
