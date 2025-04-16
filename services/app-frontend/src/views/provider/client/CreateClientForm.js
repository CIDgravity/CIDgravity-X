import { PureComponent } from 'react'

import { withTranslation } from 'react-i18next'
import CreatableSelect from 'react-select/creatable'
import { toast } from 'react-toastify'

import * as yup from 'yup'

import { Field, Form, withFormik } from 'formik'
import { withRouter } from 'react-router'
import { Alert, Button, Col, FormGroup, Label, Row } from 'reactstrap'

import {
    CustomCreatableLabelWithTooltipAndCopy,
    CustomCreatableLabelWithCopy,
} from 'shared/components/CustomCreatableLabel'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormControlLabel } from '@mui/material'

import {
    toReadableDurationFormatNew,
    toReadableSize,
} from 'shared/utils/file_size'
import scssVariables from 'scss/cidg-variables.scss'
import Switch from 'react-switch'

const components = {
    DropdownIndicator: null,
    MultiValueLabel: CustomCreatableLabelWithTooltipAndCopy,
}

const peerIdComponents = {
    DropdownIndicator: null,
    MultiValueLabel: CustomCreatableLabelWithCopy,
}

class CreateClientForm extends PureComponent {
    render() {
        const { t } = this.props

        const {
            errors,
            touched,
            isSubmitting,
            isCheckingClientAddress,
            isCheckingClientPeerId,
            onAddressesChange,
            onAddressInputChange,
            currentClient,
            onAddressKeyDown,
            address,
            selectedAddresses,
            peerId,
            onPeerIdsChange,
            onPeerIdInputChange,
            onStartEpochSealingBufferDefaultChange,
            useGlobalSettingsForStartEpochSealingBuffer,
            onPeerIdKeyDown,
            selectedPeerIds,
            onKeyDownOnForm,
            isNew,
            setFieldValue,
        } = this.props

        return (
            <Form onKeyDown={onKeyDownOnForm}>
                <section className="card-form">
                    <Row id="clientMainInformation" className="my-3">
                        <Col xs="12" md="12">
                            <FormGroup>
                                <Label for="client-name" className="form-label">
                                    {t('clientName.label')}
                                </Label>
                                <Field
                                    placeholder={t('clientName.placeholder')}
                                    id="client-name"
                                    className="form-control"
                                    name="name"
                                    maxLength="255"
                                />

                                {touched.name && errors.name && (
                                    <small className="text-danger">
                                        {t(`${errors.name}`)}
                                    </small>
                                )}
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs="12" md="6">
                            <FormGroup>
                                <Label
                                    for="client-email"
                                    className="form-label"
                                >
                                    {t('email.label')}
                                </Label>
                                <Field
                                    id="client-email"
                                    className="form-control"
                                    name="email"
                                    maxLength="255"
                                />

                                {touched.email && errors.email && (
                                    <small className="text-danger">
                                        {t(`${errors.email}`)}
                                    </small>
                                )}
                            </FormGroup>
                        </Col>

                        <Col xs="12" md="6">
                            <FormGroup>
                                <Label
                                    for="slack-username"
                                    className="form-label"
                                >
                                    {t('slackUsername.label')}
                                </Label>
                                <Field
                                    id="slack-username"
                                    className="form-control"
                                    name="slack"
                                    maxLength="255"
                                />

                                {touched.slack && errors.slack && (
                                    <small className="text-danger">
                                        {t(`${errors.slack}`)}
                                    </small>
                                )}
                            </FormGroup>
                        </Col>
                    </Row>
                </section>

                {isNew ||
                (currentClient.integration &&
                    currentClient.integration.id === 0) ? (
                    <>
                        <section className="card-form">
                            <Row className="card-form-header">
                                <div>
                                    <h3 className="title is-4 is-styled">
                                        {t('manageClientAddresses.title')}
                                    </h3>
                                    <h5>
                                        {t('manageClientAddresses.description')}
                                    </h5>
                                </div>
                            </Row>

                            <Row className="my-3">
                                <Col
                                    xs="12"
                                    md="12"
                                    style={{ marginLeft: 10 + 'px' }}
                                >
                                    <CreatableSelect
                                        id="clientAddresses"
                                        components={components}
                                        inputValue={address}
                                        isClearable
                                        isMulti
                                        menuIsOpen={false}
                                        onChange={onAddressesChange}
                                        onInputChange={onAddressInputChange}
                                        onKeyDown={onAddressKeyDown}
                                        placeholder={t(
                                            'manageClientAddresses.select.placeholder'
                                        )}
                                        value={selectedAddresses}
                                        isDisabled={isCheckingClientAddress}
                                    />
                                </Col>
                            </Row>

                            <Row className="mt-3">
                                <Col
                                    xs="12"
                                    md="12"
                                    style={{ marginLeft: 10 + 'px' }}
                                >
                                    {isCheckingClientAddress ? (
                                        <Alert color="info">
                                            <span className="p-2">
                                                <FontAwesomeIcon
                                                    spin
                                                    icon={faCircleNotch}
                                                />
                                            </span>
                                            {t(
                                                'manageClientAddresses.addressChecks.loading'
                                            )}
                                        </Alert>
                                    ) : (
                                        <Alert color="warning">
                                            {t(
                                                'manageClientAddresses.addressChecks.description'
                                            )}
                                        </Alert>
                                    )}
                                </Col>
                            </Row>
                        </section>

                        <section className="card-form">
                            <Row className="card-form-header">
                                <div>
                                    <h3 className="title is-4 is-styled">
                                        {t('manageClientPeerIds.title')}
                                    </h3>
                                    <h5>
                                        {t('manageClientPeerIds.description')}
                                    </h5>
                                </div>
                            </Row>

                            <Row className="my-3">
                                <Col
                                    xs="12"
                                    md="12"
                                    style={{ marginLeft: 10 + 'px' }}
                                >
                                    <CreatableSelect
                                        id="clientPeerIds"
                                        components={peerIdComponents}
                                        inputValue={peerId}
                                        isClearable
                                        isMulti
                                        menuIsOpen={false}
                                        onChange={onPeerIdsChange}
                                        onInputChange={onPeerIdInputChange}
                                        onKeyDown={onPeerIdKeyDown}
                                        placeholder={t(
                                            'manageClientPeerIds.select.placeholder'
                                        )}
                                        value={selectedPeerIds}
                                        isDisabled={isCheckingClientPeerId}
                                    />
                                </Col>
                            </Row>

                            <Row className="mt-3">
                                <Col xs="12" md="12">
                                    {isCheckingClientPeerId ? (
                                        <Alert color="info">
                                            <span className="p-2">
                                                <FontAwesomeIcon
                                                    spin
                                                    icon={faCircleNotch}
                                                />
                                            </span>
                                            {t(
                                                'manageClientPeerIds.peerIdChecks.loading'
                                            )}
                                        </Alert>
                                    ) : (
                                        <Alert color="warning">
                                            {t(
                                                'manageClientPeerIds.peerIdChecks.description'
                                            )}
                                        </Alert>
                                    )}
                                </Col>
                            </Row>
                        </section>
                    </>
                ) : null}

                <section className="card-form">
                    <Row className="card-form-header">
                        <div>
                            <h3 className="title is-4 is-styled">
                                {t('storageDealRates.title')}
                            </h3>
                            <h5>{t('storageDealRates.description')}</h5>
                        </div>
                    </Row>

                    <Row id="clientStorageDealRates" className="mt-4 my-3">
                        <Col xs="5" md="5" style={{ marginLeft: 10 + 'px' }}>
                            <FormGroup>
                                <Label
                                    for="slack-username"
                                    className="form-label"
                                >
                                    {t('storageDealRates.numberOfDeal.label')}
                                </Label>

                                <Field
                                    placeholder={5}
                                    type="number"
                                    id="client-hourly-deal-limit"
                                    className="form-control"
                                    name="hourlyDealLimit"
                                    maxLength="255"
                                />

                                {touched.hourlyDealLimit &&
                                    errors.hourlyDealLimit && (
                                        <small className="text-danger">
                                            {t(`${errors.hourlyDealLimit}`)}
                                        </small>
                                    )}
                            </FormGroup>
                        </Col>

                        <Col xs="6" md="6">
                            <FormGroup>
                                <Label
                                    for="slack-username"
                                    className="form-label"
                                >
                                    {t(
                                        'storageDealRates.cumulativeDealSize.label'
                                    )}
                                </Label>

                                <Field
                                    placeholder={5}
                                    type="number"
                                    id="client-hourly-deal-size-limit"
                                    className="form-control"
                                    name="hourlyDealSizeLimit"
                                    maxLength="255"
                                />

                                {touched.hourlyDealSizeLimit &&
                                    errors.hourlyDealSizeLimit && (
                                        <small className="text-danger">
                                            {t(`${errors.hourlyDealSizeLimit}`)}
                                        </small>
                                    )}
                            </FormGroup>
                        </Col>
                    </Row>
                </section>

                <section className="card-form">
                    <Row className="card-form-header">
                        <div>
                            <h3 className="title is-4 is-styled">
                                {t('startEpochSealingBuffer.title')}
                            </h3>
                            <h5>{t('startEpochSealingBuffer.description')}</h5>
                        </div>
                    </Row>

                    <Row
                        id="clientStartEpochSealingBuffer"
                        className="mt-4 my-3"
                    >
                        <Col xs="8" md="8" style={{ marginLeft: 10 + 'px' }}>
                            <FormControlLabel
                                style={{ marginLeft: 5 + 'px' }}
                                control={
                                    <Switch
                                        checked={
                                            !useGlobalSettingsForStartEpochSealingBuffer
                                        }
                                        onChange={(checked) => {
                                            setFieldValue(
                                                'useGlobalSettingsForStartEpochSealingBuffer',
                                                !checked
                                            )
                                            onStartEpochSealingBufferDefaultChange(
                                                checked
                                            )
                                        }}
                                        height={20}
                                        width={40}
                                        onColor={scssVariables.successColor}
                                    />
                                }
                                labelPlacement="end"
                                label={
                                    <small className="p-2 form-label">
                                        {t(
                                            'startEpochSealingBuffer.switchLabel'
                                        )}
                                    </small>
                                }
                            />

                            <Field
                                placeholder={24}
                                type="number"
                                id="client-start-epoch-sealing-buffer"
                                className="form-control mt-3"
                                name="startEpochSealingBuffer"
                                maxLength="255"
                                disabled={
                                    useGlobalSettingsForStartEpochSealingBuffer
                                }
                            />

                            {touched.startEpochSealingBuffer &&
                                errors.startEpochSealingBuffer && (
                                    <small className="text-danger">
                                        {t(`${errors.startEpochSealingBuffer}`)}
                                    </small>
                                )}

                            {/* This hidden field will contain the value of the switch (use default global setting or custom value */}
                            {/* This will help yup validation to define if field is required or not */}
                            <Field
                                id="useGlobalSettingsForStartEpochSealingBuffer"
                                className="form-control"
                                name="useGlobalSettingsForStartEpochSealingBuffer"
                                maxLength="255"
                                type="hidden"
                            />
                        </Col>
                    </Row>
                </section>

                <Row className="mt-3 mb-3">
                    <Col className="text-end">
                        <Button
                            id="createClient"
                            className="custom-cidg-button"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>{t('button.loading')}</>
                            ) : isNew ? (
                                <>{t('button.createClient')}</>
                            ) : (
                                <>{t('button.updateClient')}</>
                            )}
                        </Button>
                    </Col>
                </Row>
            </Form>
        )
    }
}

