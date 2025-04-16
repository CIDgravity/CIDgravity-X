import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { PureComponent } from 'react'
import { Field, Form, withFormik } from 'formik'
import { Trans, withTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { toast } from 'react-toastify'
import { Alert, Button, Col, Container, FormGroup, Label, Row } from 'reactstrap'

import * as yup from 'yup'

class CreateOnboardingPolicyGroupForm extends PureComponent {
    render() {
        const { 
            errors, touched, isSubmitting, isNew, isInitOrMixGroup, t, 
            onProviderInputChange, onRemoveProvider, selectedProvidersList, onAddProvider 
        } = this.props

        return (
            <Container>
                <Form>
                    <section className="card-form">
                        <Row className="card-form-header">
                            <div>
                                <h3 className="title is-4 is-styled">
                                    {t('general.title')}
                                </h3>
                                <h5>{t('general.subtitle')}</h5>
                            </div>
                        </Row>

                        <Row className="my-4">
                            <Col xs="9" md="9" style={{marginTop: 20 + 'px'}}>
                                <FormGroup>
                                    <Label for="onboarding-policy-group-name" className="form-label">
                                        {t('general.name.label')}
                                    </Label>

                                    <Field
                                        id="onboarding-policy-group-name"
                                        className="form-control"
                                        name="name"
                                        maxLength="255"
                                        disabled={isInitOrMixGroup}
                                    />

                                    {touched.name && errors.name && (
                                        <small className="text-danger">
                                            {t(`${errors.name}`)}
                                        </small>
                                    )}
                                </FormGroup>
                            </Col>

                            <Col xs="3" md="3" style={{marginTop: 20 + 'px'}}>
                                <FormGroup>
                                    <Label for="onboarding-policy-group-number-of-copies" className="form-label">
                                        {t('general.numberOfCopies.label')}
                                    </Label>

                                    <Field
                                        type="number"
                                        min="0"
                                        id="onboarding-policy-group-number-of-copies"
                                        className="form-control"
                                        name="numberOfCopies"
                                        maxLength="255"
                                    />

                                    {touched.numberOfCopies && errors.numberOfCopies && (
                                        <small className="text-danger">
                                            {t(`${errors.numberOfCopies}`)}
                                        </small>
                                    )}
                                </FormGroup>
                            </Col>
                        </Row>
                    </section>

                    {!isInitOrMixGroup && (
                        <section className="card-form">
                            <Row className="card-form-header mb-4">
                                <Col xs="12" md="12">
                                    <h3 className="title is-4 is-styled">
                                        {t('providers.title')}
                                    </h3>
                                    <h5>
                                        <Trans t={t} i18nKey="providers.subtitle" />
                                    </h5>
                                </Col>
                            </Row>

                            <ul className="rules mt-4">
                                {selectedProvidersList.length <= 0 ? (
                                    <Alert color="info" className="d-flex align-items-center">
                                        <div className="ms-4">
                                            <Trans t={t} i18nKey="providers.howToAddFirstProvider" />
                                        </div>
                                    </Alert>

                                ) : (
                                    <>
                                        {selectedProvidersList.map((provider, i) => {
                                            return (
                                                <li>
                                                    <div id={'providerCard-' + i} className="card p-4 mb-4">
                                                        <Row className="ms-auto">
                                                            {selectedProvidersList.length !== 1 && (
                                                                <span id={'deleteProvider-' + i} className="remove-rule-btn" onClick={() => onRemoveProvider(i)}>
                                                                    <i className="fas fa-trash-alt" />
                                                                </span>
                                                            )}
                                                        </Row>

                                                        <Row>
                                                            <Col xs="4" md="4">
                                                                <Label for="provider-addressId" className="form-label">
                                                                    {t('providers.field.address.label')} *
                                                                </Label>

                                                                <div class="input-group mb-3">
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        name="addressId"
                                                                        placeholder={t('providers.field.address.placeholder')}
                                                                        value={provider.addressId}
                                                                        onChange={(e) => onProviderInputChange(e, i)}
                                                                        maxLength="30"
                                                                    />
                                                                </div>
                                                            </Col>

                                                            <Col xs="8" md="8">
                                                                <Label for="provider-comment" className="form-label">
                                                                    {t('providers.field.comment.label')}
                                                                </Label>

                                                                <div class="input-group mb-3">
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        name="comment"
                                                                        placeholder={t('providers.field.comment.placeholder')}
                                                                        value={provider.comment}
                                                                        onChange={(e) => onProviderInputChange(e, i)}
                                                                        maxLength="255"
                                                                    />
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                </li>
                                            )     
                                        })}
                                    </>
                                )}
                            </ul>
                        </section>
                    )}

                    <Row className="mt-3 mb-4">
                        <Col className="text-end">
                            {!isInitOrMixGroup && (
                                <Button id="addNewProvider" className="me-4 mb-4" color="primary" onClick={onAddProvider}>
                                    {t('button.addNewProvider')}
                                </Button>
                            )}
                            
                            <Button id="createModel" type="submit" className="mb-4 custom-cidg-button" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <FontAwesomeIcon spin icon={faSpinner} size="2xs" />
                                ) : isNew && !isInitOrMixGroup ? (
                                    <>{t('button.create')}</>
                                ) : isInitOrMixGroup ? (
                                    <>{t('button.configure')}</>
                                ) : (
                                    <>{t('button.update')}</>
                                )}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Container>
        )
    }
}

const formikConfig = {
    displayName: 'CreateOnboardingPolicyGroupForm',

    mapPropsToValues: ({ policyGroup, isInitOrMixGroup, policySettings, mixGroupNameTranslated }) => ({
        name: isInitOrMixGroup ? mixGroupNameTranslated : policyGroup.name ? policyGroup.name : '',
        numberOfCopies: isInitOrMixGroup && policySettings ? policySettings.mixNumberOfCopies : 
            policyGroup.numberOfCopies !== null ? policyGroup.numberOfCopies : ''
    }),

    validationSchema: () =>
        yup.object().shape({
            name: yup
                .string()
                .typeError('validation.name.typeError')
                .required('validation.name.required')
                .min(3, 'validation.name.lengthTooShort')
                .max(255)
                .matches(/^[A-Za-z0-9_ ]+$/, 'validation.name.matches'),
            numberOfCopies: yup
                .number()
                .typeError('validation.numberOfCopies.typeError')
                .min(0, 'validation.numberOfCopies.isUnderMinimunValue')
                .required('validation.numberOfCopies.required')
        }),

    handleSubmit: (values, { props, setSubmitting }) => {
        const { t } = props
        props
            .onSubmit(values)
            .then((returnValue) => {
                const { status, message } = returnValue
                if (status) {
                    const { history } = props
                    history.goBack()
                    setSubmitting(false)

                    if (props.isInitOrMixGroup) {
                        toast.success(t('notification.success.onSaveMixPolicyGroup'))
                    } else if (props.isNew) {
                        toast.success(t('notification.success.onCreatePolicyGroup'))
                    } else {
                        toast.success(t('notification.success.onUpdatePolicyGroup'))
                    }
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
    withTranslation('CreateOnboardingPolicyGroupForm')(
        withFormik(formikConfig)(CreateOnboardingPolicyGroupForm)
    )
)
