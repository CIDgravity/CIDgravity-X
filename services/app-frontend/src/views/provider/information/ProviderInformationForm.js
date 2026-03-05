import { PureComponent } from 'react'

import * as yup from 'yup'
import Select from 'react-select'

import { Trans, withTranslation } from 'react-i18next'
import { Field, Form, withFormik } from 'formik'
import { withRouter } from 'shared/utils/withRouter'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import FormGroup from 'react-bootstrap/FormGroup'
import FormLabel from 'react-bootstrap/FormLabel'
import Row from 'react-bootstrap/Row'

import {  CountrySelector } from 'shared/components/CountrySelector'

import MDEditor from '@uiw/react-md-editor';

class ProviderInformationForm extends PureComponent {

    render() {
        const { t } = this.props
        const { currentProviderBio, errors, touched, isSubmitting, setFieldValue, values, providerBioChange } = this.props

        const entityTypeOptions = [
            { value: "organization", label: t('entityType.options.organization') },
            { value: "company", label: t('entityType.options.company') },
            { value: "individual", label: t('entityType.options.individual') }
        ]

        return (
            <Form>
                <Row id="clientEntityInformations" className="my-3">

                    {/* Entity informations */}
                    <Col xs="6" md="6">
                        <section className="card-form">
                            <Row className="my-3">
                                <FormGroup>
                                    <FormLabel htmlFor="entity-name" className="form-label">
                                        {t('entityName.label')}
                                    </FormLabel>
                                    <Field
                                        placeholder={t('entityName.placeholder')}
                                        id="entity-name"
                                        className="form-control"
                                        name="entityName"
                                        maxLength="255"
                                    />

                                    {touched.entityName && errors.entityName && (
                                        <small className="text-danger">
                                            {t(`${errors.entityName}`)}
                                        </small>
                                    )}
                                </FormGroup>
                            </Row>

                            <Row className="my-3">
                                <Col xs="6" md="6">
                                    <FormGroup>
                                        <FormLabel htmlFor="entity-type" className="form-label">
                                            {t('entityType.label')}
                                        </FormLabel>

                                        <Select 
                                            name="entityType"
                                            id="entity-type"
                                            onChange={selectedOption => { setFieldValue('entityType', selectedOption.value)}}
                                            defaultValue={entityTypeOptions.find(opt => opt.value === values.entityType)}
                                            options={entityTypeOptions}
                                        />

                                        {touched.entityType && errors.entityType && (
                                            <small className="text-danger">
                                                {t(`${errors.entityType}`)}
                                            </small>
                                        )}
                                    </FormGroup>
                                </Col>

                                <Col xs="6" md="6">
                                    <FormGroup>
                                        <FormLabel htmlFor="entity-country" className="form-label">
                                            {t('entityCountry.label')}
                                        </FormLabel>

                                        <CountrySelector 
                                            defaultValueCountryCode={values.entityCountry}
                                            fieldName="entityCountry"
                                            fieldId="entity-country"
                                            onChange={selectedOption => { setFieldValue('entityCountry', selectedOption.value)}}
                                        />

                                        {touched.entityCountry && errors.entityCountry && (
                                            <small className="text-danger">
                                                {t(`${errors.entityCountry}`)}
                                            </small>
                                        )}
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row className="my-3">
                                <FormGroup>
                                    <FormLabel htmlFor="entity-website" className="form-label">
                                        {t('entityWebsite.label')}
                                    </FormLabel>
                                    <Field
                                        placeholder={t('entityWebsite.placeholder')}
                                        id="entity-website"
                                        className="form-control"
                                        name="entityWebsite"
                                        maxLength="255"
                                    />

                                    {touched.entityWebsite && errors.entityWebsite && (
                                        <small className="text-danger">
                                            {t(`${errors.entityWebsite}`)}
                                        </small>
                                    )}
                                </FormGroup>
                            </Row>
                        </section>
                    </Col>

                    {/* Contact information */}
                    <Col xs="6" md="6">
                        <section className="card-form">
                            <Row className="my-3">
                                <FormGroup>
                                    <FormLabel htmlFor="contact-fullname" className="form-label">
                                        {t('contactFullName.label')}
                                    </FormLabel>
                                    <Field
                                        placeholder={t('contactFullName.placeholder')}
                                        id="contact-fullname"
                                        className="form-control"
                                        name="contactFullName"
                                        maxLength="255"
                                    />

                                    {touched.contactFullName && errors.contactFullName && (
                                        <small className="text-danger">
                                            {t(`${errors.contactFullName}`)}
                                        </small>
                                    )}
                                </FormGroup>
                            </Row>

                            <Row className="my-3">
                                <FormGroup>
                                    <FormLabel htmlFor="contact-email" className="form-label">
                                        {t('contactEmail.label')}
                                    </FormLabel>
                                    <Field
                                        placeholder={t('contactEmail.placeholder')}
                                        id="contact-email"
                                        className="form-control"
                                        name="contactEmail"
                                        maxLength="255"
                                    />

                                    {touched.contactEmail && errors.contactEmail && (
                                        <small className="text-danger">
                                            {t(`${errors.contactEmail}`)}
                                        </small>
                                    )}
                                </FormGroup>
                            </Row>

                            <Row className="my-3">
                                <FormGroup>
                                    <FormLabel htmlFor="contact-slack" className="form-label">
                                        {t('contactSlack.label')}
                                    </FormLabel>
                                    <Field
                                        placeholder={t('contactSlack.placeholder')}
                                        id="contact-slack"
                                        className="form-control"
                                        name="contactSlack"
                                        maxLength="255"
                                    />

                                    {touched.contactSlack && errors.contactSlack && (
                                        <small className="text-danger">
                                            {t(`${errors.contactSlack}`)}
                                        </small>
                                    )}
                                </FormGroup>
                            </Row>
                        </section>
                    </Col>
                </Row>

                <Row>
                    <Col xs="12" md="12">
                        <section className="card-form">
                            <Row className="card-form-header">
                                <div>
                                    <h3 className="title is-4 is-styled">
                                        {t('providerBio.title')}
                                    </h3>

                                    <h5>
                                        <Trans t={t} i18nKey="providerBio.subtitle" />
                                    </h5>
                                </div>
                            </Row>

                            <Row className="mt-4 p-2">
                                <Col xs="12" md="12">
                                    <div data-color-mode="light">
                                        <MDEditor
                                            height={300}
                                            value={currentProviderBio}
                                            onChange={(val) => providerBioChange({ text: val || '' })}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </section>
                    </Col>
                </Row>

                <Row className="mt-3 mb-3">
                    <Col className="text-end">
                        <Button id="updateInfos" className="custom-cidg-button" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>{t('button.loading')}</>
                            ) : (
                                <>{t('button.update')}</>
                            )}
                        </Button>
                    </Col>
                </Row>
            </Form>
        )
    }
}

