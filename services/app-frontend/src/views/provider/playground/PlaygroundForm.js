import { Form, withFormik } from 'formik'
import { PureComponent } from 'react'
import { isMobile } from 'react-device-detect'
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { toast } from 'react-toastify'
import { Alert, Button, Col, FormGroup, Label, Row, Input } from 'reactstrap'

import { GetPlaygroundAccepanceLogicFields } from 'shared/services/playground'
import CustomSizeInput from 'shared/forms/CustomSizeInput'

import DatePicker from 'react-datepicker'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import ReactTooltip from 'react-tooltip'
import * as yup from 'yup'

const dayjs = require('dayjs')
class PlaygroundForm extends PureComponent {
    render() {
        const {
            simulateFromHistory,
            isSubmitting,
            selectedSize,
            selectedSizeUnit,
            selectedVerified,
            selectedTransferType,
            selectedPrice,
            selectedPriceCurrency,
            selectedPriceFor30DaysFil,
            selectedPriceFor30DaysUsd,
            selectedPriceFilGibEpoch,
            onSizeUnitChange,
            selectedDuration,
            selectedDurationUnit,
            onDurationUnitChange,
            onInputValueChange,
            handleChangeAddress,
            handleAddressNotInList,
            clientAddresses,
            selectedAddress,
            sealingPipelineValues,
            onRemoveSealingPipelineValue,
            onAddSealingPipelineValue,
            onAcceptanceLogicTypeDropdownChange,
            onAcceptanceLogicValueChange,
            onPriceCurrencyChange,
            t,
        } = this.props

        return (
            <Form>
                <section className="card-form">
                    <Row className="card-form-header">
                        <div>
                            <h3 className="title is-4 is-styled">
                                {t('dealProposal.title')}
                            </h3>
                        </div>
                    </Row>

                    <Row className="mt-4" style={{ marginLeft: 5 + 'px' }}>
                        <Col xs="12" md="12">
                            <FormGroup>
                                <Label
                                    for="address-from"
                                    className="form-label"
                                >
                                    {t('fromAddress.label')}
                                </Label>

                                <CreatableSelect
                                    autoFocus
                                    isClearable
                                    onChange={handleChangeAddress}
                                    onCreateOption={handleAddressNotInList}
                                    options={clientAddresses}
                                    value={selectedAddress}
                                    formatCreateLabel={() =>
                                        t('fromAddress.formatCreateLabel')
                                    }
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row className="mt-4" style={{ marginLeft: 5 + 'px' }}>
                        <Col
                            xs={isMobile ? '12' : '6'}
                            md={isMobile ? '12' : '6'}
                        >
                            <Label for="deal-size" className="form-label">
                                {t('dealDuration.label')}
                            </Label>

                            <div className="input-group mb-3">
                                <input
                                    type="number"
                                    className="form-control"
                                    name="dealDuration"
                                    value={selectedDuration}
                                    disabled={isSubmitting}
                                    onChange={(e) =>
                                        onInputValueChange('duration', e)
                                    }
                                />

                                <div className="input-group-prepend">
                                    <select
                                        disabled={isSubmitting}
                                        defaultValue={selectedDurationUnit}
                                        onChange={(e) =>
                                            onDurationUnitChange(e)
                                        }
                                        className="form-select"
                                    >
                                        <option value="Days">
                                            {t('dealDuration.daysValue')}
                                        </option>
                                        <option value="Epochs">
                                            {t('dealDuration.epochsValue')}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </Col>

                        <Col
                            xs={isMobile ? '12' : '6'}
                            md={isMobile ? '12' : '6'}
                        >
                            <Label for="deal-size" className="form-label">
                                {t('dealSize.label')}
                            </Label>

                            <i
                                data-for="paddingSize"
                                data-tip={t('dealSize.tooltip')}
                                className="ms-4 fas fa-info-circle"
                            />
                            <ReactTooltip place="bottom" id="paddingSize" />

                            <div className="input-group mb-3">
                                <input
                                    type="number"
                                    className="form-control"
                                    name="dealSize"
                                    value={selectedSize}
                                    disabled={isSubmitting}
                                    onChange={(e) =>
                                        onInputValueChange('size', e)
                                    }
                                />

                                <div className="input-group-prepend">
                                    <select
                                        disabled={isSubmitting}
                                        value={selectedSizeUnit}
                                        onChange={(e) => onSizeUnitChange(e)}
                                        className="form-select"
                                    >
                                        <option value="B">
                                            {t('dealSize.sizeUnits.B')}
                                        </option>
                                        <option value="KiB">
                                            {t('dealSize.sizeUnits.KIB')}
                                        </option>
                                        <option value="MiB">
                                            {t('dealSize.sizeUnits.MIB')}
                                        </option>
                                        <option value="GiB">
                                            {t('dealSize.sizeUnits.GIB')}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row className="mt-4" style={{ marginLeft: 5 + 'px' }}>
                        <Col xs="6" md="6">
                            <Label for="verified" className="form-label">
                                {t('verified.label')}
                            </Label>

                            <select
                                className="form-select"
                                name="verified"
                                disabled={isSubmitting}
                                onChange={(e) =>
                                    onInputValueChange('verified', e)
                                }
                                value={selectedVerified}
                            >
                                <option value="false">
                                    {t('verified.falseValue')}
                                </option>
                                <option value="true">
                                    {t('verified.trueValue')}
                                </option>
                            </select>
                        </Col>

                        <Col xs="6" md="6">
                            <Label for="transfer-type" className="form-label">
                                {t('transferType.label')}
                            </Label>

                            <select
                                className="form-select"
                                name="transferType"
                                disabled={isSubmitting}
                                onChange={(e) =>
                                    onInputValueChange('transferType', e)
                                }
                                value={selectedTransferType}
                            >
                                <option value="manual">
                                    {t('transferType.manualValue')}
                                </option>
                                <option value="graphsync">
                                    {t('transferType.graphsyncValue')}
                                </option>
                                <option value="http">
                                    {t('transferType.httpValue')}
                                </option>
                                <option value="libp2p">
                                    {t('transferType.libp2pValue')}
                                </option>
                            </select>
                        </Col>
                    </Row>

                    <Row className="mt-4" style={{ marginLeft: 5 + 'px' }}>
                        <Col xs={isMobile ? '12' : '6'} md={isMobile ? '12' : '6'}>
                            <Label for="deal-price" className="form-label">
                                {t('price.label')}
                            </Label>

                            <i data-for="dealPriceUnit" data-tip={t('price.tooltip')} className="ms-4 fas fa-info-circle"/>
                            <ReactTooltip place="bottom" id="dealPriceUnit" />

                            <div className="input-group mb-3">
                                <input
                                    type="number"
                                    className="form-control"
                                    name="dealPrice"
                                    value={selectedPrice}
                                    disabled={isSubmitting}
                                    placeholder={t('price.placeholder')}
                                    onChange={(e) =>
                                        onInputValueChange('price', e)
                                    }
                                />

                                <div className="input-group-prepend">
                                    <select
                                        disabled={isSubmitting}
                                        value={selectedPriceCurrency}
                                        onChange={(e) => onPriceCurrencyChange(e)}
                                        className="form-select"
                                    >
                                        <option value="attofil_gib_epoch">
                                            {t('price.units.attofil_gib_epoch')}
                                        </option>
                                        <option value="usd_tib_month">
                                            {t('price.units.usd_tib_month')}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row style={{ marginLeft: 5 + 'px' }}>
                        <Col xs="12" md="12">
                            {selectedPrice != null && selectedPrice > 0 && (
                                <>
                                    {selectedPriceCurrency === 'attofil_gib_epoch' ? (
                                        <Alert color="info" className="mt-2 d-flex align-items-center">
                                            ≈ {selectedPriceFor30DaysFil} {t('price.priceConversionUnit')}{' '}
                                            (${selectedPriceFor30DaysUsd})
                                        </Alert>
                                    ) : selectedPriceCurrency === 'usd_tib_month' ? (
                                        <Alert color="info" className="mt-2 d-flex align-items-center">
                                            {selectedPriceFilGibEpoch}{' '} 
                                            {t('price.priceConversionUnitAttoFilPerGibPerEpoch')}
                                        </Alert>
                                    ) : null }
                                </>
                            )}
                        </Col>
                    </Row>
                </section>

                <section className="card-form">
                    <Row className="card-form-header">
                        <div>
                            <h3 className="title is-4 is-styled">
                                {t('storageAcceptanceLogic.title')}
                            </h3>
                            <h5>{t('storageAcceptanceLogic.subtitle')}</h5>
                        </div>
                    </Row>

                    {sealingPipelineValues.map((element, index) => (
                        <Row className="mt-4" style={{ marginLeft: 5 + 'px' }}>
                            <Col xs="6" md="6">
                                <Select
                                    name="state"
                                    isDisabled={
                                        isSubmitting ||
                                        element.state === 'ReceivedOnDatetime'
                                    }
                                    onChange={(e) =>
                                        onAcceptanceLogicTypeDropdownChange(
                                            index,
                                            e
                                        )
                                    }
                                    defaultValue={
                                        element.state !== null
                                            ? {
                                                  value: element.state,
                                                  label: t(
                                                      'sealingpipeline.fields.' +
                                                          element.label
                                                  ),
                                              }
                                            : null
                                    }
                                    options={GetPlaygroundAccepanceLogicFields(
                                        sealingPipelineValues,
                                        t
                                    )}
                                />
                            </Col>

                            <Col xs="4" md="4">
                                {/* The field use depend on value selected on dropdown */}
                                {element.state === 'BaseFee' ? (
                                    <Input
                                        type="number"
                                        id={'value-' + index}
                                        className="form-control"
                                        name={'value-' + index}
                                        placeholder={t(
                                            'sealingpipeline.value.placeholder'
                                        )}
                                        defaultValue={element.value}
                                        disabled={isSubmitting}
                                        step=".01"
                                        onChange={(e) =>
                                            onAcceptanceLogicValueChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                    />
                                ) : element.state === 'ReceivedOnDatetime' ? (
                                    <DatePicker
                                        calendarStartDay={1}
                                        showTimeInput
                                        disabledKeyboardNavigation
                                        timeFormat="HH:mm"
                                        dateFormat="yyyy-MM-dd HH:mm:ss"
                                        selected={
                                            new Date(element.value * 1000)
                                        }
                                        onChange={(date) =>
                                            onAcceptanceLogicValueChange(
                                                index,
                                                dayjs(date).unix()
                                            )
                                        }
                                        isClearable={false}
                                        className="form-control"
                                    />
                                ) : element.state === 'FilPriceInUsd' ? (
                                    <input
                                        type="number"
                                        id={'value-' + index}
                                        className="form-control"
                                        name={'value-' + index}
                                        min="0"
                                        placeholder={t(
                                            'sealingpipeline.value.placeholder'
                                        )}
                                        defaultValue={element.value}
                                        disabled={isSubmitting}
                                        step="any"
                                        onChange={(e) =>
                                            onAcceptanceLogicValueChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                    />
                                ) : element.state ===
                                  'GlobalCurrentStorageNumberDealRate' ? (
                                    <CustomSizeInput
                                        defaultValue={element.value}
                                        defaultUnit={'B'}
                                    />
                                ) : (
                                    <input
                                        type="number"
                                        id={'value-' + index}
                                        className="form-control"
                                        name={'value-' + index}
                                        min="0"
                                        placeholder={t(
                                            'sealingpipeline.value.placeholder'
                                        )}
                                        defaultValue={element.value}
                                        disabled={isSubmitting}
                                        step="1"
                                        onChange={(e) =>
                                            onAcceptanceLogicValueChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                    />
                                )}
                            </Col>

                            <Col xs="1" md="1">
                                {element.state === 'BaseFee' ? (
                                    <i
                                        data-for="unitToolTip"
                                        data-tip={
                                            simulateFromHistory
                                                ? t(
                                                      'sealingpipeline.value.tooltips.valueMustBeAttoFil'
                                                  )
                                                : t(
                                                      'sealingpipeline.value.tooltips.valueMustBeNanoFil'
                                                  )
                                        }
                                        className="mt-3 fas fa-info-circle"
                                    />
                                ) : element.state === 'FilPriceInUsd' ? (
                                    <i
                                        data-for="unitToolTip"
                                        data-tip={t(
                                            'sealingpipeline.value.tooltips.mustBeInUSDollars'
                                        )}
                                        className="mt-3 fas fa-info-circle"
                                    />
                                ) : null}

                                <ReactTooltip place="bottom" id="unitToolTip" />
                            </Col>

                            <Col xs="1" md="1">
                                {index &&
                                element.state !== 'ReceivedOnDatetime' ? (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger mt-1"
                                        onClick={() =>
                                            onRemoveSealingPipelineValue(index)
                                        }
                                    >
                                        x
                                    </button>
                                ) : null}
                            </Col>
                        </Row>
                    ))}

                    <Row>
                        <Col
                            className="text-end"
                            style={{ marginTop: 50 + 'px' }}
                        >
                            <Button
                                className="btn btn-secondary me-4"
                                disabled={isSubmitting}
                                onClick={() => onAddSealingPipelineValue()}
                            >
                                {t('button.addSealingPipelineValue')}
                            </Button>

                            <Button
                                className="custom-cidg-button"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>{t('button.isSendingTest')}</>
                                ) : (
                                    <>{t('button.sendATest')}</>
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
    displayName: 'SendPlaygroundRequest',

    mapPropsToValues: () => ({
        price: 0,
    }),

    validationSchema: () =>
        yup.object().shape({
            price: yup
                .number()
                .typeError('validation.isPriceInvalidValue')
                .required('validation.isPriceMandatoryField'),
        }),

    handleSubmit: (values, { props, setSubmitting }) => {
        props
            .onSubmit(values)
            .then((returnValue) => {
                const { status, message } = returnValue

                if (status) {
                    setSubmitting(false)
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
    withFormik(formikConfig)(withTranslation('PlaygroundForm')(PlaygroundForm))
)
