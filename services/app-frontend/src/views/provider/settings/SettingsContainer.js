import React, { PureComponent } from 'react'

import { Container, Row, Col, Label, Button } from 'reactstrap'
import { withAuth0 } from '@auth0/auth0-react'
import { isMobile } from 'react-device-detect'
import { Loader } from 'shared/components'

import {
    GetCurrentAddress,
    RegenerateConnectorToken,
    UpdateAddressFriendlyName,
    UpdateAddressSettings,
} from 'shared/services/addresses_claim'
import { toast } from 'react-toastify'
import {
    ConfirmRegenerateToken,
    ConfirmEnableMinerStatusChecker,
} from 'shared/modals'
import 'react-tabs/style/react-tabs.css'

import moment from 'moment'
import Switch from 'react-switch'
import ReactTooltip from 'react-tooltip'
import { withTranslation } from 'react-i18next'
import { FormControlLabel } from '@mui/material'

import { TOKEN_REFRESHED_DISPATCH_EVENT } from 'config/constants'
import { CustomCodeHighlight } from 'shared/components/CustomCodeHighlight'

import SettingsGlobalLimits from './forms/SettingsGlobalLimits'
import SettingsBoostBitswapLimits from './forms/SettingsBoostBitswapLimits'
import SettingsMaxPublishDealsFee from './forms/SettingsMaxPublishDealsFee'
import SettingsStartEpochSealingBuffer from './forms/SettingsStartEpochSealingBuffer'

import { toReadableDurationFormatNew, toReadableSize } from 'shared/utils/file_size'
import { convertToAtto } from 'shared/utils/fil'

import {
    SendProposalTest,
    CheckForTestResponseAvailable,
    CheckErrorCodeHandled,
} from 'shared/services/cidg-services/miner-status-checker'

