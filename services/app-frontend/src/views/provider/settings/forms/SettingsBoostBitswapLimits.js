import React, { PureComponent } from 'react'

import { Row, Col, FormGroup, Label, Button } from 'reactstrap'

import { Field, Form, withFormik } from 'formik'
import 'react-tabs/style/react-tabs.css'
import ReactTooltip from 'react-tooltip'
import { Trans, withTranslation } from 'react-i18next'
import * as yup from 'yup'
import { toast } from 'react-toastify'
import { withRouter } from 'react-router'
import { CustomCodeHighlight } from 'shared/components/CustomCodeHighlight'
import moment from 'moment/moment'

class SettingsBoostBitswapLimits extends PureComponent {
    render() {
        const {
            errors,
            touched,
            isSubmitting,
            currentAddress,
            onBitswapMaxBandwidthUnitChange,
            t,
        } = this.props

        return (
            <Form enableReinitialize>
                <Row>
                    <h5 className="mb-4">{t('client.bitswap.title')}</h5>

                    <Row>
                        <Col xs="12" md="12">
                            <Trans t={t} i18nKey="client.bitswap.description">
                                {
                                    'booster-bitswap can be configured to fetch its config from CIDgravity;'
                                }
                                <a
                                    href={
                                        'https://boost.filecoin.io/bitswap-retrieval#request-filtering'
                                    }
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    boost documentation
                                </a>
                                {
                                    'The magic happen when you start booster-bitswap with 2 additional parameters:'
                                }
                            </Trans>

                            <div
                                style={{
                                    marginTop: '20px',
                                    marginBottom: '20px',
                                }}
                            >
                                <CustomCodeHighlight
                                    text={
                                        'booster-bitswap run --api-filter-endpoint ' +
                                        'https://api.cidgravity.com/api/integration/boost ' +
                                        '--api-filter-auth "' +
                                        currentAddress.token +
                                        '"'
                                    }
                                />
                            </div>

                            <h6
                                style={{
                                    marginTop: '30px',
                                }}
                            >
                                <Label className="form-label">
                                    {t('client.bitswap.recentActivity.title')}
                                </Label>
                            </h6>

                            {currentAddress.statusCheck &&
                            currentAddress.statusCheck.boostBitswapLastCheck ? (
                                <>
                                    {t(
                                        'client.bitswap.recentActivity.lastCheck',
                                        {
                                            datetime: moment(
                                                currentAddress.statusCheck
                                                    .boostBitswapLastCheck
                                            ).format('DD/MM/YY HH:mm:ss'),
                                        }
                                    )}
                                </>
                            ) : (
                                <>
                                    {t(
                                        'client.bitswap.recentActivity.noMostRecentActivity'
                                    )}
                                </>
                            )}
                        </Col>
                    </Row>

                    <Row className="mt-4">
                        <Col xs="4" md="4" style={{ marginTop: '20px' }}>
                            <FormGroup>
                                <Label
                                    for="bitswap-simultaneous-requests"
                                    className="form-label"
                                >
                                    {t(
                                        'client.bitswap.simultaneousRequests.label'
                                    )}
                                </Label>{' '}
                                *
                                <i
                                    style={{
                                        marginTop: '4px',
                                    }}
                                    data-for="bitswapSimultaneousRequests"
                                    data-tip={t(
                                        'client.bitswap.simultaneousRequests.info'
                                    )}
                                    className="ms-4 fas fa-info-circle fa-sm"
                                />
                                <ReactTooltip
                                    place="bottom"
                                    id="bitswapSimultaneousRequests"
                                />
                                <Field
                                    id="bitswap-simultaneous-requests"
                                    className="form-control"
                                    name="bitswapSimultaneousRequests"
                                />
                                {touched.bitswapSimultaneousRequests &&
                                    errors.bitswapSimultaneousRequests && (
                                        <small className="text-danger">
                                            {t(
                                                `${errors.bitswapSimultaneousRequests}`
                                            )}
                                        </small>
                                    )}
                            </FormGroup>
                        </Col>

                        <Col xs="4" md="4" style={{ marginTop: '20px' }}>
                            <FormGroup>
                                <Label
                                    for="bitswap-simultaneous-requests-per-peer"
                                    className="form-label"
                                >
                                    {t(
                                        'client.bitswap.simultaneousRequestsPerPeer.label'
                                    )}
                                </Label>{' '}
                                *
                                <i
                                    style={{
                                        marginTop: '4px',
                                    }}
                                    data-for="bitswapSimultaneousRequestsPerPeer"
                                    data-tip={t(
                                        'client.bitswap.simultaneousRequestsPerPeer.info'
                                    )}
                                    className="ms-4 fas fa-info-circle fa-sm"
                                />
                                <ReactTooltip
                                    place="bottom"
                                    id="bitswapSimultaneousRequestsPerPeer"
                                />
                                <Field
                                    id="bitswap-simultaneous-requests-per-peer"
                                    className="form-control"
                                    name="bitswapSimultaneousRequestsPerPeer"
                                />
                                {touched.bitswapSimultaneousRequestsPerPeer &&
                                    errors.bitswapSimultaneousRequestsPerPeer && (
                                        <small className="text-danger">
                                            {t(
                                                `${errors.bitswapSimultaneousRequestsPerPeer}`
                                            )}
                                        </small>
                                    )}
                            </FormGroup>
                        </Col>

                        <Col xs="4" md="4" style={{ marginTop: '20px' }}>
                            <FormGroup>
                                <Label
                                    for="bitswap-max-bandwidth"
                                    className="form-label"
                                >
                                    {t('client.bitswap.maxBandwidth.label')}
                                </Label>{' '}
                                *
                                <i
                                    style={{
                                        marginTop: '4px',
                                    }}
                                    data-for="bitswapMaxBandwidth"
                                    data-tip={t(
                                        'client.bitswap.maxBandwidth.info'
                                    )}
                                    className="ms-4 fas fa-info-circle fa-sm"
                                />
                                <ReactTooltip
                                    place="bottom"
                                    id="bitswapMaxBandwidth"
                                />
                                <div className="input-group">
                                    <Field
                                        className="form-control"
                                        name="bitswapMaxBandwidth"
                                        id="bitswap-max-bandwidth"
                                    />

                                    <div className="input-group-prepend">
                                        <select
                                            onChange={
                                                onBitswapMaxBandwidthUnitChange
                                            }
                                            className="form-select"
                                            defaultValue={
                                                currentAddress.settings
                                                    .bitswapMaxBandwidthUnit ||
                                                'mb'
                                            }
                                        >
                                            <option value="b">
                                                {t(
                                                    'client.bitswap.maxBandwidth.unit.B'
                                                )}
                                            </option>
                                            <option value="kb">
                                                {t(
                                                    'client.bitswap.maxBandwidth.unit.KB'
                                                )}
                                            </option>
                                            <option value="mb">
                                                {t(
                                                    'client.bitswap.maxBandwidth.unit.MB'
                                                )}
                                            </option>
                                            <option value="gb">
                                                {t(
                                                    'client.bitswap.maxBandwidth.unit.GB'
                                                )}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                {touched.bitswapMaxBandwidth &&
                                    errors.bitswapMaxBandwidth && (
                                        <small className="text-danger">
                                            {t(`${errors.bitswapMaxBandwidth}`)}
                                        </small>
                                    )}
                            </FormGroup>
                        </Col>
                    </Row>
                </Row>

                <Row className="mt-2">
                    <Col className="text-start">
                        <i>{t('zeroMeanNoLimits')}</i>
                    </Col>

                    <Col className="text-end">
                        <Button
                            disabled={
                                Array.isArray(errors) ||
                                Object.values(errors).toString() !== '' ||
                                isSubmitting
                            }
                            type="submit"
                            className="custom-cidg-button"
                        >
                            {t('client.bitswap.button.save')}
                        </Button>
                    </Col>
                </Row>
            </Form>
        )
    }
}

