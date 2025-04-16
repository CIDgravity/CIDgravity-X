import React, { PureComponent } from 'react'

import { isMobile } from 'react-device-detect'
import { withAuth0 } from '@auth0/auth0-react'
import { Col, Row } from 'reactstrap'
import { toast } from 'react-toastify'
import { Loader } from 'shared/components'
import { Trans, withTranslation } from 'react-i18next'

import { GetCurrentAddress } from 'shared/services/addresses_claim'

import {
    toReadableSize,
    toReadableDurationFormatNew,
    convertBytesToGiB
} from 'shared/utils/file_size'
import {
    convertToDealProposal,
    getPaddingForDealSize,
    ParseStandardizedProposalToAcceptanceLogicValues,
} from 'shared/utils/deal-proposals'
import {
    SendFromPlayground,
    GetDealProposalByIdFromReporting,
} from 'shared/services/deal-proposals'
import { GetAllClientsForCurrentUser } from 'shared/services/client'
import { clientArrayToSelectObjectWithAddresses } from 'shared/utils/array-utils'
import { getFilecoinAddressIfValidAndSupported } from 'shared/utils/filecoinUtil'

import { GetLatestMessariTicker } from 'shared/services/integration'
import { computePriceEquivalence, convertToFilecoinRate } from 'shared/utils/fil'

import SyntaxHighlighter from 'react-syntax-highlighter'
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import PlaygroundForm from './PlaygroundForm'

