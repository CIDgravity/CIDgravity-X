import { PureComponent } from 'react'

import { Trans, withTranslation } from 'react-i18next'

import { withAuth0 } from '@auth0/auth0-react'
import { Alert, Button, Col, Container, Row } from 'reactstrap'
import { AlertCreatePricingFromClient } from 'shared/modals'
import {
    checkAddressValidityAndResolveId,
    checkAlreadyUsedName,
    checkAlreadyUsedPeerId,
    CreateClient,
    GetClientById,
    UpdateClient,
} from 'shared/services/client'
import { GetAllPricingModelsWithRulesForCurrentUser } from 'shared/services/pricing-model'
import { GetAllStorageAcceptanceLogicsForCurrentTenant } from 'shared/services/storage-acceptance-logic'

import { Link } from 'react-router-dom'
import { Loader } from 'shared/components'

import {
    fromBytesToReadableFormat,
    toReadableDurationFormat,
    toReadableDurationFormatNew,
    toReadableSize,
} from 'shared/utils/file_size'

import { computePriceEquivalence } from 'shared/utils/fil'
import { peerIdFromString } from '@libp2p/peer-id'
import Select from 'react-select'
import { toast } from 'react-toastify'

import CreateClientForm from './CreateClientForm'

import {
    getFilecoinAddressIfValidAndSupported,
    isLongAddress,
    isShortAddress,
    shortenAddress,
} from 'shared/utils/filecoinUtil'

import { convertToFIL } from 'shared/utils/fil'
import { GetCurrentAddress } from 'shared/services/addresses_claim'

const createOptionFilecoinAddress = (addrObj, addrNotOnChainTooltip) => ({
    label: shortenAddress(addrObj.address),
    value: addrObj.address,
    tooltipContent: addrObj.addressId
        ? `${addrObj.address} (${addrObj.addressId})`
        : addrNotOnChainTooltip,
})

const createOption = (label) => ({
    label,
    value: label,
})

class CreateClientContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            isNew: false,
            isLoading: true,
            errorMsg: null,
            errorMsgAddress: null,
            isCheckingClientAddress: false,
            isCheckingClientPeerId: false,
            isError: false,
            address: '',
            selectedAddresses: [],
            peerId: '',
            selectedPeerIds: [],
            rulesModels: [],
            storageAcceptanceLogics: [],
            selectedRulesModel: null,
            defaultPricingModel: null,
            selectedStorageAcceptanceLogic: null,
            defaultAcceptanceLogic: null,
            selectedRulesModelDetails: null,
            confirmLeavePageLinkTo: null,
            confirmLeavePageModalOpened: false,
            useGlobalSettingsForStartEpochSealingBuffer: true,
            currentTenant: null,
            createClientFromHistory: false,
            clientNameFromHistory: null,
            clientAddressFromHistory: null,
            currentClient: {
                id: '',
                name: '',
                email: '',
                slack: '',
                pricingModel: null,
                storageAcceptanceLogic: null,
                hasPricingModel: false,
                hasStorageAcceptanceLogic: false,
                addresses: [],
                integration: null,
                hourlyDealLimit: '',
                hourlyDealSizeLimit: '',
                startEpochSealingBuffer: '',
            },
        }
    }

    async componentDidMount() {
        await this.getAllPricingModels()
        await this.getAllStorageAcceptanceLogics()
        await this.loadCurrentTenantSettings()

        const { t } = this.props

        // here we will also check if the create client came from history (with address and clientName)
        if (this.props.match.params.clientId === 'new') {
            if (
                this.props.location.state !== undefined &&
                this.props.location.state.createClientFromHistory !== null &&
                this.props.location.state.createClientFromHistory !== undefined
            ) {
                // resolve addressId from history address
                const addressToCheck = {
                    address: this.props.location.state.clientAddress,
                }

                try {
                    const addressValidityDTO =
                        await checkAddressValidityAndResolveId(addressToCheck)

                    if (
                        addressValidityDTO.data &&
                        addressValidityDTO.data.isValid
                    ) {
                        this.setState({
                            isNew: true,
                            isLoading: false,
                            createClientFromHistory: true,
                            clientNameFromHistory:
                                this.props.location.state.clientName,
                            selectedRulesModel: null,
                            selectedStorageAcceptanceLogic: null,
                            selectedAddresses: [
                                ...this.state.selectedAddresses,
                                createOptionFilecoinAddress(
                                    addressValidityDTO.data.stateAccountKey,
                                    t('error.isAddressNotOnChain')
                                ),
                            ],
                            selectedRulesModelDetails:
                                this.state.defaultPricingModel,
                        })
                    } else {
                        this.setState({
                            isError: true,
                            errorMsg: 'ERR_ADDRESS_ALREADY_USED_FROM_HISTORY',
                            isLoading: false,
                        })
                    }
                } catch (error) {
                    console.log(error)
                    this.setState({
                        isError: true,
                        errorMsg: 'ERR_CHECK_ADDRESS_FROM_HISTORY',
                        errorMsgAddress:
                            this.props.location.state.clientAddress,
                        isLoading: false,
                    })
                }
            } else {
                this.setState({
                    isNew: true,
                    isLoading: false,
                    selectedRulesModelDetails: this.state.defaultPricingModel,
                })
            }
        } else {
            try {
                const response = await GetClientById(
                    this.props.match.params.clientId
                )

                this.setState({
                    currentClient: {
                        ...response.data,
                    },
                    selectedRulesModelDetails: this.state.rulesModels.filter(
                        (obj) => {
                            return obj.id === response.data.pricingModel.id
                        }
                    )[0],
                    selectedStorageAcceptanceLogic: response.data
                        .hasStorageAcceptanceLogic
                        ? response.data.storageAcceptanceLogic.id
                        : null,
                    selectedRulesModel: response.data.hasPricingModel
                        ? response.data.pricingModel.id
                        : null,
                    useGlobalSettingsForStartEpochSealingBuffer:
                        response.data.startEpochSealingBuffer === -1,
                    selectedAddresses: response.data.addresses
                        ? response.data.addresses.map((item) =>
                              createOptionFilecoinAddress(
                                  item,
                                  t('error.isAddressNotOnChain')
                              )
                          )
                        : [],
                    selectedPeerIds: response.data.peerIds
                        ? response.data.peerIds.map((item) =>
                              createOption(item)
                          )
                        : [],
                    isLoading: false,
                })
            } catch (error) {
                this.setState({ isError: true, isLoading: false })
                console.error(error)
            }
        }
    }

    loadCurrentTenantSettings = async () => {
        try {
            const result = await GetCurrentAddress()
            this.setState({ currentTenant: result.data })
        } catch (error) {
            this.setState({ isError: true, isLoading: false })
            console.error(error)
        }
    }

    getAllPricingModels = async () => {
        try {
            const response = await GetAllPricingModelsWithRulesForCurrentUser()

            // filter array to get only default pricing model
            // if default pricing model not found, set an error
            if (response.data) {
                const defaultPricingModel = response.data.filter((obj) => {
                    return obj.default
                })

                if (defaultPricingModel.length <= 0) {
                    console.error('Default pricing model not found !')
                }

                // Also remove the default from the rulesModels array
                // default will be when no value is selected
                this.setState({
                    rulesModels: response.data,
                    defaultPricingModel:
                        defaultPricingModel.length > 0
                            ? defaultPricingModel[0]
                            : null,
                    isError: defaultPricingModel.length <= 0 ? true : false,
                    errorMsg:
                        defaultPricingModel.length <= 0
                            ? 'ERR_DEFAULT_PRICING_MODEL_NOT_FOUND'
                            : null,
                })
            }
        } catch (error) {
            console.error(error)
        }
    }

    getAllStorageAcceptanceLogics = async () => {
        try {
            const response =
                await GetAllStorageAcceptanceLogicsForCurrentTenant()

            // filter array to get only default storage acceptance logic
            // if default acceptance logic not found, set an error
            if (response.data) {
                const defaultAcceptanceLogic = response.data.filter((obj) => {
                    return obj.isDefault
                })

                if (defaultAcceptanceLogic.length <= 0) {
                    console.error(
                        'Default storage acceptance logic not found !'
                    )
                }

                this.setState({
                    storageAcceptanceLogics: response.data,
                    defaultAcceptanceLogic:
                        defaultAcceptanceLogic.length > 0
                            ? defaultAcceptanceLogic[0]
                            : null,
                    isError: defaultAcceptanceLogic.length <= 0 ? true : false,
                    errorMsg:
                        defaultAcceptanceLogic.length <= 0
                            ? 'ERR_DEFAULT_ACCEPTANCE_LOGIC_NOT_FOUND'
                            : null,
                })
            }
        } catch (error) {
            console.error(error)
        }
    }

    handleConfirmLeavePageModal = (linkToComponent) => {
        var linkTo = null

        if (linkToComponent === 'pricingModel') {
            linkTo = '../pricing-model/new'
        } else if (linkToComponent === 'acceptanceLogic') {
            linkTo = '../storage-acceptance-logic/new'
        }

        this.setState({
            confirmLeavePageLinkTo: linkTo,
            confirmLeavePageModalOpened:
                !this.state.confirmLeavePageModalOpened,
        })
    }

    handlePricingModelChange = (selected) => {
        if (selected === null) {
            this.setState({
                selectedRulesModel: null,
                selectedRulesModelDetails: this.state.defaultPricingModel,
            })
        } else {
            var result = this.state.rulesModels.filter((obj) => {
                return obj.id === selected.value
            })

            this.setState({
                selectedRulesModel: selected.value,
                selectedRulesModelDetails: result[0],
            })
        }
    }

    handleKeyDownOnForm = (keyEvent) => {
        if ((keyEvent.charCode || keyEvent.keyCode) === 13) {
            keyEvent.preventDefault()
        }
    }

    handleValidSubmit = async (values) => {
        const { t } = this.props
        const {
            selectedAddresses,
            selectedPeerIds,
            selectedRulesModel,
            selectedStorageAcceptanceLogic,
            isNew,
            currentClient,
            useGlobalSettingsForStartEpochSealingBuffer,
        } = this.state

        // First (in edit and creation case) check if client name is available
        const nameToCheck = { value: values.name }
        const clientNameAlreadyUsed = await checkAlreadyUsedName(nameToCheck)

        if (isNew) {
            if (!clientNameAlreadyUsed.data) {
                if (
                    selectedAddresses.length > 0 ||
                    selectedPeerIds.length > 0
                ) {
                    const clientToCreate = {
                        name: values.name,
                        email: values.email,
                        slack: values.slack,
                        storageAcceptanceLogicId:
                            selectedStorageAcceptanceLogic,
                        addresses: selectedAddresses.map(function (address) {
                            return address['value']
                        }), // potentially empty
                        peerIds: selectedPeerIds.map(function (peerId) {
                            return peerId['value']
                        }), // potentially empty
                        pricingModelId: selectedRulesModel,
                        hourlyDealLimit: values.hourlyDealLimit,
                        hourlyDealSizeLimit: toReadableSize(
                            'GiB',
                            'B',
                            values.hourlyDealSizeLimit
                        ),
                        startEpochSealingBuffer:
                            useGlobalSettingsForStartEpochSealingBuffer
                                ? -1
                                : toReadableDurationFormatNew(
                                      'Hours',
                                      'Epochs',
                                      values.startEpochSealingBuffer
                                  ),
                    }

                    try {
                        const response = await CreateClient(clientToCreate)

                        if (response) {
                            return { status: true, message: '' }
                        } else {
                            return {
                                status: false,
                                message: t(
                                    'validation.isGenericErrorWhileAddingClient'
                                ),
                            }
                        }
                    } catch (error) {
                        console.error(error)
                        return {
                            status: false,
                            message: t(
                                'validation.isGenericErrorWhileAddingClient'
                            ),
                        }
                    }
                } else {
                    return {
                        status: false,
                        message: t(
                            'validation.isAddressOrPeerIdFieldMandatory'
                        ),
                    }
                }
            } else {
                return {
                    status: false,
                    message: t('validation.isClientNameAlreadyUsed'),
                }
            }
        } else {
            if (values.name !== currentClient.name) {
                if (clientNameAlreadyUsed.data) {
                    return {
                        status: false,
                        message: t('validation.isClientNameAlreadyUsed'),
                    }
                }
            }

            // At least one addresse or one Peer ID is required
            if (selectedAddresses.length > 0 || selectedPeerIds.length > 0) {
                const clientToUpdate = {
                    ...currentClient,
                    name: values.name,
                    email: values.email,
                    slack: values.slack,
                    storageAcceptanceLogicId: selectedStorageAcceptanceLogic,
                    hourlyDealLimit: values.hourlyDealLimit,
                    hourlyDealSizeLimit: toReadableSize(
                        'GiB',
                        'B',
                        values.hourlyDealSizeLimit
                    ),
                    addresses: selectedAddresses.map(function (address) {
                        return address['value']
                    }), // potentially empty
                    peerIds: selectedPeerIds.map(function (peerId) {
                        return peerId['value']
                    }), // potentially empty
                    pricingModelId: selectedRulesModel,
                    startEpochSealingBuffer:
                        useGlobalSettingsForStartEpochSealingBuffer
                            ? -1
                            : toReadableDurationFormatNew(
                                  'Hours',
                                  'Epochs',
                                  values.startEpochSealingBuffer
                              ),
                }

                try {
                    const response = await UpdateClient(clientToUpdate)

                    if (response) {
                        return { status: true, message: '' }
                    } else {
                        return {
                            status: false,
                            message: t(
                                'validation.isGenericErrorWhileAddingClient'
                            ),
                        }
                    }
                } catch (error) {
                    console.error(error)
                    return {
                        status: false,
                        message: t(
                            'validation.isGenericErrorWhileAddingClient'
                        ),
                    }
                }
            } else {
                return {
                    status: false,
                    message: t('validation.isAddressOrPeerIdFieldMandatory'),
                }
            }
        }
    }

    handlePeerIdsChange = (value) => {
        this.setState({ selectedPeerIds: value })
    }

    handleAddressesChange = (value) => {
        this.setState({ selectedAddresses: value })
    }

    handleAddressInputChange = (inputValue) => {
        this.setState({ address: inputValue })
    }

    handlePeerIdInputChange = (inputValue) => {
        this.setState({ peerId: inputValue })
    }

    handleStartEpochSealingBufferDefaultChange = (checked) => {
        this.setState({
            useGlobalSettingsForStartEpochSealingBuffer: !checked,
        })
    }

    handleAddressKeyDown = async (event) => {
        const { t } = this.props
        const { key } = event
        const { address, selectedAddresses } = this.state

        if (!address) return

        if (key === 'Enter' || key === 'Tab') {
            this.setState({ isCheckingClientAddress: true })

            // First check address use valid format
            const filecoinAddress =
                getFilecoinAddressIfValidAndSupported(address)

            if (filecoinAddress) {
                // if long address, check if address isn't already in the field
                if (
                    isLongAddress(filecoinAddress) &&
                    selectedAddresses.find((item) => item.value === address)
                ) {
                    this.setState({
                        address: '',
                        isCheckingClientAddress: false,
                    })
                    toast.error(
                        t(
                            'notification.error.isAddressCantBeAddedOneMoreTime',
                            { address: address }
                        )
                    )
                    event.preventDefault()
                    return
                }
                // check if the address isn't already used
                // and is a valid short address (has associated long address)
                // or get the short address if any, if it is a long address
                const addressToCheck = { address: address }

                try {
                    const addressValidityDTO =
                        await checkAddressValidityAndResolveId(addressToCheck)
                    if (addressValidityDTO.data.isValid) {
                        if (isShortAddress(filecoinAddress)) {
                            // remove potential duplicates
                            const resolvedAddress =
                                addressValidityDTO.data.stateAccountKey.address
                            if (
                                selectedAddresses.find(
                                    (item) => item.value === resolvedAddress
                                )
                            ) {
                                this.setState({
                                    address: '',
                                    isCheckingClientAddress: false,
                                })
                                toast.error(
                                    t(
                                        'notification.error.isAddressResolvesToAlreadyUsed',
                                        {
                                            address: address,
                                            resolvedAddress:
                                                shortenAddress(resolvedAddress),
                                        }
                                    )
                                )
                                event.preventDefault()
                                return
                            }
                        }

                        this.setState({
                            address: '',
                            isCheckingClientAddress: false,
                            selectedAddresses: [
                                ...selectedAddresses,
                                createOptionFilecoinAddress(
                                    addressValidityDTO.data.stateAccountKey,
                                    t('error.isAddressNotOnChain')
                                ),
                            ],
                        })
                        event.preventDefault()
                    } else {
                        this.setState({
                            address: '',
                            isCheckingClientAddress: false,
                        })
                        switch (addressValidityDTO.data.reason) {
                            case 'alreadyUsed':
                                toast.error(
                                    t(
                                        'notification.error.isAddressAlreadyConfigured',
                                        { address: shortenAddress(address) }
                                    )
                                )
                                break
                            case 'blacklisted':
                                toast.error(
                                    t(
                                        'notification.error.isAddressBlacklisted',
                                        { address: shortenAddress(address) }
                                    )
                                )
                                break
                            case 'actorTypeIsNotAccount':
                                toast.error(
                                    t(
                                        'notification.error.isAddressNotOfTypeAccount',
                                        { address: shortenAddress(address) }
                                    )
                                )
                                break
                            default:
                                toast.error(
                                    t(
                                        'notification.error.isAddressGenericError',
                                        { address: shortenAddress(address) }
                                    )
                                )
                                break
                        }
                    }
                } catch (error) {
                    console.error(
                        'Error while checking address validity',
                        error
                    )
                    this.setState({
                        address: '',
                        isCheckingClientAddress: false,
                    })
                    toast.error(
                        t('notification.error.isAddressGenericError', {
                            address: shortenAddress(address),
                        })
                    )
                }
            } else {
                this.setState({ address: '', isCheckingClientAddress: false })
                if (filecoinAddress === undefined) {
                    toast.error(
                        t('notification.error.isAddressInvalidFilecoinFormat', {
                            address: shortenAddress(address),
                        })
                    )
                }
                if (filecoinAddress === null) {
                    toast.error(
                        t('notification.error.isAddressInvalidFormat', {
                            address: shortenAddress(address),
                        })
                    )
                }
            }
        }
    }

    handlePeerIdKeyDown = async (event) => {
        const { t } = this.props
        const { key } = event
        const { peerId, selectedPeerIds } = this.state

        if (!peerId) return

        if (key === 'Enter' || key === 'Tab') {
            this.setState({ isCheckingClientPeerId: true })

            // Check the Peer ID format using Libp2p js library
            try {
                peerIdFromString(peerId)

                // First check if Peer ID isn't already in the field
                if (selectedPeerIds.find((item) => item.value === peerId)) {
                    this.setState({ peerId: '', isCheckingClientPeerId: false })
                    toast.error(
                        t('notification.error.isPeerIdAlreadyAdded', {
                            peerId: peerId,
                        })
                    )

                    event.preventDefault()
                } else {
                    // Here we need to check if the Peer ID isn't already used + isn't blacklisted
                    const peerIdToCheck = { value: peerId }
                    const checkIfPeerIdAlreadyUsed =
                        await checkAlreadyUsedPeerId(peerIdToCheck)

                    if (!checkIfPeerIdAlreadyUsed.data) {
                        this.setState({
                            peerId: '',
                            isCheckingClientPeerId: false,
                            selectedPeerIds: [
                                ...selectedPeerIds,
                                createOption(peerId),
                            ],
                        })
                        event.preventDefault()
                    } else {
                        this.setState({
                            peerId: '',
                            isCheckingClientPeerId: false,
                        })
                        toast.error(
                            t('notification.error.isPeerIdAlreadyConfigured', {
                                peerId: peerId,
                            })
                        )
                    }
                }
            } catch (error) {
                console.error('Error while parsing Peer ID', peerId, error)
                this.setState({ peerId: '', isCheckingClientPeerId: false })
                toast.error(
                    t('notification.error.isPeerIdInvalidFormat', {
                        peerId: peerId,
                    })
                )
            }
        }
    }

    handleStorageAcceptanceLogicChange = (selected) => {
        this.setState({
            selectedStorageAcceptanceLogic:
                selected !== null ? selected.value : null,
        })
    }

    render() {
        const { t } = this.props
        const {
            address,
            rulesModels,
            storageAcceptanceLogics,
            isLoading,
            isCheckingClientAddress,
            isCheckingClientPeerId,
            isNew,
            isError,
            errorMsgAddress,
            errorMsg,
            currentClient,
            selectedAddresses,
            peerId,
            selectedPeerIds,
            selectedRulesModelDetails,
            confirmLeavePageModalOpened,
            confirmLeavePageLinkTo,
            useGlobalSettingsForStartEpochSealingBuffer,
            currentTenant,
            createClientFromHistory,
            clientNameFromHistory,
            clientAddressFromHistory,
        } = this.state

        return (
            <Container>
                {!isLoading && !isError ? (
                    <>
                        <Row className="mt-4">
                            <Col xs={12} md={12}>
                                {isNew ? (
                                    <h1>{t('createClient.title')}</h1>
                                ) : (
                                    <h1>{t('editClient.title')}</h1>
                                )}
                            </Col>
                        </Row>

                        {currentClient.integration &&
                            currentClient.integration.id !== 0 && (
                                <Row>
                                    <Col xs={12} md={12}>
                                        <Alert color="warning">
                                            <Trans
                                                t={t}
                                                i18nKey="clientFromIntegrationWarn"
                                            />
                                        </Alert>
                                    </Col>
                                </Row>
                            )}

                        <Row className="mt-2">
                            <Col>
                                {/* Pricing model */}
                                <section className="card-form">
                                    <Row className="card-form-header">
                                        <Col>
                                            <h3 className="title is-4 is-styled">
                                                {t('pricingModel.select.label')}
                                            </h3>
                                            <h5>
                                                {t(
                                                    'pricingModel.select.description'
                                                )}
                                            </h5>
                                        </Col>

                                        <Col xs="4" md="4" className="text-end">
                                            <Button
                                                className="custom-cidg-button"
                                                onClick={() =>
                                                    this.handleConfirmLeavePageModal(
                                                        'pricingModel'
                                                    )
                                                }
                                            >
                                                <i className="fas fa-plus fa-sm me-2" />
                                                <small>
                                                    {t(
                                                        'button.createNewPricingModel'
                                                    )}
                                                </small>
                                            </Button>
                                        </Col>
                                    </Row>

                                    <Row
                                        id="clientPricingModel"
                                        className="mt-4"
                                        style={{ marginLeft: 2 + 'px' }}
                                    >
                                        {!isNew ? (
                                            <Select
                                                placeholder={t(
                                                    'pricingModel.select.noSelectedDefaultWillApply'
                                                )}
                                                className="basic-single"
                                                classNamePrefix="select"
                                                isClearable
                                                defaultValue={
                                                    currentClient.hasPricingModel
                                                        ? {
                                                              value: currentClient
                                                                  .pricingModel
                                                                  .id,
                                                              label: currentClient
                                                                  .pricingModel
                                                                  .name,
                                                          }
                                                        : null
                                                }
                                                name="color"
                                                options={rulesModels.map(
                                                    (item) => ({
                                                        value: item.id,
                                                        label: item.name,
                                                    })
                                                )}
                                                onChange={
                                                    this
                                                        .handlePricingModelChange
                                                }
                                            />
                                        ) : (
                                            <Select
                                                placeholder={t(
                                                    'pricingModel.select.noSelectedDefaultWillApply'
                                                )}
                                                id="selectPricingModel"
                                                isClearable
                                                className="basic-single"
                                                classNamePrefix="select"
                                                name="color"
                                                options={rulesModels.map(
                                                    (item) => ({
                                                        value: item.id,
                                                        label: item.name,
                                                    })
                                                )}
                                                onChange={
                                                    this
                                                        .handlePricingModelChange
                                                }
                                            />
                                        )}
                                    </Row>
                                </section>

                                {/* Storage acceptance logic */}
                                <section className="card-form">
                                    <Row className="card-form-header">
                                        <Col>
                                            <h3 className="title is-4 is-styled">
                                                {t(
                                                    'storageAcceptanceLogic.title'
                                                )}
                                            </h3>
                                            <h5>
                                                {t(
                                                    'storageAcceptanceLogic.description'
                                                )}
                                            </h5>
                                        </Col>

                                        <Col xs="5" md="5" className="text-end">
                                            <Button
                                                className="custom-cidg-button"
                                                onClick={() =>
                                                    this.handleConfirmLeavePageModal(
                                                        'acceptanceLogic'
                                                    )
                                                }
                                            >
                                                <i className="fas fa-plus fa-sm me-2" />
                                                <small>
                                                    {t(
                                                        'button.createNewStorageAcceptanceLogic'
                                                    )}
                                                </small>
                                            </Button>
                                        </Col>
                                    </Row>

                                    <Row
                                        id="clientStorageAcceptanceLogic"
                                        className="mt-4 my-3"
                                    >
                                        <Col
                                            xs="12"
                                            md="12"
                                            style={{ marginLeft: 10 + 'px' }}
                                        >
                                            {isNew ? (
                                                <Select
                                                    placeholder={t(
                                                        'storageAcceptanceLogic.noSelectedDefaultWillApply'
                                                    )}
                                                    id="selectStorageAcceptanceLogic"
                                                    className="basic-single"
                                                    isClearable
                                                    classNamePrefix="select"
                                                    name="selectStorageAcceptanceLogic"
                                                    options={storageAcceptanceLogics.map(
                                                        (item) => ({
                                                            value: item.id,
                                                            label: item.name,
                                                        })
                                                    )}
                                                    onChange={
                                                        this
                                                            .handleStorageAcceptanceLogicChange
                                                    }
                                                />
                                            ) : (
                                                <Select
                                                    placeholder={t(
                                                        'storageAcceptanceLogic.noSelectedDefaultWillApply'
                                                    )}
                                                    id="selectStorageAcceptanceLogic"
                                                    className="basic-single"
                                                    classNamePrefix="select"
                                                    isClearable
                                                    name="selectStorageAcceptanceLogic"
                                                    defaultValue={
                                                        currentClient.hasStorageAcceptanceLogic
                                                            ? {
                                                                  value: currentClient
                                                                      .storageAcceptanceLogic
                                                                      .id,
                                                                  label: currentClient
                                                                      .storageAcceptanceLogic
                                                                      .name,
                                                              }
                                                            : null
                                                    }
                                                    options={storageAcceptanceLogics.map(
                                                        (item) => ({
                                                            value: item.id,
                                                            label: item.name,
                                                        })
                                                    )}
                                                    onChange={
                                                        this
                                                            .handleStorageAcceptanceLogicChange
                                                    }
                                                />
                                            )}
                                        </Col>
                                    </Row>
                                </section>

                                {/* Form */}
                                <CreateClientForm
                                    isNew={isNew}
                                    isCheckingClientAddress={
                                        isCheckingClientAddress
                                    }
                                    isCheckingClientPeerId={
                                        isCheckingClientPeerId
                                    }
                                    currentClient={currentClient}
                                    onSubmit={this.handleValidSubmit}
                                    address={address}
                                    rulesModels={rulesModels}
                                    selectedAddresses={selectedAddresses}
                                    onAddressesChange={
                                        this.handleAddressesChange
                                    }
                                    onAddressInputChange={
                                        this.handleAddressInputChange
                                    }
                                    onAddressKeyDown={this.handleAddressKeyDown}
                                    onRulesModelChange={
                                        this.handleRulesModelChange
                                    }
                                    getAllRulesModels={this.getAllRulesModels}
                                    onKeyDownOnForm={this.handleKeyDownOnForm}
                                    peerId={peerId}
                                    onPeerIdsChange={this.handlePeerIdsChange}
                                    onPeerIdInputChange={
                                        this.handlePeerIdInputChange
                                    }
                                    onPeerIdKeyDown={this.handlePeerIdKeyDown}
                                    onStartEpochSealingBufferDefaultChange={
                                        this
                                            .handleStartEpochSealingBufferDefaultChange
                                    }
                                    useGlobalSettingsForStartEpochSealingBuffer={
                                        !!useGlobalSettingsForStartEpochSealingBuffer
                                    }
                                    selectedPeerIds={selectedPeerIds}
                                    currentTenant={currentTenant}
                                    createClientFromHistory={
                                        createClientFromHistory
                                    }
                                    clientNameFromHistory={
                                        clientNameFromHistory
                                    }
                                    clientAddressFromHistory={
                                        clientAddressFromHistory
                                    }
                                />
                            </Col>

                            {selectedRulesModelDetails ||
                            (selectedRulesModelDetails && currentClient.id) ? (
                                <Col>
                                    <section
                                        id="detailRulesModel"
                                        className="card-form"
                                    >
                                        <Row className="card-form-header">
                                            <h3 className="title is-4 is-styled">
                                                {t(
                                                    'pricingModel.details.title',
                                                    {
                                                        pricingModelName:
                                                            selectedRulesModelDetails.name,
                                                    }
                                                )}
                                            </h3>
                                        </Row>

                                        <Row>
                                            {selectedRulesModelDetails &&
                                                selectedRulesModelDetails.rules.map(
                                                    (rule) => (
                                                        <div
                                                            key={rule.id}
                                                            className="card p-4 mt-4"
                                                        >
                                                            <Row>
                                                                <Col>
                                                                    {t(
                                                                        'pricingModel.details.ruleNumber',
                                                                        {
                                                                            ruleNumber:
                                                                                rule.position,
                                                                        }
                                                                    )}
                                                                </Col>

                                                                <Col>
                                                                    <strong>
                                                                        {t(
                                                                            'pricingModel.details.dealType'
                                                                        )}
                                                                    </strong>
                                                                    <br />
                                                                    {rule.verified ===
                                                                    'true' ? (
                                                                        <>
                                                                            {t(
                                                                                'pricingModel.details.forVerifiedDeals'
                                                                            )}
                                                                        </>
                                                                    ) : rule.verified ===
                                                                      'false' ? (
                                                                        <>
                                                                            {t(
                                                                                'pricingModel.details.forUnverifiedDeals'
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            {t(
                                                                                'pricingModel.details.forBothVerifiedAndUnverified'
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </Col>

                                                                <Col>
                                                                    <strong>
                                                                        {t('pricingModel.details.priceLabel')}
                                                                    </strong>
                                                                    <br />
                                                                    {selectedRulesModelDetails.currency === 'attofil_gib_epoch' ? (
                                                                        <>
                                                                            {computePriceEquivalence(rule.price, "FIL")}{' '}
                                                                            {t('pricingModel.details.priceUnit.FIL')}
                                                                        </>
                                                                    ) : selectedRulesModelDetails.currency === 'usd_tib_month' ? (
                                                                        <>
                                                                            {rule.price}{' '}
                                                                            {t('pricingModel.details.priceUnit.USD')}
                                                                        </>
                                                                    ) : null }
                                                                </Col>
                                                            </Row>

                                                            <Row className="mt-4">
                                                                <Col />

                                                                <Col>
                                                                    <strong>
                                                                        {t(
                                                                            'pricingModel.details.dealSize'
                                                                        )}
                                                                    </strong>
                                                                    <br />
                                                                    {fromBytesToReadableFormat(
                                                                        rule.minSize
                                                                    )}{' '}
                                                                    {' / '}{' '}
                                                                    {fromBytesToReadableFormat(
                                                                        rule.maxSize
                                                                    )}
                                                                </Col>

                                                                <Col>
                                                                    <strong>
                                                                        {t(
                                                                            'pricingModel.details.dealDuration'
                                                                        )}
                                                                    </strong>
                                                                    <br />
                                                                    {toReadableDurationFormat(
                                                                        rule.minDuration,
                                                                        true
                                                                    )}{' '}
                                                                    {' / '}{' '}
                                                                    {toReadableDurationFormat(
                                                                        rule.maxDuration,
                                                                        true
                                                                    )}
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    )
                                                )}
                                        </Row>

                                        {!selectedRulesModelDetails.default ? (
                                            <Row className="mt-4">
                                                <Col>
                                                    {selectedRulesModelDetails.fallOnDefault ? (
                                                        <span
                                                            style={{
                                                                color: 'green',
                                                            }}
                                                        >
                                                            {t(
                                                                'pricingModel.details.fallBackToDefaultPricing.isEnabled'
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <span
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            {t(
                                                                'pricingModel.details.fallBackToDefaultPricing.isDisabled'
                                                            )}
                                                        </span>
                                                    )}
                                                </Col>
                                            </Row>
                                        ) : (
                                            <Row className="mt-4">
                                                <Col>
                                                    {t(
                                                        'pricingModel.details.fallBackToDefaultPricing.notApplicable'
                                                    )}
                                                </Col>
                                            </Row>
                                        )}
                                    </section>
                                </Col>
                            ) : null}
                        </Row>
                    </>
                ) : isError ? (
                    <Row className="mt-4">
                        <Col xs={12} md={12}>
                            {isNew ? (
                                <h1>{t('createClient.title')}</h1>
                            ) : (
                                <h1>{t('editClient.title')}</h1>
                            )}
                        </Col>

                        <Col xs={12} md={12}>
                            <section className="card-form mt-4">
                                {errorMsg ? (
                                    <>
                                        {t(`error.${errorMsg}`, {
                                            address: errorMsgAddress,
                                        })}
                                    </>
                                ) : (
                                    <Trans
                                        t={t}
                                        i18nKey="error.isClientNotExistingOrNotAllowed"
                                    />
                                )}

                                <br />
                                <br />
                                <Button
                                    tag={Link}
                                    to="../client"
                                    type="submit"
                                    color="danger"
                                    size="1x"
                                    className="me-4"
                                >
                                    <span className="as--light">
                                        {t('button.backToClientList')}
                                    </span>
                                </Button>
                            </section>
                        </Col>
                    </Row>
                ) : (
                    <Loader />
                )}

                {confirmLeavePageModalOpened && (
                    <AlertCreatePricingFromClient
                        isModalOpened={confirmLeavePageModalOpened}
                        linkTo={confirmLeavePageLinkTo}
                        handleModal={this.handleConfirmLeavePageModal}
                    />
                )}
            </Container>
        )
    }
}

export default withAuth0(
    withTranslation('CreateClientContainer')(CreateClientContainer)
)
