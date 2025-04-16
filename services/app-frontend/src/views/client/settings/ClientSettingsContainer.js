import React, { PureComponent } from 'react'

import { Container, Row, Col, Label, Button } from 'reactstrap'
import { withAuth0 } from '@auth0/auth0-react'
import { isMobile } from 'react-device-detect'
import { Loader } from 'shared/components'

import {  
    GetCurrentClientAddress,  UpdateClientAddressFriendlyName, 
    RegenerateClientToken, AddOrRemoveAlternateAddress 
} from 'shared/services/cidg-services/client-backend/address'

import { toast } from 'react-toastify'
import { ConfirmRegenerateClientToken } from 'shared/modals'
import 'react-tabs/style/react-tabs.css'

import Select from 'react-select'
import ReactTooltip from 'react-tooltip'
import { withTranslation, Trans } from 'react-i18next'

import { TOKEN_REFRESHED_DISPATCH_EVENT } from 'config/constants'
import { CustomCodeHighlight } from 'shared/components/CustomCodeHighlight'
import { GetSelectedAddressIdFromSessionStorage } from 'shared/utils/auth'
import { loadAddressesFromJwt, formatAddressesAsSelectFormat } from 'shared/utils/addresses'

class ClientSettingsContainer extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            isError: false,
            confirmRegenerateTokenModalOpened: false,

            currentAlternateAddresses: [], // loaded from backend, never modifier, only address not as select format
            selectedAlternateAddresses: [], // options selected on Select, created from currentAlternateAddresses, but can be modified
            availableAlternateAddresses: [], // available options in Select. Will be filtered to remove already selected addresses

            currentAddress: {
                address: '',
                actorType: '',
                friendlyName: '',
                createdOn: '',
                permissions: '',
                authProvider: '',
                token: '',
            }
        }
    }

    async componentDidMount() {
        await this.loadAddressSettingsAndAlternateAddresses()
    }

    loadAddressSettingsAndAlternateAddresses = async () => {
        const { getAccessTokenSilently } = this.props.auth0

        try {
            getAccessTokenSilently().then(async (JWTToken) => {
                const selectedAddressId = GetSelectedAddressIdFromSessionStorage()
                const [clientAddressesFromJwt] = await loadAddressesFromJwt(JWTToken, true, false)
                
                // load address details from backend
                const response = await GetCurrentClientAddress()

                if (response.data) {

                    // create an array of current selected alternate addresses + current address
                    // all addresses from this array will be removed from available addresses
                    const addressesToRemoveFromAvailable = [...response.data.result.settings.alternateAddresses]
                    addressesToRemoveFromAvailable.push(selectedAddressId)

                    // to create selected addresses, search in availableAlternateAddresses
                    // if not found, it means current user has not rights, display only the addressId
                    const selectedAlternateAddresses = response.data.result.settings.alternateAddresses.map(selected => {
                        const found = clientAddressesFromJwt.find(item => item.addressId === selected);
                        return found ? {'value': found.addressId, 'label': `${found.friendlyName} (${found.addressId})`} : {'value': selected, 'label': selected} ;
                    });

                    this.setState({ 
                        isLoading: false, 
                        currentAddress: response.data.result,
                        currentAlternateAddresses: response.data.result.settings.alternateAddresses,
                        selectedAlternateAddresses: selectedAlternateAddresses,
                        availableAlternateAddresses: formatAddressesAsSelectFormat(clientAddressesFromJwt, addressesToRemoveFromAvailable)
                    })
                }
            })
            
        } catch (error) {
            this.setState({ isLoading: false, isError: true })
            console.error(error)
        }
    }

    handleConfirmRegenerateTokenModal = () => {
        this.setState({ confirmRegenerateTokenModalOpened: !this.state.confirmRegenerateTokenModalOpened })
    }

    handleFriendlyNameChange = (event) => {
        this.setState({
            currentAddress: {
                ...this.state.currentAddress,
                friendlyName: event.target.value,
            },
        })
    }

    saveFriendlyName = async () => {
        const { t } = this.props
        try {
            const response = await UpdateClientAddressFriendlyName({ friendlyName: this.state.currentAddress.friendlyName })

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
            const response = await RegenerateClientToken()

            if (response.data) {
                this.setState({
                    currentAddress: {
                        ...this.state.currentAddress,
                        token: response.data.result.newToken,
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

    handleAlternateAddressesChange = (value, props) => {
        const { getAccessTokenSilently } = this.props.auth0
        
        getAccessTokenSilently().then((JWTToken) => {
            if (props.action === "select-option") {
                const alternateAddressToAdd = {
                    addressId: props.option.value,
                    action: 'add',
                }
        
                // update and change select content on success
                this.handleAddOrRemoveAlternateAddress(alternateAddressToAdd).then(async () => {
                    await this.loadAddressSettingsAndAlternateAddresses()
                })
            }

            if (props.action === "remove-value") {
                const alternateAddressToRemove = {
                    addressId: props.removedValue.value,
                    action: 'remove',
                }
        
                // update and change select content on success
                this.handleAddOrRemoveAlternateAddress(alternateAddressToRemove).then(async () => {
                    await this.loadAddressSettingsAndAlternateAddresses()
                })
            }
        })
    }

    handleAddOrRemoveAlternateAddress = async (alternateAddress) => {
        const { t } = this.props
        try {
            const response = await AddOrRemoveAlternateAddress(alternateAddress)

            if (response.status === 200) {
                if (alternateAddress.action === 'add') {
                    toast.success(t('notification.success.onAddAlternateAddress', { alternateAddress: alternateAddress.addressId }))
                } else {
                    toast.success(t('notification.success.onRemoveAlternateAddress', { alternateAddress: alternateAddress.addressId }))
                }
            }
        } catch (error) {
            if (alternateAddress.action === 'add') {
                toast.error(t('notification.error.onAddAlternateAddress', { alternateAddress: alternateAddress.addressId }))
            } else {
                toast.error(t('notification.error.onRemoveAlternateAddress', { alternateAddress: alternateAddress.addressId }))
            }

            console.error(error)
        }
    }

    render() {
        const { isLoading, currentAddress, confirmRegenerateTokenModalOpened, availableAlternateAddresses, selectedAlternateAddresses } = this.state
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
                        {/* Token */}
                        <Row style={{ marginTop: 60 + 'px' }}>
                            <Col xs='12' md='12'>
                                <div className="card">
                                    <Row className="p-4">
                                        <Col id="token">
                                            <h5>{t('other.token.title')}</h5>

                                            <h6 style={{ marginTop: '30px',}}>
                                                <Label className="form-label">
                                                    {t('other.token.title')}
                                                </Label>

                                                <span onClick={this.handleConfirmRegenerateTokenModal}>
                                                    <i
                                                        className="ms-4 fa fa-refresh fa-sm copy-btn"
                                                        data-for="regenerate"
                                                        data-tip={t('other.token.regenerate')}
                                                    />

                                                    <ReactTooltip place="bottom" id="regenerate"/>
                                                </span>
                                            </h6>

                                            <div className="mb-4">
                                                <Trans t={t} i18nKey="other.token.subtitle">
                                                    {
                                                        'Use this token to access CIDgravity APIs for reporting, miner discovery, and more. Find additional details in the'
                                                    }
                                                    <a
                                                        href={
                                                            'https://docs.cidgravity.com'
                                                        }
                                                        rel="noopener noreferrer"
                                                        target="_blank"
                                                    >
                                                        documentation documentation
                                                    </a>
                                                </Trans>
                                            </div>

                                            {currentAddress.token && (
                                                <CustomCodeHighlight text={currentAddress.token} />
                                            )}
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            {/* Friendly name */}
                            <Col xs='6' md='6' className="mb-4">
                                <div className="card mt-4 p-3" style={!isMobile ? { height: 180 + 'px' } : {}}>
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

                                    <div className="text-end mt-4 " onClick={() => this.saveFriendlyName()}>
                                        <Button className="custom-cidg-button">
                                            {t('other.friendlyName.button.save')}
                                        </Button>
                                    </div>
                                </div>
                            </Col>

                            {/* Alternate addresses */}               
                            <Col xs='6' md='6' className="mb-4">
                                <div className="card mt-4 p-3" style={!isMobile ? { height: 180 + 'px' } : {}}>
                                    <h5 className="mb-2">
                                        {t('other.alternateAddresses.title')}
                                    </h5>

                                    <Select
                                        className="mt-3"
                                        name="alternateAddresses"
                                        isMulti
                                        isClearable
                                        placeholder={t('other.alternateAddresses.placeholder')}
                                        onChange={this.handleAlternateAddressesChange}
                                        options={availableAlternateAddresses}
                                        value={selectedAlternateAddresses}
                                    />
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
                    <ConfirmRegenerateClientToken
                        isModalOpened={confirmRegenerateTokenModalOpened}
                        handleModal={this.handleConfirmRegenerateTokenModal}
                        handleSubmitRegenerate={this.regenerateMyConnectorToken}
                    />
                )}
            </Container>
        )
    }
}

export default withAuth0(
    withTranslation('ClientSettingsContainer')(ClientSettingsContainer)
)
