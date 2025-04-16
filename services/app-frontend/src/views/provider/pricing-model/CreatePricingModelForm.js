import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { PureComponent } from 'react'
import * as yup from 'yup'

import { FormControlLabel } from '@mui/material'
import { Field, Form, withFormik } from 'formik'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { Trans, withTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { toast } from 'react-toastify'
import { Alert, Button, Col, Container, FormGroup, Label, Row } from 'reactstrap'

import Select from 'react-select'
import Switch from 'react-switch'
import ReactTooltip from 'react-tooltip'

class CreatePricingModelForm extends PureComponent {
    render() {
        const {
            errors,
            touched,
            isSubmitting,
            ruleList,
            onAddRule,
            onRemoveRule,
            onRuleInputChange,
            onVerifiedStatusChange,
            onSizeUnitChange,
            onRulesReordered,
            onDurationUnitChange,
            isNew,
            isNewDefault,
            pricingModel,
            handleFallOnDefaultChange,
            selectedFallOnDefaultValue,
            handlePricingModelCurrencyChange,
            selectedPricingModelCurrency,
            t,
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
                            <Col xs="8" md="8">
                                <FormGroup>
                                    <Label
                                        for="pricing-model-name"
                                        className="form-label"
                                    >
                                        {t('general.name.label')}
                                    </Label>

                                    <Field
                                        id="pricing-model-name"
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

                            <Col xs="4" md="4">
                                <FormGroup>
                                    <Label
                                        for="pricing-model-currency"
                                        className="form-label"
                                    >
                                        {t('general.currency.label')}
                                    </Label>

                                    <Select
                                        placeholder={t('general.currency.placeholder')}
                                        id="pricingModelCurrency"
                                        className="basic-single"
                                        classNamePrefix="select"
                                        name="pricingModelCurrency"
                                        defaultValue={{
                                            value: selectedPricingModelCurrency, 
                                            label:  t(`general.currency.options.${selectedPricingModelCurrency}`)
                                        }}
                                        options={[
                                            { value: "attofil_gib_epoch", label: t('general.currency.options.attofil_gib_epoch') },
                                            { value: "usd_tib_month", label: t('general.currency.options.usd_tib_month') }
                                        ]}
                                        onChange={handlePricingModelCurrencyChange}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row className="my-3">
                            <Col>
                                <FormControlLabel
                                    className="mt-2"
                                    control={
                                        <Switch
                                            className="ms-4"
                                            disabled={
                                                isNewDefault ||
                                                pricingModel.default
                                            }
                                            onChange={handleFallOnDefaultChange}
                                            checked={selectedFallOnDefaultValue}
                                            height={20}
                                            width={40}
                                        />
                                    }
                                    labelPlacement="end"
                                    label={
                                        <small className="p-2 form-label">
                                            {t('general.fallback.label')}

                                            {isNewDefault ||
                                            pricingModel.default ? (
                                                <i
                                                    data-for="fallDefault"
                                                    data-tip={t(
                                                        'general.fallback.info.isDefault'
                                                    )}
                                                    class="ms-4 fas fa-info-circle"
                                                />
                                            ) : (
                                                <i
                                                    data-for="fallDefault"
                                                    data-tip={t(
                                                        'general.fallback.info.isNotDefault'
                                                    )}
                                                    class="ms-4 fas fa-info-circle"
                                                />
                                            )}

                                            <ReactTooltip
                                                place="bottom"
                                                id="fallDefault"
                                            />
                                        </small>
                                    }
                                />
                            </Col>
                        </Row>
                    </section>

                    <section className="card-form">
                        <Row className="card-form-header mb-4">
                            <Col xs="12" md="12">
                                <h3 className="title is-4 is-styled">
                                    {t('rule.title')}
                                </h3>
                                <h5>
                                    <Trans t={t} i18nKey="rule.subtitle" />
                                </h5>
                            </Col>
                        </Row>

                        <DragDropContext id="firstCard" onDragEnd={onRulesReordered}>
                            <Droppable droppableId="rules">
                                {(provided) => (
                                    <ul id="test" className="rules mt-4" {...provided.droppableProps} ref={provided.innerRef}>
                                        {ruleList.map((rule, i) => {
                                            return (
                                                <>
                                                    {!rule.archived && (
                                                        <Draggable key={rule.uniqueId} draggableId={rule.uniqueId} index={i}>
                                                            {(provided) => (
                                                                <li
                                                                    ref={
                                                                        provided.innerRef
                                                                    }
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                >
                                                                    <div
                                                                        id={
                                                                            'ruleCard' +
                                                                            i
                                                                        }
                                                                        className="card p-4 mb-4"
                                                                    >
                                                                        <Row className="ms-auto">
                                                                            {ruleList.length !==
                                                                                1 && (
                                                                                <span
                                                                                    id={
                                                                                        'deleteRule' +
                                                                                        i
                                                                                    }
                                                                                    className="remove-rule-btn"
                                                                                    onClick={() =>
                                                                                        onRemoveRule(
                                                                                            i
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <i className="fas fa-trash-alt" />
                                                                                </span>
                                                                            )}
                                                                        </Row>

                                                                        <Row className="mb-4 mt-4">
                                                                            <Col style={{width: 20 + "%"}} className="mt-4">
                                                                                <Label
                                                                                    for="transfer-type"
                                                                                    className="form-label"
                                                                                >
                                                                                    {t(
                                                                                        'rule.type.label'
                                                                                    )}
                                                                                </Label>
                                                                                <i
                                                                                    data-for="type"
                                                                                    data-tip={t(
                                                                                        'rule.type.info'
                                                                                    )}
                                                                                    class="ms-4 fas fa-info-circle"
                                                                                />
                                                                                <ReactTooltip
                                                                                    place="bottom"
                                                                                    id="type"
                                                                                />

                                                                                <select
                                                                                    className="form-select"
                                                                                    name="transferType"
                                                                                    id="transfer-type"
                                                                                    defaultValue={
                                                                                        rule.transferType
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        onRuleInputChange(
                                                                                            e,
                                                                                            i
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <option value="any">
                                                                                        {t(
                                                                                            'rule.type.option.any'
                                                                                        )}
                                                                                    </option>
                                                                                    <option value="manual">
                                                                                        {t(
                                                                                            'rule.type.option.manual'
                                                                                        )}
                                                                                    </option>
                                                                                    <option value="graphsync">
                                                                                        {t(
                                                                                            'rule.type.option.graphsync'
                                                                                        )}
                                                                                    </option>
                                                                                    <option value="http">
                                                                                        {t(
                                                                                            'rule.type.option.http'
                                                                                        )}
                                                                                    </option>
                                                                                    <option value="libp2p">
                                                                                        {t(
                                                                                            'rule.type.option.libp2p'
                                                                                        )}
                                                                                    </option>
                                                                                </select>
                                                                            </Col>

                                                                            <Col style={{width: 10 + "%"}} className="mt-4">
                                                                                <Label
                                                                                    for="deal-type"
                                                                                    className="form-label"
                                                                                >
                                                                                    {t(
                                                                                        'rule.isVerified.label'
                                                                                    )}
                                                                                </Label>

                                                                                <select
                                                                                    className="form-select"
                                                                                    name="verified"
                                                                                    id="verified-deals"
                                                                                    defaultValue={
                                                                                        rule.verified
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        onVerifiedStatusChange(
                                                                                            e,
                                                                                            i
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <option value="any">
                                                                                        {t(
                                                                                            'rule.isVerified.option.any'
                                                                                        )}
                                                                                    </option>
                                                                                    <option value="true">
                                                                                        {t(
                                                                                            'rule.isVerified.option.true'
                                                                                        )}
                                                                                    </option>
                                                                                    <option value="false">
                                                                                        {t(
                                                                                            'rule.isVerified.option.false'
                                                                                        )}
                                                                                    </option>
                                                                                </select>
                                                                            </Col>

                                                                            <Col
                                                                                xs="3"
                                                                                md="3"
                                                                                style={{width: 20 + "%"}}
                                                                            >
                                                                                <Label
                                                                                    for="deal-type"
                                                                                    className="form-label"
                                                                                >
                                                                                    {t(
                                                                                        'rule.size.label'
                                                                                    )}
                                                                                </Label>

                                                                                <i
                                                                                    data-for="size"
                                                                                    data-tip={t(
                                                                                        'rule.size.info',
                                                                                        {
                                                                                            newLine:
                                                                                                '<br />',
                                                                                        }
                                                                                    )}
                                                                                    class="ms-4 fas fa-info-circle"
                                                                                />
                                                                                <ReactTooltip
                                                                                    place="bottom"
                                                                                    id="size"
                                                                                    html={
                                                                                        true // enable parsing '<br />' into new line in tooltip
                                                                                    }
                                                                                />

                                                                                <div class="input-group mb-3">
                                                                                    <input
                                                                                        type="number"
                                                                                        className="form-control"
                                                                                        name="minSize"
                                                                                        placeholder={t(
                                                                                            'rule.size.min.placeholder'
                                                                                        )}
                                                                                        value={
                                                                                            rule.minSize
                                                                                        }
                                                                                        onChange={(
                                                                                            e
                                                                                        ) =>
                                                                                            onRuleInputChange(
                                                                                                e,
                                                                                                i
                                                                                            )
                                                                                        }
                                                                                    />

                                                                                    <div class="input-group-prepend">
                                                                                        <select
                                                                                            onChange={(
                                                                                                e
                                                                                            ) =>
                                                                                                onSizeUnitChange(
                                                                                                    'min',
                                                                                                    e,
                                                                                                    i
                                                                                                )
                                                                                            }
                                                                                            className="form-select"
                                                                                            defaultValue={
                                                                                                rule.minSizeUnit ||
                                                                                                'B'
                                                                                            }
                                                                                        >
                                                                                            <option value="B">
                                                                                                {t(
                                                                                                    'rule.size.min.unit.B'
                                                                                                )}
                                                                                            </option>
                                                                                            <option value="KiB">
                                                                                                {t(
                                                                                                    'rule.size.min.unit.KiB'
                                                                                                )}
                                                                                            </option>
                                                                                            <option value="MiB">
                                                                                                {t(
                                                                                                    'rule.size.min.unit.MiB'
                                                                                                )}
                                                                                            </option>
                                                                                            <option value="GiB">
                                                                                                {t(
                                                                                                    'rule.size.min.unit.GiB'
                                                                                                )}
                                                                                            </option>
                                                                                        </select>
                                                                                    </div>
                                                                                </div>

                                                                                <div class="input-group mb-3">
                                                                                    <input
                                                                                        type="number"
                                                                                        className="form-control"
                                                                                        name="maxSize"
                                                                                        placeholder={t(
                                                                                            'rule.size.max.placeholder'
                                                                                        )}
                                                                                        value={
                                                                                            rule.maxSize
                                                                                        }
                                                                                        onChange={(
                                                                                            e
                                                                                        ) =>
                                                                                            onRuleInputChange(
                                                                                                e,
                                                                                                i
                                                                                            )
                                                                                        }
                                                                                    />

                                                                                    <div class="input-group-prepend">
                                                                                        <select
                                                                                            onChange={(
                                                                                                e
                                                                                            ) =>
                                                                                                onSizeUnitChange(
                                                                                                    'max',
                                                                                                    e,
                                                                                                    i
                                                                                                )
                                                                                            }
                                                                                            className="form-select"
                                                                                            defaultValue={
                                                                                                rule.maxSizeUnit ||
                                                                                                'B'
                                                                                            }
                                                                                        >
                                                                                            <option value="B">
                                                                                                {t(
                                                                                                    'rule.size.max.unit.B'
                                                                                                )}
                                                                                            </option>
                                                                                            <option value="KiB">
                                                                                                {t(
                                                                                                    'rule.size.max.unit.KiB'
                                                                                                )}
                                                                                            </option>
                                                                                            <option value="MiB">
                                                                                                {t(
                                                                                                    'rule.size.max.unit.MiB'
                                                                                                )}
                                                                                            </option>
                                                                                            <option value="GiB">
                                                                                                {t(
                                                                                                    'rule.size.max.unit.GiB'
                                                                                                )}
                                                                                            </option>
                                                                                        </select>
                                                                                    </div>
                                                                                </div>
                                                                            </Col>

                                                                            <Col
                                                                                xs="3"
                                                                                md="3"
                                                                                className="ms-3"
                                                                                style={{width: 20 + "%"}}
                                                                            >
                                                                                <Label
                                                                                    for="deal-type"
                                                                                    className="form-label"
                                                                                >
                                                                                    {t(
                                                                                        'rule.duration.label'
                                                                                    )}
                                                                                </Label>

                                                                                <i
                                                                                    data-for="duration"
                                                                                    data-tip={t(
                                                                                        'rule.duration.info',
                                                                                        {
                                                                                            newLine:
                                                                                                '<br />',
                                                                                        }
                                                                                    )}
                                                                                    class="ms-4 fas fa-info-circle"
                                                                                />
                                                                                <ReactTooltip
                                                                                    place="bottom"
                                                                                    id="duration"
                                                                                    html={
                                                                                        true
                                                                                    } // enable parsing '<br />' into new line in tooltip
                                                                                />

                                                                                <div class="input-group mb-3">
                                                                                    <input
                                                                                        type="number"
                                                                                        className="form-control"
                                                                                        name="minDuration"
                                                                                        placeholder={t(
                                                                                            'rule.duration.min.placeholder'
                                                                                        )}
                                                                                        min="0"
                                                                                        value={
                                                                                            rule.minDuration
                                                                                        }
                                                                                        onChange={(
                                                                                            e
                                                                                        ) =>
                                                                                            onRuleInputChange(
                                                                                                e,
                                                                                                i
                                                                                            )
                                                                                        }
                                                                                    />

                                                                                    <div class="input-group-prepend">
                                                                                        <select
                                                                                            onChange={(
                                                                                                e
                                                                                            ) =>
                                                                                                onDurationUnitChange(
                                                                                                    'min',
                                                                                                    e,
                                                                                                    i
                                                                                                )
                                                                                            }
                                                                                            className="form-select"
                                                                                        >
                                                                                            <option
                                                                                                selected={
                                                                                                    rule.minDurationUnit ===
                                                                                                    'Days'
                                                                                                        ? 'selected'
                                                                                                        : ''
                                                                                                }
                                                                                                value="Days"
                                                                                            >
                                                                                                {t(
                                                                                                    'rule.duration.min.unit.day'
                                                                                                )}
                                                                                            </option>
                                                                                            <option
                                                                                                selected={
                                                                                                    rule.minDurationUnit ===
                                                                                                    'Epochs'
                                                                                                        ? 'selected'
                                                                                                        : ''
                                                                                                }
                                                                                                value="Epochs"
                                                                                            >
                                                                                                {t(
                                                                                                    'rule.duration.min.unit.epoch'
                                                                                                )}
                                                                                            </option>
                                                                                        </select>
                                                                                    </div>
                                                                                </div>

                                                                                <div class="input-group mb-3">
                                                                                    <input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        className="form-control"
                                                                                        name="maxDuration"
                                                                                        placeholder={t(
                                                                                            'rule.duration.max.placeholder'
                                                                                        )}
                                                                                        value={
                                                                                            rule.maxDuration
                                                                                        }
                                                                                        onChange={(
                                                                                            e
                                                                                        ) =>
                                                                                            onRuleInputChange(
                                                                                                e,
                                                                                                i
                                                                                            )
                                                                                        }
                                                                                    />

                                                                                    <div class="input-group-prepend">
                                                                                        <select
                                                                                            onChange={(
                                                                                                e
                                                                                            ) =>
                                                                                                onDurationUnitChange(
                                                                                                    'max',
                                                                                                    e,
                                                                                                    i
                                                                                                )
                                                                                            }
                                                                                            className="form-select"
                                                                                        >
                                                                                            <option
                                                                                                selected={
                                                                                                    rule.maxDurationUnit ===
                                                                                                    'Days'
                                                                                                        ? 'selected'
                                                                                                        : ''
                                                                                                }
                                                                                                value="Days"
                                                                                            >
                                                                                                {t(
                                                                                                    'rule.duration.max.unit.day'
                                                                                                )}
                                                                                            </option>
                                                                                            <option
                                                                                                selected={
                                                                                                    rule.maxDurationUnit ===
                                                                                                    'Epochs'
                                                                                                        ? 'selected'
                                                                                                        : ''
                                                                                                }
                                                                                                value="Epochs"
                                                                                            >
                                                                                                {t(
                                                                                                    'rule.duration.max.unit.epoch'
                                                                                                )}
                                                                                            </option>
                                                                                        </select>
                                                                                    </div>
                                                                                </div>
                                                                            </Col>

                                                                            <Col xs="2" md="2" style={{width: 25 + "%"}}>
                                                                                <Label for="deal-type" className="form-label">
                                                                                    {t('rule.price.label')}
                                                                                </Label>

                                                                                <i
                                                                                    data-for="price"
                                                                                    data-tip={t('rule.price.info')}
                                                                                    class="ms-4 fas fa-info-circle"
                                                                                />

                                                                                <ReactTooltip place="bottom" id="price" />

                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control"
                                                                                    name="price"
                                                                                    placeholder={
                                                                                        selectedPricingModelCurrency === 'attofil_gib_epoch' ? (
                                                                                            t('rule.price.placeholder.attoFilGiBEpoch')
                                                                                        ) : (
                                                                                            t('rule.price.placeholder.USDCentsTibMonth')
                                                                                        )
                                                                                    }
                                                                                    value={
                                                                                        rule.price
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        onRuleInputChange(
                                                                                            e,
                                                                                            i
                                                                                        )
                                                                                    }
                                                                                />

                                                                                {rule.price != null && rule.price > 0 && (
                                                                                    <>
                                                                                        {selectedPricingModelCurrency === 'attofil_gib_epoch' ? (
                                                                                            <Alert color="info" className="mt-2 d-flex align-items-center">
                                                                                                ≈ {rule.price_for_30days_fil} {t('rule.price.priceConversionUnit')}{' '}
                                                                                                (${rule.price_for_30days_usd})
                                                                                            </Alert>
                                                                                        ) : selectedPricingModelCurrency === 'usd_tib_month' ? (
                                                                                            <Alert color="info" className="mt-2 d-flex align-items-center">
                                                                                                ≈ {rule.price_fil_per_gib_per_epoch}{' '} 
                                                                                                {t('rule.price.priceConversionUnitAttoFilPerGibPerEpoch')}
                                                                                            </Alert>
                                                                                        ) : null }
                                                                                    </>
                                                                                )}
                                                                            </Col>
                                                                        </Row>
                                                                    </div>
                                                                </li>
                                                            )}
                                                        </Draggable>
                                                    )}
                                                </>
                                            )
                                        })}
                                        {provided.placeholder}
                                    </ul>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </section>

                    <Row className="mt-3 mb-4">
                        <Col className="text-end">
                            <Button
                                id="addNewRule"
                                className="me-4 mb-4 custom-cidg-button"
                                onClick={onAddRule}
                            >
                                {t('button.addNewRule')}
                            </Button>

                            <Button
                                id="createModel"
                                type="submit"
                                className="mb-4 custom-cidg-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <FontAwesomeIcon
                                        spin
                                        icon={faSpinner}
                                        size="2xs"
                                    />
                                ) : isNew || isNewDefault ? (
                                    <>{t('button.create')}</>
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
    displayName: 'CreatePricingModelForm',

    mapPropsToValues: ({ pricingModel }) => ({
        name: pricingModel.name || '',
    }),

    validationSchema: () =>
        yup.object().shape({
            name: yup
                .string()
                .typeError('validation.name.typeError')
                .required('validation.name.required')
                .matches(/^[A-Za-z0-9_ ]+$/, 'validation.name.matches'),
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

                    if (props.createDefaultModel) {
                        toast.success(
                            t(
                                'notification.success.onCreateDefaultPricingModel'
                            )
                        )
                    } else if (props.isNew) {
                        toast.success(
                            t('notification.success.onCreatePricingModel')
                        )
                    } else {
                        toast.success(
                            t('notification.success.onUpdatePricingModel')
                        )
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
    withTranslation('CreatePricingModelForm')(
        withFormik(formikConfig)(CreatePricingModelForm)
    )
)