const dayjs = require('dayjs')
class PlaygroundContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            isError: false,
            isLoading: true,
            selectedDealSize: '32',
            selectedSizeUnit: 'GiB',
            selectedDealDuration: '180',
            selectedDurationUnit: 'Days',
            selectedDealVerified: true,
            selectedDealTransferType: 'manual',
            selectedDealType: 'storage',
            selectedPrice: 0,
            selectedPriceCurrency: 'usd_tib_month',
            selectedPriceFor30DaysFil: 0,
            selectedPriceFor30DaysUsd: 0,
            selectedPriceFilGibEpoch: 0,
            loadingResults: false,
            simulateFromHistory: false,
            sealingPipelineValuesToSimulate: [
                {
                    label: 'ReceivedOnDatetime',
                    state: 'ReceivedOnDatetime',
                    value: new Date(dayjs().unix()),
                },
            ],

            testResults: {
                decision: '',
                matchingPricing: '',
                matchingRule: 0,
                externalMessage: '',
                internalMessage: '',
                acceptanceLogicUsed: null, // this is always null except if rejected due to acceptance logic not passed
            },

            currentAddress: {
                settings: {
                    startEpochSealingBuffer: '',
                },
            },

            messariTicker: {
                data: {
                    market_data: {
                        price_usd: null,
                        price_btc: null,
                        price_eth: null
                    }
                },
                status: {
                    timestamp: null
                }
            },

            clientsAddresses: [],
            selectedAddress: '',
        }
    }

    componentDidMount = async () => {
        // Load address settings to get the sealing buffer value
        try {
            const response = await GetCurrentAddress()

            if (response.data) {
                this.setState({ currentAddress: response.data })
            }
        } catch (error) {
            this.setState({ isLoading: false, isError: true })
            console.error(error)
        }

        // load messari ticker data
        try {
            const response = await GetLatestMessariTicker()
            this.setState({ messariTicker: response.data })
        } catch (error) {
            this.setState({ error: true })
        }

        // load addresses and proposal if needed
        const knownClientAddresses =
            await this.loadAddClientsWithAddresseSelectFormat()

        if (this.props.match.params.dealProposalId !== undefined) {
            await this.loadDealProposalById(
                this.props.match.params.dealProposalId,
                knownClientAddresses
            )
        }
    }

    loadDealProposalById = async (id, knownClientAddresses) => {
        const { messariTicker } = this.state;
        this.setState({ isLoading: true })

        try {
            const response = await GetDealProposalByIdFromReporting(
                parseInt(id)
            )

            if (response && response.data !== null) {
                const jsonProposal = response.data?.standardizedProposal
                const startEpoch = parseInt(jsonProposal?.Proposal?.StartEpoch)
                const endEpoch = parseInt(jsonProposal?.Proposal.EndEpoch)
                const rawAddress = jsonProposal.Proposal?.Client

                // Because the proposal can be sent by an address not existing in client list
                // We need to check this to avoid errors
                let label = knownClientAddresses.find(
                    (element) => element.value === rawAddress
                )

                // fill sealingPipelineValuesToSimulate from standardized proposal
                // in this case, it's not necessary to convert basefee from attoFil to nanoFil
                // because input will be in attoFil directly, due to values after comma (can't be rounded to avoid precision loss)
                // Also pass response.data, to get the receivedOn data (datetime analysed by CIDgravity)
                const acceptanceLogicValuesToSimulate =
                    ParseStandardizedProposalToAcceptanceLogicValues(
                        response.data,
                        jsonProposal
                    )

                this.setState({
                    simulateFromHistory: true,
                    selectedDealSize: response.data.dealSize,
                    selectedSizeUnit: 'B',
                    selectedDealVerified: jsonProposal?.Proposal?.VerifiedDeal,
                    selectedDealTransferType: jsonProposal?.TransferType,
                    selectedDealType: jsonProposal?.DealType,

                    // to avoid attoFil with commas, round down the result
                    selectedPrice: Math.floor(jsonProposal?.Proposal?.StoragePricePerEpoch / convertBytesToGiB(response.data.dealSize)),
                    selectedPriceCurrency: 'attofil_gib_epoch',
                    selectedPriceFor30DaysFil: computePriceEquivalence(jsonProposal?.Proposal?.StoragePricePerEpoch, "FIL"),
                    selectedPriceFor30DaysUsd: computePriceEquivalence(jsonProposal?.Proposal?.StoragePricePerEpoch, "USD", messariTicker.data.market_data.price_usd),
                    selectedPriceFilGibEpoch: -1,

                    selectedDealDuration: endEpoch - startEpoch,
                    selectedDurationUnit: 'Epochs',
                    selectedAddress: {
                        value: rawAddress,
                        label: !label ? rawAddress : label.label,
                    },
                    sealingPipelineValuesToSimulate:
                        acceptanceLogicValuesToSimulate,
                    isLoading: false,
                    isError: false,
                })
            } else {
                this.setState({ isError: true, isLoading: false })
            }
        } catch (error) {
            this.setState({ isError: true, isLoading: false })
            console.error(error)
        }
    }

    loadAddClientsWithAddresseSelectFormat = async () => {
        this.setState({ isLoading: true })

        try {
            const response = await GetAllClientsForCurrentUser()
            var addresses = []

            // Because if no client available, we must check for null value here
            if (response.data !== null) {
                addresses = clientArrayToSelectObjectWithAddresses(
                    response.data
                )
            }

            this.setState({ clientsAddresses: addresses, isLoading: false })
            return addresses
        } catch (error) {
            this.setState({ isError: true, isLoading: false })
        }
    }

    sendTest = async (values) => {
        const { t } = this.props
        const { selectedAddress, selectedPrice, currentAddress, sealingPipelineValuesToSimulate, simulateFromHistory, messariTicker } = this.state

        // Check the address format
        // If selected form client, format will be valid, but check also for manual address
        if (!getFilecoinAddressIfValidAndSupported(selectedAddress.value)) {
            return {
                status: false,
                message: t('validation.isFromAddressNotSupported'),
            }
        }

        // In order to convert to price to attoFIL, the input must be filled
        // Check before creating the storage deal proposal
        if (selectedPrice === null || selectedPrice.length === 0) {
            return {
                status: false,
                message: t('validation.isPriceMandatory'),
            }
        }

        if (selectedAddress) {
            const formValues = {
                dealVerified: this.state.selectedDealVerified,
                dealTransferType: this.state.selectedDealTransferType,
                dealType: this.state.selectedDealType,
                dealSize: getPaddingForDealSize(
                    toReadableSize(
                        this.state.selectedSizeUnit,
                        'B',
                        this.state.selectedDealSize
                    )
                ),
                dealSizeUnit: this.state.selectedSizeUnit,
                dealPrice: this.state.selectedPrice,
                dealPriceCurrency: this.state.selectedPriceCurrency,
                dealDuration: toReadableDurationFormatNew(
                    this.state.selectedDurationUnit,
                    'Epochs',
                    this.state.selectedDealDuration
                ),
                fromAddress: selectedAddress.value,
                sealingPipelineValuesToSimulate:
                    sealingPipelineValuesToSimulate,
            }

            // Check the values (dealSize can't be < 256 and duration limits are 180 days and 1278 days)
            if (
                formValues.dealDuration < 518400 ||
                formValues.dealDuration > 3680640
            ) {
                return {
                    status: false,
                    message: t('validation.isDurationOutsideLimits'),
                }
            }

            const convertedValues = convertToDealProposal(
                formValues,
                messariTicker.data.market_data.price_usd,
                currentAddress.settings.startEpochSealingBuffer,
                !simulateFromHistory
            )

            if (convertedValues.Proposal.PieceSize < 256) {
                return {
                    status: false,
                    message: t('validation.isProposalPieceSizeUnderLimit'),
                }
            }

            // If the form contains valid value, send the deal proposal to API
            // Set the results in the state, and we will display it on the page
            // to display the real rule index, increment by one (in backend first rule is index 0)
            try {
                const response = await SendFromPlayground(convertedValues)

                if (response.data) {
                    this.setState({
                        loadingResults: false,
                        testResults: {
                            ...response.data,
                            matchingRule: response.data.matchingRule + 1,
                        },
                    })

                    return {
                        status: true,
                        message: t('validation.isTestSuccessfullySent'),
                    }
                }
            } catch (error) {
                console.error(error)
                this.setState({
                    isError: true,
                    loadingResults: false,
                    testResults: null,
                })
                return {
                    status: false,
                    message: t('validation.isTestFailed'),
                }
            }
        } else {
            return {
                status: false,
                message: t('validation.isFromAddressMandatory'),
            }
        }
    }

    handleSizeUnitChange = (e) => {
        const { value } = e.target
        const { selectedSizeUnit, selectedDealSize } = this.state

        if (selectedSizeUnit !== value) {
            const convertedDealSize = parseInt(
                toReadableSize(selectedSizeUnit, value, selectedDealSize)
            ).toFixed(4)
            this.setState({
                selectedDealSize: convertedDealSize,
                selectedSizeUnit: value,
            })
        }
    }

    handlePriceCurrencyChange = (e) => {
        const { value } = e.target
        const { selectedPrice, messariTicker } = this.state;

        this.setState({ 
            selectedPriceCurrency: value,
            selectedPriceFor30DaysFil: value === 'attofil_gib_epoch' ? computePriceEquivalence(selectedPrice, "FIL") : -1,
            selectedPriceFor30DaysUsd: value === 'attofil_gib_epoch' ? computePriceEquivalence(selectedPrice, "USD", messariTicker.data.market_data.price_usd) : -1,
            selectedPriceFilGibEpoch: value === 'usd_tib_month' ? convertToFilecoinRate(selectedPrice, messariTicker.data.market_data.price_usd) : -1,
        })
    }

    handleInputValueChange = (input, e) => {
        const { messariTicker, selectedPriceCurrency } = this.state
        const { value } = e.target

        if (input === 'duration') {
            this.setState({ selectedDealDuration: value })
        } else if (input === 'size') {
            this.setState({ selectedDealSize: value })
        } else if (input === 'verified') {
            const newValue = value === 'true'
            this.setState({ selectedDealVerified: newValue })
        } else if (input === 'transferType') {
            this.setState({ selectedDealTransferType: value })
        } else if (input === 'dealType') {
            this.setState({ selectedDealType: value })
        } else if (input === 'price') {
            this.setState({ 
                selectedPrice: value,
                selectedPriceFor30DaysFil: selectedPriceCurrency === 'attofil_gib_epoch' ? computePriceEquivalence(value, "FIL") : -1,
                selectedPriceFor30DaysUsd: selectedPriceCurrency === 'attofil_gib_epoch' ? computePriceEquivalence(value, "USD", messariTicker.data.market_data.price_usd) : -1,
                selectedPriceFilGibEpoch: selectedPriceCurrency === 'usd_tib_month' ? convertToFilecoinRate(value, messariTicker.data.market_data.price_usd) : -1,
            })
        }
    }

    handleDurationUnitChange = (e) => {
        const { value } = e.target
        const { selectedDurationUnit, selectedDealDuration } = this.state

        if (selectedDurationUnit !== value) {
            const convertedDealDuration = toReadableDurationFormatNew(
                selectedDurationUnit,
                value,
                selectedDealDuration
            )
            this.setState({
                selectedDealDuration: convertedDealDuration,
                selectedDurationUnit: value,
            })
        }
    }

    handleAddressChange = (newValue) => {
        if (newValue) {
            const selectedOption = {
                value: newValue.value,
                label: newValue.value,
            }
            this.setState({ selectedAddress: selectedOption })
        } else {
            this.setState({ selectedAddress: null })
        }
    }

    handleAddressCreate = (inputValue) => {
        if (!getFilecoinAddressIfValidAndSupported(inputValue)) {
            toast.error(
                this.props.t('notification.error.isFromAddressNotSupported')
            )
        } else {
            const newOption = { value: inputValue, label: inputValue }
            this.setState({ selectedAddress: newOption })
        }
    }

    handleAcceptanceLogicTypeDropdownChange = (index, event) => {
        this.setState({
            sealingPipelineValuesToSimulate:
                this.state.sealingPipelineValuesToSimulate.map((item, i) =>
                    i === index ? { ...item, state: event.value, category: event.category } : item
                ),
        })
    }

    handleAcceptanceLogicValueChange = (index, value) => {
        this.setState({
            sealingPipelineValuesToSimulate:
                this.state.sealingPipelineValuesToSimulate.map((item, i) =>
                    i === index ? { ...item, value: value } : item
                ),
        })
    }

    handleAddSealingPipelineValue = () => {
        this.setState({
            sealingPipelineValuesToSimulate: [
                ...this.state.sealingPipelineValuesToSimulate,
                { state: null, value: 0, category: null },
            ],
        })
    }

    handleRemoveSealingPipelineValue = (index) => {
        const valuesList = [...this.state.sealingPipelineValuesToSimulate]
        valuesList.splice(index, 1)
        this.setState({ sealingPipelineValuesToSimulate: valuesList })
    }

    render() {
        const { t } = this.props

        const {
            isLoading,
            isError,
            simulateFromHistory,
            selectedDealDuration,
            selectedDurationUnit,
            selectedDealSize,
            selectedSizeUnit,
            selectedDealVerified,
            selectedDealTransferType,
            selectedDealType,
            selectedPrice,
            selectedPriceFor30DaysFil,
            selectedPriceFor30DaysUsd,
            selectedPriceFilGibEpoch,
            selectedPriceCurrency,
            loadingResults,
            testResults,
            selectedAddress,
            clientsAddresses,
            sealingPipelineValuesToSimulate,
        } = this.state

        return (
            <div className="container">
                <Row className="mt-4">
                    <Col xs={12} md={12}>
                        <h1>{t('title')}</h1>
                        <p>
                            <Trans t={t} i18nKey="subtitle" />
                        </p>
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Col xs={isMobile ? '12' : '7'} md={isMobile ? '12' : '7'}>
                        {isLoading ? (
                            <>
                                <section className="card-form">
                                    <span className="text-center">
                                        <Loader />
                                        <div className="mt-4">
                                            {t('isLoadingProposal')}
                                        </div>
                                    </span>
                                </section>
                            </>
                        ) : isError ? (
                            <>
                                <section className="card-form">
                                    <div
                                        className="alert alert-danger"
                                        role="alert"
                                    >
                                        {t('error.onLoadSpecificProposal')}
                                    </div>
                                </section>
                            </>
                        ) : (
                            <PlaygroundForm
                                simulateFromHistory={simulateFromHistory}
                                onSubmit={this.sendTest}
                                selectedSize={selectedDealSize}
                                selectedSizeUnit={selectedSizeUnit}
                                selectedVerified={selectedDealVerified}
                                selectedDealType={selectedDealType}
                                selectedTransferType={selectedDealTransferType}
                                selectedPrice={selectedPrice}
                                selectedPriceFor30DaysFil={selectedPriceFor30DaysFil}
                                selectedPriceFor30DaysUsd={selectedPriceFor30DaysUsd}
                                selectedPriceFilGibEpoch={selectedPriceFilGibEpoch}
                                onInputValueChange={this.handleInputValueChange}
                                onSizeUnitChange={this.handleSizeUnitChange}
                                onPriceCurrencyChange={this.handlePriceCurrencyChange}
                                selectedPriceCurrency={selectedPriceCurrency}
                                selectedDuration={selectedDealDuration}
                                selectedDurationUnit={selectedDurationUnit}
                                onDurationUnitChange={
                                    this.handleDurationUnitChange
                                }
                                handleChangeAddress={this.handleAddressChange}
                                handleAddressNotInList={
                                    this.handleAddressCreate
                                }
                                clientAddresses={clientsAddresses}
                                selectedAddress={selectedAddress}
                                sealingPipelineValues={
                                    sealingPipelineValuesToSimulate
                                }
                                onRemoveSealingPipelineValue={
                                    this.handleRemoveSealingPipelineValue
                                }
                                onAddSealingPipelineValue={
                                    this.handleAddSealingPipelineValue
                                }
                                onAcceptanceLogicTypeDropdownChange={
                                    this.handleAcceptanceLogicTypeDropdownChange
                                }
                                onAcceptanceLogicValueChange={
                                    this.handleAcceptanceLogicValueChange
                                }
                            />
                        )}
                    </Col>

                    <Col xs={isMobile ? '12' : '5'} md={isMobile ? '12' : '5'}>
                        <section className="card-form">
                            <Row className="p-4">
                                {!loadingResults && testResults.decision ? (
                                    <Col xs={12} md={12}>
                                        {testResults.decision === 'accept' ? (
                                            <span className="text-center">
                                                <i
                                                    className="fas fa-check-circle fa-3x"
                                                    style={{
                                                        display: 'inline-block',
                                                        width: '100%',
                                                        color: 'green',
                                                    }}
                                                />
                                                <h3 className="mt-4">
                                                    {t(
                                                        'testResult.success.title'
                                                    )}
                                                </h3>

                                                <div className="mt-4">
                                                    {t(
                                                        'testResult.success.matchedPricing',
                                                        {
                                                            pricingModel:
                                                                testResults.matchingPricing,
                                                            rule: testResults.matchingRule,
                                                        }
                                                    )}
                                                </div>

                                                <div className="mt-4">
                                                    {t(
                                                        'testResult.success.matchedAcceptanceLogic',
                                                        {
                                                            acceptanceLogicName:
                                                                testResults.matchingAcceptanceLogic,
                                                        }
                                                    )}
                                                </div>
                                            </span>
                                        ) : testResults.decision === 'reject' ? (
                                            <span>
                                                <span className="text-center">
                                                    <i
                                                        className="fas fa-minus-circle fa-3x"
                                                        style={{
                                                            display:
                                                                'inline-block',
                                                            width: '100%',
                                                            color: 'Tomato',
                                                        }}
                                                    />
                                                    <h3 className="mt-4">
                                                        {t(
                                                            'testResult.rejected.title'
                                                        )}
                                                    </h3>
                                                </span>

                                                <div className="mt-4">
                                                    {testResults.matchingPricing && testResults.internalDecision === 'reject' ? (
                                                        <>
                                                            <p class="font-italic text-center">
                                                                {t(
                                                                    'testResult.rejected.matchedPricing',
                                                                    {
                                                                        pricingModel:
                                                                            testResults.matchingPricing,
                                                                        rule: testResults.matchingRule,
                                                                    }
                                                                )}
                                                            </p>

                                                            {testResults.externalDecision === 'priceTooLow' && (
                                                                <SyntaxHighlighter customStyle={{padding: 20 + 'px'}} language="bash" style={a11yDark} wrapLongLines={true}>
                                                                    {testResults.externalMessage}
                                                                </SyntaxHighlighter>
                                                            )}
                                                        </>
                                                    ) : testResults.internalDecision ===
                                                          'storageAcceptanceLogic' &&
                                                      testResults.acceptanceLogicUsed ? (
                                                        <>
                                                            <p className="font-italic text-center">
                                                                {t(
                                                                    'testResult.rejected.storageAcceptanceLogicNotPassed',
                                                                    {
                                                                        acceptanceLogicName:
                                                                            testResults.matchingAcceptanceLogic,
                                                                    }
                                                                )}
                                                            </p>

                                                            <p className="font-italic text-center mt-4">
                                                                {t(
                                                                    'testResult.rejected.storageLogicUsedExplanation'
                                                                )}
                                                            </p>

                                                            <SyntaxHighlighter
                                                                language="json"
                                                                style={a11yDark}
                                                                wrapLongLines={
                                                                    true
                                                                }
                                                            >
                                                                {JSON.stringify(
                                                                    JSON.parse(
                                                                        testResults.acceptanceLogicUsed
                                                                    ),
                                                                    null,
                                                                    4
                                                                )}
                                                            </SyntaxHighlighter>
                                                        </>
                                                    ) : (
                                                        <p className="font-italic text-center">
                                                            {
                                                                testResults.internalMessage
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </span>
                                        ) : (
                                            <span className="text-center">
                                                <i
                                                    className="fas fa-exclamation-circle fa-3x"
                                                    style={{
                                                        display: 'inline-block',
                                                        width: '100%',
                                                        color: 'orange',
                                                    }}
                                                />
                                                <h3 className="mt-4">
                                                    {t(
                                                        'testResult.error.title'
                                                    )}
                                                </h3>

                                                <div className="mt-4">
                                                    {t(
                                                        'testResult.error.reason'
                                                    )}
                                                    <br />
                                                    <br />
                                                    <p className="font-italic">
                                                        {
                                                            testResults.internalMessage
                                                        }
                                                    </p>
                                                </div>
                                            </span>
                                        )}
                                    </Col>
                                ) : !loadingResults ? (
                                    <span className="text-center">
                                        <i className="fas fa-pause-circle fa-3x" />
                                        <h3 className="mt-4">
                                            {t('testResult.waiting.title')}
                                        </h3>

                                        <div className="mt-4">
                                            {t(
                                                'testResult.waiting.description'
                                            )}
                                        </div>
                                    </span>
                                ) : (
                                    <span className="text-center">
                                        <i className="fas fa-stroopwafel fa-spin fa-3x" />
                                        <h3 className="mt-4">
                                            {t('testResult.loading.title')}
                                        </h3>

                                        <div className="mt-4">
                                            {t(
                                                'testResult.loading.description'
                                            )}
                                        </div>
                                    </span>
                                )}
                            </Row>
                        </section>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default withAuth0(
    withTranslation('PlaygroundContainer')(PlaygroundContainer)
)
