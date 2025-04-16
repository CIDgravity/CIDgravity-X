import { PureComponent } from 'react'

import { withAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Button, Col, Container, Row } from 'reactstrap'
import { Loader } from 'shared/components'

import { ViewAddressAccessRights, ConfirmUnlinkAddress } from 'shared/modals'

import {
    CheckAddressClaimedLimit,
    DeleteLinkBetweenAddressAndCurrentUser,
    DeleteLinkBetweenAddressAndUser,
    GetListOfUsersWhoHaveAccessToAddress
} from 'shared/services/addresses_claim'

import { withTranslation } from 'react-i18next'

import { GetCurrentUser } from 'shared/services/account'
import { shortenAddress } from 'shared/utils/filecoinUtil'
import { loadAddressesFromJwt } from 'shared/utils/addresses'
import { GetSelectedAddressIdFromSessionStorage } from 'shared/utils/auth'

import ReactTooltip from 'react-tooltip'
import CustomBadgeOffer from 'shared/components/CustomBadgeOffer'

class MyAddressesContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            isLoading: true,
            error: false,
            currentUser: null,
            providerOwnedAddresses: [],
            clientOwnedAddresses: [],
            viewAccessRightModalOpened: false,
            confirmAddressDeletionModalOpened: false,
            selectedAddressForModal: null,
            selectedAddressForTenant: null,
            usersWhoHaveAccessToAddress: [],
            hasReachedAddressClaimedLimit: false,
        }
    }

    async componentDidMount() {
        await this.loadCurrentUser()
        await this.loadHasReachedAddressClaimedLimit()
        await this.loadAllAddressesFromJwt()
    }

    loadAllAddressesFromJwt = async() => {
        const { getAccessTokenSilently } = this.props.auth0

        // Must ignore cache here to avoid 401 error when deleting and always get the up to date token
        const token = await getAccessTokenSilently({ ignoreCache: true })

        // Load addresses from JWT
        const [clientAddresses, providerAddresses] = await loadAddressesFromJwt(token)

        this.setState({
            clientOwnedAddresses: clientAddresses,
            providerOwnedAddresses: providerAddresses,
            selectedAddressForTenant: GetSelectedAddressIdFromSessionStorage(),
            isLoading: false,
        })
    }

    loadHasReachedAddressClaimedLimit = async () => {
        try {
            const response = await CheckAddressClaimedLimit()
            const hasReachedAddressClaimedLimit = response.data?.value
            if (hasReachedAddressClaimedLimit !== undefined) {
                this.setState({ hasReachedAddressClaimedLimit: hasReachedAddressClaimedLimit })
            }
        } catch (error) {
            console.log('Error while fetching if user has reached address claimed limit', error)
            this.setState({ error: true })
        }
    }

    loadCurrentUser = async () => {
        try {
            const currentUser = await GetCurrentUser()
            this.setState({ currentUser: currentUser.data })
        } catch (error) {
            console.log('unable to load current user', error)
            this.setState({ error: true })
        }
    }

    handleDeleteAddressClaimedByUser = async (address) => {
        const { t } = this.props
        try {
            this.setState({ isLoading: true }, async () => {
                const unlinkAddress = await DeleteLinkBetweenAddressAndCurrentUser(address.addressId)

                if (unlinkAddress.status === 200) {
                    toast.success(t('notification.success.onDeleteAddress'))
                    await this.loadAllAddressesFromJwt()
                    await this.loadHasReachedAddressClaimedLimit()
                } else {
                    toast.error(t('notification.error.onDeleteAddress'))
                }

                this.setState({ isLoading: false })
            })
        } catch (error) {
            toast.error(t('notification.error.onDeleteAddress'))
            this.setState({ isLoading: false })
        }
    }

    loadUsersWhoHaveAccessToAddress = async (address) => {
        try {
            this.setState({ isLoading: true }, async () => {
                const users = await GetListOfUsersWhoHaveAccessToAddress(address.addressId)
                this.setState({ isLoading: false, usersWhoHaveAccessToAddress: users.data })
            })
        } catch (error) {
            console.log('error while loading users who have access to address', error)
            this.setState({ isLoading: false, error: true })
        }
    }

    handleConfirmAddressDeletionModal = async (address) => {
        const { confirmAddressDeletionModalOpened } = this.state

        if (!confirmAddressDeletionModalOpened) {
            this.setState({ confirmAddressDeletionModalOpened: true, selectedAddressForModal: address })
        } else {
            this.setState({ selectedAddressForModal: null, confirmAddressDeletionModalOpened: false })
        }
    }

    handleViewAccessRightModal = async (address) => {
        const { viewAccessRightModalOpened } = this.state

        // Load only if we will open the modal
        // Load users who have access to the selected address
        if (!viewAccessRightModalOpened) {
            this.loadUsersWhoHaveAccessToAddress(address)
            this.setState({ viewAccessRightModalOpened: true, selectedAddressForModal: address })
        } else {
            this.setState({
                usersWhoHaveAccessToAddress: [],
                selectedAddressForModal: null,
                viewAccessRightModalOpened: false,
            })
        }
    }

    handleRemoveAccessOnOwnedAddress = async (user, address) => {
        const { t } = this.props
        try {
            this.setState({ isLoading: true }, async () => {
                const unlinkAddress = await DeleteLinkBetweenAddressAndUser(address.addressId, user.user_id)
                
                if (unlinkAddress.status === 200) {
                    toast.success(t('notification.success.onRemoveAccess'))
                    this.loadUsersWhoHaveAccessToAddress(address)
                } else {
                    toast.error(t('notification.error.onRemoveAccess'))
                }
                this.setState({ isLoading: false })
            })
        } catch (error) {
            console.log('unable to delete address', error)
            toast.error(t('notification.error.onRemoveAccess'))
            this.setState({ isLoading: false })
        }
    }

    getComponentReady = () => {
        const {
            error,
            providerOwnedAddresses,
            clientOwnedAddresses,
            viewAccessRightModalOpened,
            confirmAddressDeletionModalOpened,
            selectedAddressForModal,
            selectedAddressForTenant,
            usersWhoHaveAccessToAddress,
            currentUser,
        } = this.state
        const { t } = this.props
        return (
            <>
                <Row className="mt-4">
                    <Col xs={12} md={12} className="mt-4">
                        <h5 className="mb-4">{t('minerAddress.title')}</h5>

                        {providerOwnedAddresses && providerOwnedAddresses.length > 0 ? (
                            <>
                                <Row className="d-md-flex mb-2">
                                    <Col className="u-pointer-cursor text-secondary" xs="3" md="3">
                                        {t('minerAddress.table.friendlyName.title')}
                                    </Col>

                                    <Col className="u-pointer-cursor text-secondary" xs="3" md="3">
                                        {t('minerAddress.table.addressId.title')}
                                    </Col>

                                    <Col className="u-pointer-cursor text-secondary" xs="2" md="2">
                                        {t('minerAddress.table.aclOffers.title')}
                                    </Col>

                                    <Col className="u-pointer-cursor text-secondary" xs="2" md="2">
                                        {t('minerAddress.table.actorType.title')}
                                    </Col>
                                </Row>

                                {providerOwnedAddresses.map((providerAddress) => (
                                    <>
                                        <div
                                            key={providerAddress.addressId}
                                            className={
                                                providerAddress.actorType
                                                    ? 'p-3 card-form'
                                                    : 'p-3 card-form-alternative useless-miner'
                                            }
                                        >
                                            <Row key={providerAddress.addressId} className="align-items-center align-items-stretch">
                                                <Col xs="3" md="3">
                                                    <div className="flex-fill d-flex align-items-center">
                                                        {providerAddress.friendlyName}
                                                    </div>
                                                </Col>

                                                <Col xs="3" md="3">
                                                    <div className="flex-fill d-flex align-items-center">
                                                        {providerAddress.addressId}
                                                    </div>
                                                </Col>

                                                <Col xs="2" md="2">
                                                    <div className="flex-fill d-flex align-items-center">
                                                        <CustomBadgeOffer
                                                            aclOffers={providerAddress.aclOffers}
                                                            displayAllOffers={true}
                                                            i18nObject={t('minerAddress.table.aclOffers', { returnObjects: true })}
                                                        />
                                                    </div>
                                                </Col>

                                                <Col xs="2" md="2">
                                                    <div className="flex-fill d-flex align-items-center">
                                                        <span className={"badge " + providerAddress.actorType}>
                                                            {providerAddress.actorType}
                                                        </span>
                                                    </div>
                                                </Col>

                                                <Col xs="2" md="2">
                                                    {providerAddress.actorType && (
                                                        <span
                                                            onClick={() => this.handleViewAccessRightModal(providerAddress)}
                                                            className="btn-pointer card-rounded-btn ms-4"
                                                        >
                                                            <i
                                                                style={{ color: '#222b2a' }}
                                                                className="fas fa-key"
                                                                data-for="view"
                                                                data-tip={t('minerAddress.table.access.tooltip')}
                                                            />

                                                            <ReactTooltip place="bottom" id="view"/>
                                                        </span>
                                                    )}

                                                    {selectedAddressForTenant !== providerAddress.addressId && (
                                                        <span
                                                            onClick={() => this.handleConfirmAddressDeletionModal(providerAddress)}
                                                            className="btn-pointer card-rounded-btn ms-4"
                                                        >
                                                            <i
                                                                style={{ color: '#222b2a' }}
                                                                className="fas fa-trash-alt"
                                                                data-for="delete"
                                                                data-tip={t('minerAddress.table.delete.tooltip')}
                                                            />

                                                            <ReactTooltip place="bottom" id="delete" />
                                                        </span>
                                                    )}
                                                </Col>
                                            </Row>
                                        </div>
                                    </>
                                ))}
                            </>
                        ) : error ? (
                            <div className="alert alert-danger" role="alert" style={{ marginTop: '50px' }}>
                                {t('minerAddress.error.generic')}
                            </div>
                        ) : (
                            <section className="card-form">
                                {t('minerAddress.table.empty')}
                            </section>
                        )}
                    </Col>
                </Row>

                <Row>
                    <Col xs={12} md={12} className="mt-4">
                        <h5 className="mb-4">{t('clientAddress.title')}</h5>

                        {clientOwnedAddresses && clientOwnedAddresses.length > 0 ? (
                            <>
                                <Row className="d-md-flex mb-2">
                                    <Col className="u-pointer-cursor text-secondary" xs="2" md="2">
                                        {t('clientAddress.table.friendlyName.title')}
                                    </Col>

                                    <Col className="u-pointer-cursor text-secondary" xs="2" md="2">
                                        {t('clientAddress.table.addressId.title')}
                                    </Col>

                                    <Col className="u-pointer-cursor text-secondary" xs="2" md="2">
                                        {t('clientAddress.table.longAddress.title')}
                                    </Col>

                                    <Col className="u-pointer-cursor text-secondary" xs="2" md="2">
                                        {t('clientAddress.table.aclOffers.title')}
                                    </Col>

                                    <Col className="u-pointer-cursor text-secondary" xs="2" md="2">
                                        {t('clientAddress.table.actorType.title')}
                                    </Col>
                                </Row>

                                {clientOwnedAddresses.map(
                                    (clientOwnedAddress) => (
                                        <>
                                            <div key={clientOwnedAddress.addressId} className={`p-3 card-form`}>
                                                <Row key={clientOwnedAddress.addressId} className="align-items-center align-items-stretch">
                                                    <Col xs="2" md="2">
                                                        <div className="flex-fill d-flex align-items-center">
                                                            {clientOwnedAddress.friendlyName}
                                                        </div>
                                                    </Col>

                                                    <Col xs="2" md="2">
                                                        <div className="flex-fill d-flex align-items-center">
                                                            {clientOwnedAddress.addressId}
                                                        </div>
                                                    </Col>

                                                    <Col xs="2" md="2">
                                                        <div
                                                            className="flex-fill d-flex align-items-center"
                                                            data-for="viewLongAddress"
                                                            data-tip={clientOwnedAddress.address}
                                                        >
                                                            {shortenAddress(clientOwnedAddress.address)}
                                                        </div>

                                                        <ReactTooltip place="bottom" id="viewLongAddress" />
                                                    </Col>

                                                    <Col xs="2" md="2">
                                                        <CustomBadgeOffer
                                                            aclOffers={clientOwnedAddress.aclOffers}
                                                            displayAllOffers={true}
                                                            i18nObject={t('clientAddress.table.aclOffers', { returnObjects: true })}
                                                        />
                                                    </Col>

                                                    <Col xs="2" md="2">
                                                        <div className="flex-fill d-flex align-items-center">
                                                            <span className={"badge " + clientOwnedAddress.actorType}>
                                                                {clientOwnedAddress.actorType}
                                                            </span>
                                                        </div>
                                                    </Col>

                                                    <Col xs="2" md="2">
                                                        <span
                                                            onClick={() => this.handleViewAccessRightModal(clientOwnedAddress)}
                                                            className="btn-pointer card-rounded-btn ms-4"
                                                        >
                                                            <i
                                                                style={{ color: '#222b2a' }}
                                                                className="fas fa-key"
                                                                data-for="view"
                                                                data-tip={t('clientAddress.table.access.tooltip')}
                                                            />

                                                            <ReactTooltip place="bottom" id="view" />
                                                        </span>

                                                        {selectedAddressForTenant !== clientOwnedAddress.addressId && (
                                                            <span
                                                                onClick={() => this.handleConfirmAddressDeletionModal( clientOwnedAddress)}
                                                                className="btn-pointer card-rounded-btn ms-4"
                                                            >
                                                                <i
                                                                    style={{ color: '#222b2a' }}
                                                                    className="fas fa-trash-alt"
                                                                    data-for="delete"
                                                                    data-tip={t('clientAddress.table.delete.tooltip')}
                                                                />

                                                                <ReactTooltip place="bottom" id="delete" />
                                                            </span>
                                                        )}
                                                    </Col>
                                                </Row>
                                            </div>
                                        </>
                                    )
                                )}
                            </>
                        ) : error ? (
                            <div className="alert alert-danger" role="alert" style={{ marginTop: '50px' }}>
                                {t('clientAddress.error.generic')}
                            </div>
                        ) : (
                            <section className="card-form">
                                {t('clientAddress.table.empty')}
                            </section>
                        )}
                    </Col>
                </Row>

                {viewAccessRightModalOpened && (
                    <ViewAddressAccessRights
                        isModalOpened={viewAccessRightModalOpened}
                        handleModal={this.handleViewAccessRightModal}
                        address={selectedAddressForModal}
                        users={usersWhoHaveAccessToAddress}
                        removeAccessOnAddress={this.handleRemoveAccessOnOwnedAddress}
                        currentUser={currentUser}
                    />
                )}

                {confirmAddressDeletionModalOpened && (
                    <ConfirmUnlinkAddress
                        isModalOpened={confirmAddressDeletionModalOpened}
                        handleModal={this.handleConfirmAddressDeletionModal}
                        handleDeleteAddress={this.handleDeleteAddressClaimedByUser}
                        selectedAddress={selectedAddressForModal}
                    />
                )}
            </>
        )
    }

    getComponentLoading = () => {
        return (
            <>
                <Row>
                    <Loader />
                </Row>
            </>
        )
    }

    render() {
        const { isLoading, hasReachedAddressClaimedLimit } = this.state
        const { t } = this.props

        return (
            <Container>
                <Row className="mt-4 mb-4">
                    <Col xs={12} md={6}>
                        <h1>{t('title')}</h1>
                    </Col>

                    {!isLoading ? (
                        <Col xs={12} md={6}>
                            <div
                                className="text-end ms-2"
                                data-for="claimNewAddress"
                                data-tip={
                                    hasReachedAddressClaimedLimit
                                        ? t('button.claimNewAddress.tooltip.onMaximumReached')
                                        : null
                                }
                            >
                                <Button
                                    tag={Link}
                                    to="/wizard"
                                    type="submit"
                                    disabled={hasReachedAddressClaimedLimit}
                                    size="1x"
                                    className="me-4 custom-cidg-button"
                                >
                                    <span className="as--light">
                                        {t('button.claimNewAddress.label')}
                                    </span>
                                </Button>
                            </div>
                            <ReactTooltip id="claimNewAddress" place="bottom" />
                        </Col>
                    ) : null}
                </Row>
                {isLoading
                    ? this.getComponentLoading()
                    : this.getComponentReady()}
            </Container>
        )
    }
}

export default withAuth0(
    withTranslation('MyAddressesContainer')(MyAddressesContainer)
)