const formikConfig = {
    displayName: 'UpdateClientInformations',

    mapPropsToValues: ({ currentAddress }) => ({
        entityName: currentAddress?.information?.entityName || '',
        entityType: currentAddress?.information?.entityType || '',
        entityCountry: currentAddress?.information?.entityCountry || '',
        entityWebsite: currentAddress?.information?.entityWebsite || '',
        contactFullName: currentAddress?.information?.contactFullName || '',
        contactEmail: currentAddress?.information?.contactEmail || '',
        contactSlack: currentAddress?.information?.contactSlack || ''
    }),

    validationSchema: () =>
        yup.object().shape({
            entityName: yup
                .string()
                .max(255)
                .typeError('validation.isEntityNameValidString')
                .required('validation.isEntityNameMandatory'),
            entityType: yup
                .string()
                .max(255)
                .typeError('validation.isEntityTypeValidString')
                .required('validation.isEntityTypeMandatory'),
            entityCountry: yup
                .string()
                .max(255)
                .typeError('validation.isEntityCountryValidString')
                .required('validation.isEntityCountryMandatory'),
            entityWebsite: yup
                .string()
                .max(255)
                .matches(
                    /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
                    'validation.isEntityWebsiteValidUrl'
                )
                .required('validation.isEntityWebsiteMandatory'),
            contactFullName: yup
                .string()
                .max(255)
                .typeError('validation.isContactFullNameValidString')
                .required('validation.isContactFullNameMandatory'),
            contactEmail: yup
                .string()
                .max(255)
                .email('validation.isContactEmailValid')
                .required('validation.isContactEmailMandatory'),
            contactSlack: yup
                .string()
                .max(255)
                .typeError('validation.isContactSlackValidString')
                .required('validation.isContactSlackMandatory')
        }),

    handleSubmit: (values, { props, setSubmitting }) => {
        props
            .onSubmit(values)
            .then(() => {
                setSubmitting(false)
            })
            .catch((e) => {
                setSubmitting(false)
            })
    },
}

export default withRouter(
    withTranslation('ProviderInformationForm')(
        withFormik(formikConfig)(ProviderInformationForm)
    )
)
