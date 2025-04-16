import { Form, Formik } from 'formik'
import { Button, Row, Col } from 'reactstrap'
import { useTranslation } from 'react-i18next'

import React, { createElement, useCallback } from 'react'
import produce from 'immer'

export function WizardGenericStep({
    steps,
    step,
    isLastStep,
    currentStep,
    setCurrentStep,
    values,
    setValues,
    setStatus,
    onSubmit,
}) {
    const { t } = useTranslation('WizardGenericStep') // second param ignored i18n

    const handleSubmit = useCallback(
        async (sectionValues, actions) => {
            setStatus(undefined)

            let status

            try {
                if (isLastStep) {
                    const newValues = produce(values, (draft) => {
                        draft[step.id] = sectionValues
                    })

                    status = await onSubmit(newValues)
                    setValues(newValues)
                } else {
                    status = step.onSubmit
                        ? await step.onSubmit(sectionValues, values)
                        : undefined

                    setValues((values) => {
                        return produce(values, (draft) => {
                            draft[step.id] = sectionValues
                        })
                    })
                }
            } catch (e) {
                actions.setFieldError(step.id, e.message)
            }

            actions.setSubmitting(false)
            setStatus(status)
            setCurrentStep(
                currentStep === steps.length - 1 ? currentStep : currentStep + 1
            )
        },
        [
            steps,
            step,
            currentStep,
            values,
            setValues,
            setStatus,
            isLastStep,
            onSubmit,
            setCurrentStep,
        ]
    )

    return (
        <Formik
            initialValues={
                values[step.id] ? values[step.id] : step.initialValues
            }
            validationSchema={step.validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {(props) => (
                <section style={{ marginTop: 60 + 'px' }} className="card-form">
                    <Form onSubmit={props.handleSubmit}>
                        <Row className="p-2">
                            <Col md="12" xs="12">
                                {createElement(step.component)}
                            </Col>
                        </Row>

                        <Row className="p-2">
                            <Col>
                                <div className="text-end ms-2">
                                    {currentStep !== 0 && (
                                        <Button
                                            color="secondary"
                                            type="button"
                                            onClick={() => {
                                                setStatus(undefined)
                                                if (step.keepValuesOnPrevious) {
                                                    setValues((values) =>
                                                        produce(
                                                            values,
                                                            (draft) => {
                                                                draft[step.id] =
                                                                    props.values
                                                            }
                                                        )
                                                    )
                                                }
                                                setCurrentStep(
                                                    currentStep
                                                        ? currentStep - 1
                                                        : 0
                                                )
                                            }}
                                        >
                                            {t('button.previous')}
                                        </Button>
                                    )}

                                    <Button
                                        className="ms-2 me-2 custom-cidg-button"
                                        type="submit"
                                    >
                                        {currentStep === steps.length - 1
                                            ? t('button.submit')
                                            : t('button.next')}
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </section>
            )}
        </Formik>
    )
}
