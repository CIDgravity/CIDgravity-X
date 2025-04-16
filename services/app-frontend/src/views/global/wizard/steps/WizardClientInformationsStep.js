import { FastField, useField } from 'formik'
import { useTranslation } from 'react-i18next'
import { Col, FormGroup, Label, Row, Alert } from 'reactstrap'
import { object, string } from 'yup'

import Select from 'react-select'
import {  CountrySelector } from 'shared/components/CountrySelector'

export const WizardClientInformationsStep = (stepTitle) => ({
    id: 'client_informations',
    label: stepTitle,
    initialValues: {
        entityName: '',
        entityType: '',
        entityCountry: '',
        entityWebsite: '',
        contactFullName: '',
        contactEmail: '',
        contactSlack: '',
        datacapRequestLink: ''
    },
    validationSchema: object().shape({
        entityName: string()
            .typeError('validation.isEntityNameValidString')
            .required('validation.isEntityNameMandatory'),
        entityType: string()
            .typeError('validation.isEntityTypeValidString')
            .required('validation.isEntityTypeMandatory'),
        entityCountry: string()
            .typeError('validation.isEntityCountryValidString')
            .required('validation.isEntityCountryMandatory'),
        entityWebsite: string()
            .matches(
                /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
                'validation.isEntityWebsiteValidUrl'
            )
            .required('validation.isEntityWebsiteMandatory'),
        contactFullName: string()
            .typeError('validation.isContactFullNameValidString')
            .required('validation.isContactFullNameMandatory'),
        contactEmail: string()
            .email('validation.isContactEmailValid')
            .required('validation.isContactEmailMandatory'),
        contactSlack: string()
            .typeError('validation.isContactSlackValidString')
            .required('validation.isContactSlackMandatory'),
        datacapRequestLink: string()
    }),
    keepValuesOnPrevious: true,
    component: Form,
})

