import { PureComponent } from 'react'
import { Field, Form, withFormik } from 'formik'
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { toast } from 'react-toastify'
import { Col, FormGroup, Label, Row } from 'reactstrap'

import CustomButtonPremium from 'shared/components/CustomButtonPremium'

import * as yup from 'yup'

class ClientBlacklistForm extends PureComponent {
    render() {
        const { errors, touched, isSubmitting, t, isPremium } = this.props

        return (
            <Form>
                <Row className="mt-4">
                    <Col xs="12" md="12">
                        <div className="card p-4">
                            <Row>
                                <h5 className="mb-4">{t('title')}</h5>

                                <Col xs="3" md="3" style={{marginTop: 20 + 'px'}}>
                                    <FormGroup>
                                        <Label for="blacklist-address" className="form-label">
                                            {t('field.addressId.label')}
                                        </Label>

                                        <Field
                                            type="text"
                                            id="blacklist-address"
                                            className="form-control"
                                            name="addressId"
                                            maxLength="30"
                                        />

                                        {touched.addressId && errors.addressId && (
                                            <small className="text-danger">
                                                {t(`${errors.addressId}`)}
                                            </small>
                                        )}
                                    </FormGroup>
                                </Col>

                                <Col xs="5" md="5" style={{marginTop: 20 + 'px'}}>
                                    <FormGroup>
                                        <Label for="blacklist-comment" className="form-label">
                                            {t('field.comment.label')}
                                        </Label>

                                        <Field
                                            type="string"
                                            id="blacklist-comment"
                                            className="form-control"
                                            name="comment"
                                            maxLength="255"
                                        />

                                        {touched.comment && errors.comment && (
                                            <small className="text-danger">
                                                {t(`${errors.comment}`)}
                                            </small>
                                        )}
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col className="text-end">
                                    <CustomButtonPremium
                                        btnId="addAddressToBlacklist"
                                        btnClassName="mb-4 custom-cidg-button"
                                        btnText={t('button.create')}
                                        disabled={isSubmitting}
                                        isSubmitting={isSubmitting}
                                        isPremium={isPremium}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </Form>
        )
    }
}

const formikConfig = {
    displayName: 'ClientBlacklistForm',

    mapPropsToValues: () => ({
        addressId: '',
        comment: ''
    }),

    validationSchema: () =>
        yup.object().shape({
            addressId: yup
                .string()
                .max(30)
                .typeError('validation.address.typeError')
                .required('validation.address.required'),
            comment: yup
                .string()
                .max(255)
                .typeError('validation.comment.typeError')
        }),

    handleSubmit: (values, { props, resetForm, setSubmitting }) => {
        const { t } = props
        props
            .onSubmit(values)
            .then((returnValue) => {
                const { status, message } = returnValue
                if (status) {
                    setSubmitting(false)
                    resetForm();
                    toast.success(t('notification.success.onInsertAddressToBlacklist'))
                } else {
                    setSubmitting(false)
                    toast.error(message)
                }
            })
            .catch((e) => {
                toast.error(t('notification.error.generic'))
                console.log(e)
                setSubmitting(false)
            })
    },
}

export default withRouter(
    withTranslation('ClientBlacklistForm')(
        withFormik(formikConfig)(ClientBlacklistForm)
    )
)