class SettingsContainer extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            isError: false,
            confirmRegenerateTokenModalOpened: false,
            confirmEnableMinerStatusCheckerModalOpened: false,
            tokenScopes: [],
            accessToken: '',
            tokenIsVisible: false,
            customMessageValue: '',
            displayMinerStatusCheckSettings: false,
            currentAddress: {
                address: '',
                actorType: '',
                friendlyName: '',
                createdOn: '',
                permissions: '',
                authProvider: '',
                token: '',
                settings: {
                    workMode: false,
                    customMessage: '',
                    acceptDealsFromUnkown: false,
                    storageGlobalHourlyDealLimit: '',
                    storageGlobalHourlyDealSizeLimit: '',
                    retrievalGlobalHourlyDealLimit: '',
                    bitswapSimultaneousRequests: '',
                    bitswapSimultaneousRequestsPerPeer: '',
                    bitswapMaxBandwidth: '',
                    bitswapMaxBandwidthUnit: 'MB',
                    startEpochSealingBuffer: '',
                    maxPublishDealsFee: '',
                    enableStatusCheckService: false,
                },
                statusCheck: {
                    isAvailable: false,
                    connectorVersion: '',
                    lastCheck: '',
                    lastCheckSuccessful: '',
                    boostBitswapLastCheck: null,
                    proposalVersion: '',
                    agent: '',
                    errorCode: '',
                },
            },
            enableMinerStatusSettingIsLoading: false,
        }
    }

    async componentDidMount() {
        await this.loadAddressProfileFromAPI()
    }

    loadAddressProfileFromAPI = async () => {
        try {
            const response = await GetCurrentAddress()

            if (response.data) {
                this.setState({
                    isLoading: false,
                    currentAddress: response.data,
                    displayMinerStatusCheckSettings:
                        response.data.actorType === 'storageminer',
                })
            }
        } catch (error) {
            this.setState({ isLoading: false, isError: true })
            console.error(error)
        }
    }

    handleAcceptDealsFromUnkown = async (checked) => {
        const updatedSettings = this.state.currentAddress.settings
        updatedSettings.acceptDealsFromUnkown = checked
        await this.handleUpdateAddressSettings(updatedSettings)
    }

    handleConfirmEnableMinerStatusCheckerModal = async (checked) => {
        // Open the disclaimer modal, the test will be launched only after user confirmation
        // If the user want to disable this setting, just update the setting without test or disclaimer
        if (checked) {
            this.setState({
                confirmEnableMinerStatusCheckerModalOpened:
                    !this.state.confirmEnableMinerStatusCheckerModalOpened,
            })
        } else {
            const updatedSettings = this.state.currentAddress.settings
            updatedSettings.enableStatusCheckService = checked
            await this.handleUpdateAddressSettings(updatedSettings)
        }
    }

    handleConfirmEnableMinerStatusCheck = () => {
        this.setState({
            enableMinerStatusSettingIsLoading: true,
            confirmEnableMinerStatusCheckerModalOpened: false,
        })
        this.handleTestMinerStatusBeforeEnablingSetting()
    }

    handleUpdateMinerStatusCheckerSettingAfterTest = async (
        status,
        isInternalError
    ) => {
        const { t } = this.props

        if (status) {
            const updatedSettings = this.state.currentAddress.settings
            updatedSettings.enableStatusCheckService = true
            await this.handleUpdateAddressSettings(updatedSettings)
            toast.update('minerStatusCheckTestToast', {
                render: t('notification.success.onMinerStatusCheckChanged'),
                type: 'success',
                isLoading: false,
                autoClose: 6000,
            })
        } else {
            if (isInternalError) {
                toast.update('minerStatusCheckTestToast', {
                    render: t(
                        'notification.error.onMinerStatusCheckServiceUnavailable'
                    ),
                    type: 'warning',
                    isLoading: false,
                    autoClose: 6000,
                })
            } else {
                toast.update('minerStatusCheckTestToast', {
                    render: t(
                        'notification.error.onMinerStatusCheckNotReachable'
                    ),
                    type: 'error',
                    isLoading: false,
                    autoClose: 6000,
                })
            }
        }

        // Set the test / procedure as finished
        this.setState({ enableMinerStatusSettingIsLoading: false })
    }

    handleTestMinerStatusBeforeEnablingSetting = () => {
        const { t } = this.props

        toast.loading(t('notification.info.onMinerStatusCheckTestLoading'), {
            toastId: 'minerStatusCheckTestToast',
            type: 'info',
        })

        SendProposalTest()
            .then((resSendTestProposal) => {
                let numberTries = 0

                const interval = setInterval(() => {
                    CheckForTestResponseAvailable(
                        resSendTestProposal.data.checkId
                    )
                        .then((resCheckBoostResponse) => {
                            if (resCheckBoostResponse.status === 204) {
                                numberTries++

                                // Wait for 6 retries = 30 seconds
                                if (numberTries > 6) {
                                    clearInterval(interval)
                                    this.handleUpdateMinerStatusCheckerSettingAfterTest(
                                        false,
                                        false
                                    )
                                }
                            } else if (resCheckBoostResponse.status === 200) {
                                // If miner is available, return true to enable the setting
                                // If not return false
                                // In case on unhandled error code or CIDGRAVITY_SIDE_ERROR, return true to enable the setting
                                if (
                                    resCheckBoostResponse.data.status ===
                                    'available'
                                ) {
                                    this.handleUpdateMinerStatusCheckerSettingAfterTest(
                                        true,
                                        false
                                    )
                                } else {
                                    if (
                                        CheckErrorCodeHandled(
                                            resCheckBoostResponse.data.errorCode
                                        )
                                    ) {
                                        this.handleUpdateMinerStatusCheckerSettingAfterTest(
                                            resCheckBoostResponse.data
                                                .isAvailable,
                                            false
                                        )
                                    } else {
                                        this.handleUpdateMinerStatusCheckerSettingAfterTest(
                                            false,
                                            true
                                        )
                                    }
                                }

                                clearInterval(interval)
                            }
                        })
                        .catch(() => {
                            clearInterval(interval)
                            this.handleUpdateMinerStatusCheckerSettingAfterTest(
                                false,
                                true
                            )
                        })
                }, 5000)
            })
            .catch(() => {
                this.handleUpdateMinerStatusCheckerSettingAfterTest(false, true)
            })
    }

    handleUpdateAddressSettings = async (settings) => {
        const { t } = this.props

        try {
            const response = await UpdateAddressSettings(settings)

            if (response.data) {
                this.setState({
                    currentAddress: {
                        ...this.state.currentAddress,
                        settings: settings,
                    },
                })

                toast.success(t('notification.success.onUpdateSettings'))
            }
        } catch (error) {
            toast.error(t('notification.error.onUpdateSettings'))
            console.error('Error while updating your settings', error)
        }
    }

    handleSubmitGlobalLimits = (values) => {
        const updatedSettings = {
            ...this.state.currentAddress.settings,
            storageGlobalHourlyDealLimit: parseInt(
                values.storageGlobalHourlyDealLimit,
                10
            ),
            storageGlobalHourlyDealSizeLimit: toReadableSize(
                'GiB',
                'B',
                values.storageGlobalHourlyDealSizeLimit
            ),
            retrievalGlobalHourlyDealLimit: parseInt(
                values.retrievalGlobalHourlyDealLimit,
                10
            ),
            bitswapSimultaneousRequests: parseInt(
                values.bitswapSimultaneousRequests,
                10
            ),
            bitswapSimultaneousRequestsPerPeer: parseInt(
                values.bitswapSimultaneousRequestsPerPeer,
                10
            ),
            BitswapMaxBandwidth: parseInt(values.bitswapMaxBandwidth, 10),
        }

        return this.handleUpdateAddressSettings(updatedSettings)
    }

    handleSubmitBoostBitswapLimits = (values) => {
        const updatedSettings = {
            ...this.state.currentAddress.settings,
            bitswapSimultaneousRequests: parseInt(
                values.bitswapSimultaneousRequests,
                10
            ),
            bitswapSimultaneousRequestsPerPeer: parseInt(
                values.bitswapSimultaneousRequestsPerPeer,
                10
            ),
            BitswapMaxBandwidth: parseInt(values.bitswapMaxBandwidth, 10),
        }

        return this.handleUpdateAddressSettings(updatedSettings)
    }

    handleBitswapMaxBandwidthUnitChange = (e) => {
        const updatedSettings = this.state.currentAddress.settings
        updatedSettings.bitswapMaxBandwidthUnit = e.target.value

        this.setState({
            currentAddress: {
                ...this.state.currentAddress,
                settings: updatedSettings,
            },
        })
    }

    handleConfirmRegenerateTokenModal = () => {
        this.setState({
            confirmRegenerateTokenModalOpened:
                !this.state.confirmRegenerateTokenModalOpened,
        })
    }

    handleCustomMessagesTextareaChange = (event) => {
        const updatedSettings = this.state.currentAddress.settings
        updatedSettings.customMessage = event.target.value

        this.setState({
            currentAddress: {
                ...this.state.currentAddress,
                settings: updatedSettings,
            },
        })
    }

    handleFriendlyNameChange = (event) => {
        this.setState({
            currentAddress: {
                ...this.state.currentAddress,
                friendlyName: event.target.value,
            },
        })
    }

    saveCustomMessage = async () => {
        const updatedSettings = this.state.currentAddress.settings
        const { t } = this.props

        try {
            const response = await UpdateAddressSettings(updatedSettings)

            if (response.data) {
                toast.success(t('notification.success.onUpdateCustomMessage'))
            }
        } catch (error) {
            toast.error(t('notification.error.onUpdateCustomMessage'))
            console.error(error)
        }
    }

    handleSubmitMaxPublishDealsFee = (values) => {
        const updatedSettings = {
            ...this.state.currentAddress.settings,
            maxPublishDealsFee: convertToAtto(values.maxPublishDealsFee)
        }

        return this.handleUpdateAddressSettings(updatedSettings)
    }

    handleSubmitStartEpochSealingBuffer = (values) => {
        const updatedSettings = {
            ...this.state.currentAddress.settings,
            startEpochSealingBuffer: toReadableDurationFormatNew('Hours', 'Epochs', values.startEpochSealingBuffer)
        }

        return this.handleUpdateAddressSettings(updatedSettings)
    }

    saveFriendlyName = async () => {
        const { t } = this.props
        try {
            const response = await UpdateAddressFriendlyName(
                this.state.currentAddress
            )

            if (response.status === 200) {
                toast.success(t('notification.success.onUpdateFriendlyName'))
                window.dispatchEvent(new Event(TOKEN_REFRESHED_DISPATCH_EVENT))
            }
        } catch (error) {
            toast.error(t('notification.error.onUpdateFriendlyName'))
            console.error(error)
        }
    }

    regenerateMyConnectorToken = async () => {
        const { t } = this.props
        try {
            const response = await RegenerateConnectorToken()

            if (response.data) {
                this.setState({
                    currentAddress: {
                        ...this.state.currentAddress,
                        token: response.data,
                    },
                    confirmRegenerateTokenModalOpened: false,
                })

                toast.success(
                    t('notification.success.onRegenerateConnectorToken')
                )
            }
        } catch (error) {
            toast.error(t('notification.error.onRegenerateConnectorToken'))
            this.setState({
                isLoading: false,
                isError: true,
                confirmRegenerateTokenModalOpened: false,
            })
            console.error(error)
        }
    }

    render() {
        const {
            isLoading,
            currentAddress,
            confirmRegenerateTokenModalOpened,
            confirmEnableMinerStatusCheckerModalOpened,
            displayMinerStatusCheckSettings,
            enableMinerStatusSettingIsLoading,
        } = this.state
        const { t } = this.props

        return (
            <Container className="settings-container">
                <Row className="mt-4 mb-4">
                    <Col xs={12} md={6}>
                        <h1>{t('title')}</h1>
                    </Col>
                </Row>

                {isLoading ? (
                    <Loader />
                ) : currentAddress ? (
                    <>
                        <Row style={{ marginTop: 60 + 'px' }}>
                            <Col xs={'12'} md={'12'}>
                                <div className="card">
                                    <Row className="p-4">
                                        <Col id="connectorToken">
                                            <h5>
                                                {t('other.connector.title')}
                                                <span>
                                                    <i
                                                        style={{
                                                            marginTop: '4px',
                                                        }}
                                                        data-for="CIDgravityConnectorInfo"
                                                        data-tip={t(
                                                            'other.connector.info'
                                                        )}
                                                        className="ms-4 fas fa-info-circle fa-sm"
                                                    />

                                                    <ReactTooltip
                                                        place="bottom"
                                                        id="CIDgravityConnectorInfo"
                                                        html={true}
                                                    />
                                                </span>
                                            </h5>

                                            <a
                                                href={
                                                    'https://github.com/CIDgravity/CIDgravity-X'
                                                }
                                                rel="noopener noreferrer"
                                                target="_blank"
                                            >
                                                {t(
                                                    'other.connector.downloadLink'
                                                )}
                                            </a>

                                            <br />

                                            {currentAddress.statusCheck ? (
                                                <>
                                                    {currentAddress.statusCheck
                                                        .errorCode === '' ||
                                                    currentAddress.statusCheck
                                                        .errorCode === null ? (
                                                        <>
                                                            {t(
                                                                'other.connector.mostRecentActivity',
                                                                {
                                                                    agent:
                                                                        currentAddress
                                                                            .statusCheck
                                                                            .agent,
                                                                    version:
                                                                        currentAddress
                                                                            .statusCheck
                                                                            .connectorVersion,
                                                                    datetime:
                                                                        moment(
                                                                            currentAddress
                                                                                .statusCheck
                                                                                .lastCheck
                                                                        ).format(
                                                                            'DD/MM/YY HH:mm:ss'
                                                                        ),
                                                                }
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            {t(
                                                                'other.connector.mostRecentActivityError',
                                                                {
                                                                    errorCode:
                                                                        t(
                                                                            `other.connector.activityErrorCodes.${currentAddress.statusCheck.errorCode}`
                                                                        ),
                                                                    lastCheck:
                                                                        moment(
                                                                            currentAddress
                                                                                .statusCheck
                                                                                .lastCheck
                                                                        ).format(
                                                                            'DD/MM/YY HH:mm:ss'
                                                                        ),
                                                                }
                                                            )}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {t(
                                                        'other.connector.noMostRecentActivity'
                                                    )}
                                                </>
                                            )}

                                            {/* Status checker switch */}
                                            {displayMinerStatusCheckSettings && (
                                                <>
                                                    <h6
                                                        style={{
                                                            marginTop: '30px',
                                                        }}
                                                    >
                                                        <Label className="form-label">
                                                            {t(
                                                                'other.minerStatusCheck.title'
                                                            )}
                                                        </Label>
                                                    </h6>

                                                    <div className="mb-4">
                                                        {t(
                                                            'other.minerStatusCheck.info'
                                                        )}

                                                        <div>
                                                            <FormControlLabel
                                                                className="mt-4"
                                                                style={{
                                                                    marginLeft:
                                                                        5 +
                                                                        'px',
                                                                }}
                                                                control={
                                                                    <Switch
                                                                        onChange={
                                                                            this
                                                                                .handleConfirmEnableMinerStatusCheckerModal
                                                                        }
                                                                        checked={
                                                                            currentAddress
                                                                                .settings
                                                                                .enableStatusCheckService
                                                                        }
                                                                        disabled={
                                                                            enableMinerStatusSettingIsLoading
                                                                        }
                                                                        height={
                                                                            20
                                                                        }
                                                                        width={
                                                                            40
                                                                        }
                                                                    />
                                                                }
                                                                labelPlacement="end"
                                                                label={
                                                                    <small className="p-2 form-label">
                                                                        {t(
                                                                            'other.minerStatusCheck.label'
                                                                        )}
                                                                    </small>
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Connector token */}
                                            <h6
                                                style={{
                                                    marginTop: '30px',
                                                }}
                                            >
                                                <Label className="form-label">
                                                    {t(
                                                        'other.connector.token.title'
                                                    )}
                                                </Label>

                                                <span
                                                    onClick={
                                                        this
                                                            .handleConfirmRegenerateTokenModal
                                                    }
                                                >
                                                    <i
                                                        className="ms-4 fa fa-refresh fa-sm copy-btn"
                                                        data-for="regenerate"
                                                        data-tip={t(
                                                            'other.connector.token.regenerate'
                                                        )}
                                                    />

                                                    <ReactTooltip
                                                        place="bottom"
                                                        id="regenerate"
                                                    />
                                                </span>
                                            </h6>

                                            <div className="mb-4">
                                                {t(
                                                    'other.connector.token.subtitle'
                                                )}
                                            </div>

                                            {currentAddress.token && (
                                                <CustomCodeHighlight
                                                    text={currentAddress.token}
                                                />
                                            )}
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                        </Row>

                        <Row className="mt-4 mb-4">
                            {/* Unknown client */}
                            <Col
                                xs={isMobile ? '12' : '4'}
                                md={isMobile ? '12' : '4'}
                                className={isMobile ? 'mb-4' : ''}
                            >
                                <div
                                    className="card p-4"
                                    style={
                                        !isMobile ? { height: 200 + 'px' } : {}
                                    }
                                >
                                    <h5 className="mb-4">
                                        {t('client.unknownClient.title')}
                                    </h5>

                                    <div id="unknownClient" className="mb-3">
                                        <FormControlLabel
                                            className="mt-2"
                                            style={{ marginLeft: 5 + 'px' }}
                                            control={
                                                <Switch
                                                    onChange={
                                                        this
                                                            .handleAcceptDealsFromUnkown
                                                    }
                                                    checked={
                                                        currentAddress.settings
                                                            .acceptDealsFromUnkown
                                                    }
                                                    height={20}
                                                    width={40}
                                                />
                                            }
                                            labelPlacement="end"
                                            label={
                                                <>
                                                    <small className="p-2 form-label">
                                                        {t(
                                                            'client.unknownClient.label'
                                                        )}
                                                    </small>

                                                    <i
                                                        style={{
                                                            marginTop: '4px',
                                                        }}
                                                        data-for="size"
                                                        data-tip={t(
                                                            'client.unknownClient.info'
                                                        )}
                                                        className="ms-4 fas fa-info-circle"
                                                    />

                                                    <ReactTooltip
                                                        place="bottom"
                                                        id="size"
                                                    />
                                                </>
                                            }
                                        />
                                    </div>
                                </div>
                            </Col>

                            {/* Start epoch sealing buffer */}
                            <Col xs={isMobile ? '12' : '4'} md={isMobile ? '12' : '4'}>
                                <SettingsStartEpochSealingBuffer 
                                    onSubmit={this.handleSubmitStartEpochSealingBuffer}
                                    currentAddress={currentAddress}
                                />
                            </Col>

                            {/* MaxPublishDealsFee */}
                            <Col xs={isMobile ? '12' : '4'} md={isMobile ? '12' : '4'}>
                                <SettingsMaxPublishDealsFee 
                                    onSubmit={this.handleSubmitMaxPublishDealsFee}
                                    currentAddress={currentAddress}
                                />
                            </Col>
                        </Row>

                        {/* Limits (including bitswap) */}
                        <Row className="mt-4 mb-4">
                            <Col
                                xs={isMobile ? '12' : '12'}
                                md={isMobile ? '12' : '12'}
                            >
                                <div className="card p-4">
                                    <SettingsGlobalLimits
                                        onSubmit={this.handleSubmitGlobalLimits}
                                        currentAddress={currentAddress}
                                    />
                                </div>
                            </Col>
                        </Row>

                        <Row className="mt-4 mb-4">
                            <Col
                                xs={isMobile ? '12' : '12'}
                                md={isMobile ? '12' : '12'}
                            >
                                <div className="card p-4">
                                    <SettingsBoostBitswapLimits
                                        onSubmit={
                                            this.handleSubmitBoostBitswapLimits
                                        }
                                        onBitswapMaxBandwidthUnitChange={
                                            this
                                                .handleBitswapMaxBandwidthUnitChange
                                        }
                                        currentAddress={currentAddress}
                                    />
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            {/* Friendly name */}
                            <Col
                                xs={isMobile ? '12' : '6'}
                                md={isMobile ? '12' : '6'}
                                className="mb-4"
                            >
                                <div
                                    className="card mt-4 p-3"
                                    style={
                                        !isMobile ? { height: 180 + 'px' } : {}
                                    }
                                >
                                    <h5 className="mb-2">
                                        {t('other.friendlyName.title')}
                                    </h5>

                                    <input
                                        className="form-control mt-3"
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={currentAddress.friendlyName}
                                        onChange={this.handleFriendlyNameChange}
                                    />

                                    <div
                                        className="text-end mt-4 "
                                        onClick={() => this.saveFriendlyName()}
                                    >
                                        <Button className="custom-cidg-button">
                                            {t(
                                                'other.friendlyName.button.save'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Col>

                            {/* Custom message */}
                            <Col xs={isMobile ? '12' : '6'} md={isMobile ? '12' : '6'} className="mb-4">
                                <div className="card mt-4 p-3" style={!isMobile ? { height: 180 + 'px' } : {}}>
                                    <h5 className="mb-2">
                                        {t('other.customMessage.title')}
                                        <i
                                            style={{ marginTop: '4px' }}
                                            data-for="customMessageInfo"
                                            data-tip={t('other.customMessage.info')}
                                            className="ms-4 fas fa-info-circle fa-sm"
                                        />
                                        <ReactTooltip place="bottom" id="customMessageInfo" />
                                    </h5>

                                    <textarea
                                        maxLength="380"
                                        className="form-control mt-3"
                                        placeholder={t('other.customMessage.placeholder')}
                                        onChange={this.handleCustomMessagesTextareaChange}
                                        value={currentAddress.settings.customMessage}
                                    />

                                    <div
                                        className="text-end mt-4"
                                        onClick={() => this.saveCustomMessage()}
                                    >
                                        <Button className="custom-cidg-button">
                                            {t(
                                                'other.customMessage.button.save'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </>
                ) : (
                    <div
                        className="alert alert-danger"
                        role="alert"
                        style={{ marginTop: '50px' }}
                    >
                        {t('error.generic')}
                    </div>
                )}

                {confirmRegenerateTokenModalOpened && (
                    <ConfirmRegenerateToken
                        isModalOpened={confirmRegenerateTokenModalOpened}
                        handleModal={this.handleConfirmRegenerateTokenModal}
                        handleSubmitRegenerate={this.regenerateMyConnectorToken}
                    />
                )}

                {confirmEnableMinerStatusCheckerModalOpened && (
                    <ConfirmEnableMinerStatusChecker
                        isModalOpened={
                            confirmEnableMinerStatusCheckerModalOpened
                        }
                        handleModal={
                            this.handleConfirmEnableMinerStatusCheckerModal
                        }
                        handleConfirm={this.handleConfirmEnableMinerStatusCheck}
                    />
                )}
            </Container>
        )
    }
}

export default withAuth0(
    withTranslation('SettingsContainer')(SettingsContainer)
)