const formikConfig = {
    displayName: 'CreateClient',

    mapPropsToValues: ({
        currentClient,
        currentTenant,
        useGlobalSettingsForStartEpochSealingBuffer,
        createClientFromHistory,
        clientNameFromHistory,
    }) => ({
        name: createClientFromHistory
            ? clientNameFromHistory
            : currentClient.name
            ? currentClient.name
            : '',
        email: currentClient.email || '',
        slack: currentClient.slack || '',
        hourlyDealLimit: currentClient.hourlyDealLimit || 0,
        hourlyDealSizeLimit:
            toReadableSize('B', 'GiB', currentClient.hourlyDealSizeLimit) || 0,
        startEpochSealingBuffer:
            toReadableDurationFormatNew(
                'Epochs',
                'Hours',
                currentClient.startEpochSealingBuffer
            ) ||
            toReadableDurationFormatNew(
                'Epochs',
                'Hours',
                currentTenant.settings.startEpochSealingBuffer
            ),
        useGlobalSettingsForStartEpochSealingBuffer:
            useGlobalSettingsForStartEpochSealingBuffer || false,
    }),

    validationSchema: () =>
        yup.object().shape({
            useGlobalSettingsForStartEpochSealingBuffer: yup
                .boolean()
                .required(),
            name: yup
                .string()
                .typeError('validation.isNameValidString')
                .required('validation.isNameFieldMandatory'),
            email: yup
                .string()
                .typeError('validation.isEmailValidString')
                .email('validation.isEmailValidFormat'),
            slack: yup.string().typeError('validation.isSlackValidString'),
            hourlyDealLimit: yup
                .number()
                .integer('validation.isHourlyDealLimitValidType')
                .typeError('validation.isHourlyDealLimitValidType')
                .min(0, 'validation.isHourlyDealLimitPositive')
                .required('validation.isHourlyDealLimitMandatory'),
            startEpochSealingBuffer: yup
                .number()
                .when('useGlobalSettingsForStartEpochSealingBuffer', {
                    is: false,
                    then: yup
                        .number()
                        .integer(
                            'validation.isStartEpochSealingBufferValidType'
                        )
                        .typeError(
                            'validation.isStartEpochSealingBufferValidType'
                        )
                        .min(0, 'validation.isStartEpochSealingBufferPositive')
                        .required(
                            'validation.isStartEpochSealingBufferMandatory'
                        ),
                }),
            hourlyDealSizeLimit: yup
                .number()
                .integer('validation.isHourlyDealSizeLimitValidType')
                .typeError('validation.isHourlyDealSizeLimitValidType')
                .min(0, 'validation.isHourlyDealSizeLimitPositive')
                .required('validation.isHourlyDealSizeLimitMandatory'),
        }),

    handleSubmit: (values, { props, setSubmitting }) => {
        const { t } = props
        props
            .onSubmit(values)
            .then((returnValue) => {
                const { status, message } = returnValue

                if (status) {
                    const { history } = props
                    setSubmitting(false)
                    history.goBack()

                    if (props.isNew) {
                        toast.success(
                            t(
                                'notification.success.isClientSuccessfullyCreated'
                            )
                        )
                    } else {
                        toast.success(
                            t(
                                'notification.success.isClientSuccessfullyUpdated'
                            )
                        )
                    }
                } else {
                    setSubmitting(false)
                    toast.error(message)
                }
            })
            .catch((e) => {
                if (props.isNew) {
                    toast.error(t('notification.error.hasClientCreationFailed'))
                } else {
                    toast.error(t('notification.error.hasClientUpdateFailed'))
                }
                console.log(e)
                setSubmitting(false)
            })
    },
}

export default withRouter(
    withTranslation('CreateClientForm')(
        withFormik(formikConfig)(CreateClientForm)
    )
)