export function Form() {

    // eslint-disable-next-line no-unused-vars
    const [fieldEntityName, metaEntityName, helpersEntityName] = useField('entityName')

    // eslint-disable-next-line no-unused-vars
    const [fieldEntityType, metaEntityType, helpersEntityType] = useField('entityType')

    // eslint-disable-next-line no-unused-vars
    const [fieldEntityCountry, metaEntityCountry, helpersEntityCountry] = useField('entityCountry')

    // eslint-disable-next-line no-unused-vars
    const [fieldEntityWebsite, metaEntityWebsite, helpersEntityWebsite] = useField('entityWebsite')

    // eslint-disable-next-line no-unused-vars
    const [fieldContactFullName, metaContactFullName, helpersContactFullName] = useField('contactFullName')

    // eslint-disable-next-line no-unused-vars
    const [fieldContactEmail, metaContactEmail, helpersContactEmail] = useField('contactEmail')

    // eslint-disable-next-line no-unused-vars
    const [fieldContactSlack, metaContactSlack, helpersContactSlack] = useField('contactSlack')

    // eslint-disable-next-line no-unused-vars
    const [fieldDatacapRequestLink, metaDatacapRequestLink, helpersDatacapRequestLink] = useField('datacapRequestLink')

    // eslint-disable-next-line no-unused-vars
    const { t } = useTranslation('WizardClientInformationsStep')

    return (
        <>
            <Row className="card-form-header mb-4">
                <Col md="12" xs="12">
                    <h3 className="title is-4 is-styled">{t('title')}</h3>
                    <h5>{t('subtitle')}</h5>

                    <Alert color="warning" className="mt-4">
                        <strong>
                            <i class="fas fa-exclamation-triangle" />{' '}
                            {t('beCareful')}
                        </strong>{' '}

                        {t('subtitleKYC')}
                    </Alert>
                </Col>
            </Row>

            <Row className="p-2 mb-4">
                <Col md="6" xs="6">
                    <Row>
                        <FormGroup>
                            <Label for="entity-name" className="form-label">
                                {t('entityNameField.label')}
                            </Label>

                            <FastField className="form-control" type="text" id={WizardClientInformationsStep.id} name="entityName" />

                            {metaEntityName.touched && metaEntityName.error ? (
                                <div style={{ height: 1 + 'rem' }} className="mt-2">
                                    <small className="text-danger">
                                        {t(`${metaEntityName.error}`)}
                                    </small>
                                </div>
                            ) : null}
                        </FormGroup>
                    </Row>

                    <Row>
                        <FormGroup>
                            <Label for="entity-type" className="form-label">
                                {t('entityTypeField.label')}
                            </Label>

                            <Select 
                                name="entityType"
                                id={WizardClientInformationsStep.id}
                                onChange={selectedOption => { helpersEntityType.setValue(selectedOption.value)}}
                                options={[
                                    { value: "organization", label: t('entityTypeField.options.organization') },
                                    { value: "company", label: t('entityTypeField.options.company') },
                                    { value: "individual", label: t('entityTypeField.options.individual') }
                                ]}
                            />

                            {metaEntityType.touched && metaEntityType.error ? (
                                <div style={{ height: 1 + 'rem' }} className="mt-2">
                                    <small className="text-danger">
                                        {t(`${metaEntityType.error}`)}
                                    </small>
                                </div>
                            ) : null}
                        </FormGroup>
                    </Row>

                    <Row>
                        <FormGroup>
                            <Label for="entity-country" className="form-label">
                                {t('entityCountryField.label')}
                            </Label>

                            <CountrySelector 
                                fieldName="entityCountry"
                                fieldId={WizardClientInformationsStep.id}
                                onChange={selectedOption => { helpersEntityCountry.setValue(selectedOption.value)}}
                            />

                            {metaEntityCountry.touched && metaEntityCountry.error ? (
                                <div style={{ height: 1 + 'rem' }} className="mt-2">
                                    <small className="text-danger">
                                        {t(`${metaEntityCountry.error}`)}
                                    </small>
                                </div>
                            ) : null}
                        </FormGroup>
                    </Row>

                    <Row>
                        <FormGroup>
                            <Label for="entity-website" className="form-label">
                                {t('entityWebsiteField.label')}
                            </Label>

                            <FastField className="form-control" type="text" id={WizardClientInformationsStep.id} name="entityWebsite" />

                            {metaEntityWebsite.touched && metaEntityWebsite.error ? (
                                <div style={{ height: 1 + 'rem' }} className="mt-2">
                                    <small className="text-danger">
                                        {t(`${metaEntityWebsite.error}`)}
                                    </small>
                                </div>
                            ) : null}
                        </FormGroup>
                    </Row>
                </Col>

                <Col md="6" xs="6">
                    <Row>
                        <FormGroup>
                            <Label for="contactFullName" className="form-label">
                                {t('contactFullNameField.label')}
                            </Label>

                            <FastField className="form-control" type="text" id={WizardClientInformationsStep.id} name="contactFullName" />

                            {metaContactFullName.touched && metaContactFullName.error ? (
                                <div style={{ height: 1 + 'rem' }} className="mt-2">
                                    <small className="text-danger">
                                        {t(`${metaContactFullName.error}`)}
                                    </small>
                                </div>
                            ) : null}
                        </FormGroup>
                    </Row>

                    <Row>
                        <FormGroup>
                            <Label for="contact-email" className="form-label">
                                {t('contactEmailField.label')}
                            </Label>

                            <FastField className="form-control" type="text" id={WizardClientInformationsStep.id} name="contactEmail" />

                            {metaContactEmail.touched && metaContactEmail.error ? (
                                <div style={{ height: 1 + 'rem' }} className="mt-2">
                                    <small className="text-danger">
                                        {t(`${metaContactEmail.error}`)}
                                    </small>
                                </div>
                            ) : null}
                        </FormGroup>
                    </Row>

                    <Row>
                        <FormGroup>
                            <Label for="contact-slack" className="form-label">
                                {t('contactSlackField.label')}
                            </Label>

                            <FastField className="form-control" type="text" id={WizardClientInformationsStep.id} name="contactSlack" />

                            {metaContactSlack.touched && metaContactSlack.error ? (
                                <div style={{ height: 1 + 'rem' }} className="mt-2">
                                    <small className="text-danger">
                                        {t(`${metaContactSlack.error}`)}
                                    </small>
                                </div>
                            ) : null}
                        </FormGroup>
                    </Row>

                    <Row>
                        <FormGroup>
                            <Label for="datacap-request-link" className="form-label">
                                {t('datacapRequestLink.label')}
                            </Label>

                            <FastField 
                                className="form-control" 
                                type="text" id={WizardClientInformationsStep.id} 
                                name="datacapRequestLink" 
                                placeholder={t('datacapRequestLink.placeholder')}
                            />

                            {metaDatacapRequestLink.touched && metaDatacapRequestLink.error ? (
                                <div style={{ height: 1 + 'rem' }} className="mt-2">
                                    <small className="text-danger">
                                        {t(`${metaDatacapRequestLink.error}`)}
                                    </small>
                                </div>
                            ) : null}
                        </FormGroup>
                    </Row>
                </Col>
            </Row>
        </>
    )
}