const formikConfig = {
    displayName: 'SettingsBoostBitswapLimits',

    mapPropsToValues: ({ currentAddress }) => ({
        bitswapSimultaneousRequests:
            currentAddress.settings.bitswapSimultaneousRequests,
        bitswapSimultaneousRequestsPerPeer:
            currentAddress.settings.bitswapSimultaneousRequestsPerPeer,
        bitswapMaxBandwidth: currentAddress.settings.bitswapMaxBandwidth,
    }),

    validationSchema: () =>
        yup.object().shape({
            bitswapSimultaneousRequests: yup
                .number()
                .typeError('validation.isInvalidValue')
                .min(0, 'validation.isNotPositiveValue')
                .required('validation.isRequiredValue'),
            bitswapSimultaneousRequestsPerPeer: yup
                .number()
                .typeError('validation.isInvalidValue')
                .min(0, 'validation.isNotPositiveValue')
                .required('validation.isRequiredValue'),
            bitswapMaxBandwidth: yup
                .number()
                .typeError('validation.isInvalidValue')
                .min(0, 'validation.isNotPositiveValue')
                .required('validation.isRequiredValue'),
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
    withFormik(formikConfig)(
        withTranslation('SettingsBoostBitswapLimits')(
            SettingsBoostBitswapLimits
        )
    )
)
