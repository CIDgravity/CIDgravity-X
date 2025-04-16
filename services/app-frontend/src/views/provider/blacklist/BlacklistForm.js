import { PureComponent } from 'react'

import * as yup from 'yup'

import { toast } from 'react-toastify'

import { Field, Form, withFormik } from 'formik'
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { Button, Col, FormGroup, Label, Row } from 'reactstrap'

class BlacklistForm extends PureComponent {
    render() {
        const { t, errors, touched, isSubmitting } = this.props

        return (
            <Form>
                <section className="card-form">
                    <Row className="my-3">
                        <Col xs="12" md="12">
                            <FormGroup>
                                <Label for="address" className="form-label">
                                    {t('addressToBlacklist.label')}
                                </Label>
                                <Field
                                    id="address"
                                    className="form-control"
                                    name="address"
                                    maxLength="255"
                                    disabled={isSubmitting}
                                />

                                {touched.address && errors.address && (
                                    <small className="text-danger">
                                        {t(`${errors.address}`)}
                                    </small>
                                )}
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs="12" md="12">
                            <Label for="input-comment" className="form-label">
                                {t('comment.label')}
                            </Label>

                            <Field
                                id="input-comment"
                                className="form-control"
                                name="comment"
                                maxLength="255"
                                disabled={isSubmitting}
                            />

                            {touched.comment && errors.comment && (
                                <small className="text-danger">
                                    {t(`${errors.comment}`)}
                                </small>
                            )}
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col className="text-end">
                            <Button
                                className="custom-cidg-button"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>{t('button.loading')}</>
                                ) : (
                                    <>{t('button.addToBlacklist')}</>
                                )}
                            </Button>
                        </Col>
                    </Row>
                </section>
            </Form>
        )
    }
}

const formikConfig = {
    displayName: 'BlacklistNewAddress',

    mapPropsToValues: () => ({
        address: '',
        comment: '',
    }),

    validationSchema: () =>
        yup.object().shape({
            address: yup
                .string()
                .typeError('validation.addressFieldMustBeAString')
                .required('validation.addressFieldIsMandatory'),
            comment: yup
                .string()
                .typeError('validation.commentFieldMustBeAString'),
        }),

    handleSubmit: (values, { props, setSubmitting, resetForm }) => {
        props
            .onSubmit(values)
            .then((returnValue) => {
                const { status, message } = returnValue

                if (status) {
                    setSubmitting(false)
                    toast.success(message)
                    resetForm({})
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
    withFormik(formikConfig)(withTranslation('BlacklistForm')(BlacklistForm))
)
