import React, { PureComponent } from 'react'

import { isBrowser, isMobile } from 'react-device-detect'
import { withAuth0 } from '@auth0/auth0-react'
import { Row, Col, Button, Badge } from 'reactstrap'
import { Link } from 'react-router-dom'
import { Loader } from 'shared/components'
import {
    ConfirmDeleteClient,
    BlockClientDeals,
    ClientHasAcl,
} from 'shared/modals'
import {
    GetCurrentGlobalLimits,
    GetCurrentAddress,
} from 'shared/services/addresses_claim'

import { toReadableSize } from 'shared/utils/file_size'
import {
    GetAllClientsForCurrentUserPaginated,
    CheckHasAssociatedAcl,
    RemoveClient,
    ChangeLockClientState,
} from 'shared/services/client'

import { toast } from 'react-toastify'
import { CustomPagination } from 'shared/components/CustomPagination'
import { Trans, withTranslation } from 'react-i18next'

import ReactTooltip from 'react-tooltip'

class ClientContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            isLoading: true,
            isError: false,

            clients: [],
            clickedClient: null,
            indexClickedClient: null,

            blockClientModalOpened: false,
            customMessageBlock: '',

            totalClients: 0,
            currentPage: 0,
            itemPerPage: 30,
            currentAddress: {
                settings: {
                    storageGlobalHourlyDealLimit: 0,
                    storageGlobalHourlyDealSizeLimit: 0,
                },
            },
            currentGlobalLimits: {
                globalStorageCurrentNumberDealRate: '',
                globalStorageCurrentSizeDealRate: '',
                globalRetrievalCurrentNumberDealRate: '',
            },
            confirmDeleteClientModalOpened: false,
            hasAssociatedAclModalOpen: false,
        }
    }

    componentDidMount() {
        this.loadCurrentGlobalLimits()
        this.loadExistingClients()
    }

    loadCurrentGlobalLimits = async () => {
        try {
            const currentAddress = await GetCurrentAddress()
            const response = await GetCurrentGlobalLimits()

            this.setState({
                currentGlobalLimits: response.data,
                currentAddress: currentAddress.data,
            })
        } catch (error) {
            this.setState({ error: true, isLoading: false })
        }
    }

    loadExistingClients = async () => {
        const { itemPerPage, currentPage } = this.state
        this.setState({ isLoading: true })

        try {
            const response = await GetAllClientsForCurrentUserPaginated(
                currentPage,
                itemPerPage
            )

            this.setState({
                clients: response.data['response'],
                totalClients: response.data['x-total-count'],
                isLoading: false,
            })
        } catch (error) {
            this.setState({ error: true, isLoading: false })
        }
    }

    onPageChanged = (_event, value) => {
        this.setState({ currentPage: value - 1, isLoading: true }, () =>
            this.loadExistingClients()
        )
    }

    handleBlockClientModal = () => {
        this.setState({ blockClientModalOpened: !this.state.blockClientModalOpened })
    }

    handleOpenedBlockClientModal = (client) => {
        this.setState({ clickedClient: client })
        this.handleBlockClientModal()
    }

    handleConfirmDeleteClientModal = (client, indexClient) => {
        CheckHasAssociatedAcl(client.id)
            .then((response) => {
                const hasAssociatedAcl = response.data
                if (hasAssociatedAcl) {
                    this.setState({
                        hasAssociatedAclModalOpen: true,
                        clientToDelete: client,
                        indexClientToDelete: indexClient,
                    })
                } else {
                    this.setState({
                        confirmDeleteClientModalOpened: !this.state.confirmDeleteClientModalOpened,
                        clientToDelete: client,
                        indexClientToDelete: indexClient,
                    })
                }
            })
            .catch((e) => {
                console.log(
                    'Error while checking if client has associated ACLs',
                    e
                )

                toast.error(
                    this.props.t('notification.error.onCheckHasAssociatedAcl')
                )
            })
    }

    handleDeleteClient = async () => {
        const { clientToDelete, clients, indexClientToDelete } = this.state
        this.closeDeleteClientModal()

        try {
            const response = await RemoveClient(clientToDelete)

            if (response) {
                var clientsCopy = [...clients]
                clientsCopy[indexClientToDelete].archived = true

                this.setState({
                    clientToDelete: null,
                    indexClientToDelete: null,
                    clients: clientsCopy,
                })

                toast.success(
                    this.props.t('notification.success.onRemoveClient')
                )
            } else {
                toast.error(this.props.t('notification.error.onRemoveClient'))
            }
        } catch (error) {
            toast.error(this.props.t('notification.error.onRemoveClient'))
        }
    }

    handleBlockClientMessageChange = (event) => {
        this.setState({ customMessageBlock: event.target.value })
    }

    handleChangeBlockClientState = async (client, indexClient) => {
        const { customMessageBlock, clickedClient } = this.state

        if (client != null && indexClient !== -1) {
            if (client.isBlocked) {
                try {
                    await ChangeLockClientState(client, '')

                    // reload clients with updated status
                    // modifing the array without a classic loading seems not working properly
                    // to fix: we can transform the class to component with useState ?
                    await this.loadExistingClients()
                    toast.success(this.props.t('notification.success.onUnblockClient'))

                } catch (error) {
                    toast.error(this.props.t('notification.error.onUnblockClient'))
                }
            }
        } else {
            try {
                await ChangeLockClientState(clickedClient, customMessageBlock)

                // reload clients with updated status
                // modifing the array without a classic loading seems not working properly
                // to fix: we can transform the class to component with useState ?
                await this.loadExistingClients()
                this.handleBlockClientModal()
                this.setState({ customMessageBlock: null, clickedClient: null })

                toast.success(this.props.t('notification.success.onBlockClient.other', { clientName: clickedClient.name }))
            } catch (error) {
                toast.error(this.props.t('notification.error.onBlockClient'))
            }
        }
    }

    closeDeleteClientModal = () => {
        this.setState({
            confirmDeleteClientModalOpened: false,
        })
    }

    render() {
        const { t } = this.props

        const {
            clients,
            isError,
            isLoading,
            clickedClient,
            confirmDeleteClientModalOpened,
            clientToDelete,
            totalClients,
            itemPerPage,
            customMessageBlock,
            blockClientModalOpened,
            hasAssociatedAclModalOpen,
            currentGlobalLimits,
            currentAddress,
        } = this.state

        return (
            <div className="container">
                <Row className="mt-4">
                    <Col xs={12} md={7}>
                        <h1>{t('title')}</h1>
                        <p>
                            <Trans t={t} i18nKey="subtitle" />
                        </p>
                    </Col>

                    {isBrowser && (
                        <Col xs={6} md={5}>
                            <div className="text-end">
                                <Button
                                    tag={Link}
                                    id="createNewClient"
                                    disabled={isLoading}
                                    to="./client/new"
                                    size="1x"
                                    className="me-2 custom-cidg-button"
                                >
                                    <span className="as--light">
                                        {t('button.newClient')}
                                    </span>
                                </Button>
                            </div>
                        </Col>
                    )}
                </Row>

                <Row className="p-4 mt-2 align-items-center align-items-stretch">
                    <Col
                        xs={6}
                        md={6}
                        className="align-items-center align-items-stretch alert alert-success"
                    >
                        <Row>
                            <Col md={4}>
                                {t('globalLimits.storage.storageDeals')}
                                <br />
                                {t('globalLimits.storage.deals', {
                                    count: currentGlobalLimits.globalStorageCurrentNumberDealRate,
                                })}
                                {' / '}
                                {currentAddress.settings
                                    .storageGlobalHourlyDealLimit < 1 ? (
                                    <span className="ms-2 font-italic">
                                        {t('globalLimits.storage.unlimited')}
                                    </span>
                                ) : (
                                    <>
                                        {t('globalLimits.storage.deals', {
                                            count: currentAddress.settings
                                                .storageGlobalHourlyDealLimit,
                                        })}
                                    </>
                                )}
                            </Col>

                            <Col md={4}>
                                {t(
                                    'globalLimits.storage.cumulativeStorageDeals'
                                )}

                                <br />

                                {t('globalLimits.sizeUnits.GiB', {
                                    count: toReadableSize(
                                        'B',
                                        'GiB',
                                        currentGlobalLimits.globalStorageCurrentSizeDealRate
                                    ),
                                })}

                                {' / '}

                                {currentAddress.settings
                                    .storageGlobalHourlyDealSizeLimit === 0 ? (
                                    <span className="ms-2 font-italic">
                                        {t('globalLimits.storage.unlimited')}
                                    </span>
                                ) : (
                                    <>
                                        {' '}
                                        {t('globalLimits.sizeUnits.GiB', {
                                            count: toReadableSize(
                                                'B',
                                                'GiB',
                                                currentAddress.settings
                                                    .storageGlobalHourlyDealSizeLimit
                                            ),
                                        })}
                                    </>
                                )}
                            </Col>

                            <Col md={3}>
                                <div className="text-end">
                                    <Button
                                        tag={Link}
                                        to="./settings/global"
                                        color="success"
                                        size="sm"
                                    >
                                        <span className="as--light">
                                            {t('button.modifyLimits')}
                                        </span>
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Col>

                    <Col xs={1} md={1} />

                    <Col
                        xs={5}
                        md={5}
                        className="align-items-center align-items-stretch alert alert-success"
                    >
                        <Row>
                            <Col md={9}>
                                {t('globalLimits.retrieval.retrievalDeals')}
                                <br />
                                {t('globalLimits.retrieval.deals', {
                                    count: currentGlobalLimits.globalRetrievalCurrentNumberDealRate,
                                })}
                                {' / '}
                                {currentAddress.settings
                                    .retrievalGlobalHourlyDealLimit < 1 ? (
                                    <span className="ms-2 font-italic">
                                        {t('globalLimits.retrieval.unlimited')}
                                    </span>
                                ) : (
                                    <>
                                        {' '}
                                        {t('globalLimits.retrieval.deals', {
                                            count: currentAddress.settings
                                                .retrievalGlobalHourlyDealLimit,
                                        })}
                                    </>
                                )}
                            </Col>

                            <Col md={3}>
                                <div className="text-end">
                                    <Button
                                        tag={Link}
                                        to="./settings/global"
                                        color="success"
                                        size="sm"
                                    >
                                        <span className="as--light">
                                            {t('button.modifyLimits')}
                                        </span>
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {isLoading ? (
                    <Loader />
                ) : clients && clients.length > 0 ? (
                    <Row className="mt-2">
                        <Col xs={12} md={12}>
                            <Row className="mb-2">
                                <Col
                                    className="u-pointer-cursor text-secondary"
                                    xs="3"
                                    md="3"
                                >
                                    {t('table.columns.clientName.title')}
                                </Col>
                                <Col
                                    className="u-pointer-cursor text-secondary"
                                    xs="2"
                                    md="2"
                                >
                                    {t('table.columns.pricingModel.title')}
                                </Col>
                                <Col
                                    className="u-pointer-cursor text-secondary"
                                    xs="2"
                                    md="2"
                                >
                                    {t(
                                        'table.columns.storageAcceptanceLogic.title'
                                    )}
                                </Col>
                                <Col
                                    className="u-pointer-cursor text-secondary"
                                    xs="3"
                                    md="3"
                                >
                                    {t(
                                        'table.columns.currentStorageRateLimit.title'
                                    )}
                                    <i
                                        data-for="dealRateTooltip"
                                        data-tip={t(
                                            'table.columns.currentStorageRateLimit.tooltip'
                                        )}
                                        className="ms-4 fas fa-info-circle"
                                    />
                                    <ReactTooltip
                                        place="top"
                                        id="dealRateTooltip"
                                    />
                                </Col>
                            </Row>

                            {clients.map((client, indexClient) => (
                                <>
                                    {!client.archived && (
                                        <div
                                            key={client.id}
                                            className="card-form p-3"
                                        >
                                            <Row className="align-items-center align-items-stretch">
                                                <Col
                                                    xs={isMobile ? '12' : '3'}
                                                    md={isMobile ? '12' : '3'}
                                                >
                                                    <div className="flex-fill align-items-center">
                                                        <div className="flex-fill d-flex align-items-center">
                                                            {client.name}
                                                        </div>
                                                    </div>
                                                </Col>

                                                <Col
                                                    xs={isMobile ? '12' : '2'}
                                                    md={isMobile ? '12' : '2'}
                                                    className={
                                                        isMobile ? 'mt-1' : ''
                                                    }
                                                >
                                                    <div className="flex-fill align-items-center">
                                                        <div className="flex-fill d-flex align-items-center">
                                                            {client.pricingModelId ===
                                                            null ? (
                                                                <>
                                                                    {
                                                                        client
                                                                            .pricingModel
                                                                            .name
                                                                    }

                                                                    <Badge
                                                                        color="success"
                                                                        className="ms-2"
                                                                    >
                                                                        {t(
                                                                            'table.columns.pricingModel.defaultBadge'
                                                                        )}
                                                                    </Badge>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {
                                                                        client
                                                                            .pricingModel
                                                                            .name
                                                                    }
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col>

                                                <Col
                                                    xs={isMobile ? '12' : '2'}
                                                    md={isMobile ? '12' : '2'}
                                                    className={
                                                        isMobile ? 'mt-1' : ''
                                                    }
                                                >
                                                    <div className="flex-fill align-items-center">
                                                        <div className="flex-fill d-flex align-items-center">
                                                            {client.storageAcceptanceLogicId ===
                                                            null ? (
                                                                <>
                                                                    {
                                                                        client
                                                                            .storageAcceptanceLogic
                                                                            .name
                                                                    }

                                                                    <Badge
                                                                        color="success"
                                                                        className="ms-2"
                                                                    >
                                                                        {t(
                                                                            'table.columns.storageAcceptanceLogic.defaultBadge'
                                                                        )}
                                                                    </Badge>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {
                                                                        client
                                                                            .storageAcceptanceLogic
                                                                            .name
                                                                    }
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col>

                                                <Col
                                                    xs={isMobile ? '6' : '2'}
                                                    md={isMobile ? '6' : '2'}
                                                    className={
                                                        isMobile ? 'mt-1' : ''
                                                    }
                                                >
                                                    <div className="flex-fill align-items-center">
                                                        <div className="me-2">
                                                            {t(
                                                                'globalLimits.storage.deals',
                                                                {
                                                                    count: client.currentRateLimit,
                                                                }
                                                            )}
                                                            {' / '}
                                                            {client.hourlyDealLimit ===
                                                            0 ? (
                                                                <span className="ms-2 font-italic">
                                                                    {t(
                                                                        'globalLimits.storage.unlimited'
                                                                    )}
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    {' '}
                                                                    {t(
                                                                        'globalLimits.storage.deals',
                                                                        {
                                                                            count: client.hourlyDealLimit,
                                                                        }
                                                                    )}
                                                                </>
                                                            )}
                                                            <br />
                                                            {t(
                                                                'globalLimits.sizeUnits.GiB',
                                                                {
                                                                    count: toReadableSize(
                                                                        'B',
                                                                        'GiB',
                                                                        client.currentDealSizeLimit
                                                                    ),
                                                                }
                                                            )}
                                                            {' / '}
                                                            {client.hourlyDealSizeLimit ===
                                                            0 ? (
                                                                <span className="ms-2 font-italic">
                                                                    {t(
                                                                        'globalLimits.retrieval.unlimited'
                                                                    )}
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    {' '}
                                                                    {t(
                                                                        'globalLimits.sizeUnits.GiB',
                                                                        {
                                                                            count: toReadableSize(
                                                                                'B',
                                                                                'GiB',
                                                                                client.hourlyDealSizeLimit
                                                                            ),
                                                                        }
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col>

                                                {isBrowser && (
                                                    <Col xs="3" md="3">
                                                        <div className="flex-fill align-items-center">
                                                            <div
                                                                id={
                                                                    'actionsClient' +
                                                                    indexClient
                                                                }
                                                                className="flex-fill d-flex align-items-center"
                                                            >
                                                                <Link
                                                                    style={{
                                                                        color: '#222b2a',
                                                                    }}
                                                                    className="card-rounded-btn ms-4 icons btn-pointer"
                                                                    id={`edit-${client.id}`}
                                                                    to={`./client/${client.id}`}
                                                                >
                                                                    <i
                                                                        className="fas fa-edit ms-4"
                                                                        data-for="edit"
                                                                        data-tip={t(
                                                                            'table.tooltip.editClient'
                                                                        )}
                                                                    />

                                                                    <ReactTooltip
                                                                        place="bottom"
                                                                        id="edit"
                                                                    />
                                                                </Link>

                                                                {!client
                                                                    .integration
                                                                    .id && (
                                                                    <>
                                                                        <span
                                                                            onClick={() =>
                                                                                this.handleConfirmDeleteClientModal(
                                                                                    client,
                                                                                    indexClient
                                                                                )
                                                                            }
                                                                            className="btn-pointer card-rounded-btn ms-4"
                                                                        >
                                                                            <i
                                                                                style={{
                                                                                    color: '#222b2a',
                                                                                }}
                                                                                className="fas fa-trash-alt"
                                                                                data-for="delete"
                                                                                data-tip={t(
                                                                                    'table.tooltip.deleteClient'
                                                                                )}
                                                                            />

                                                                            <ReactTooltip
                                                                                place="bottom"
                                                                                id="delete"
                                                                            />
                                                                        </span>
                                                                    </>
                                                                )}

                                                                {client.email && (
                                                                    <span className="card-rounded-btn">
                                                                        <a
                                                                            href={
                                                                                'mailto:' +
                                                                                client.email
                                                                            }
                                                                        >
                                                                            <i
                                                                                style={{
                                                                                    color: '#222b2a',
                                                                                }}
                                                                                className="fas fa-envelope ms-4"
                                                                                data-for="contactByEmail"
                                                                                data-tip={t(
                                                                                    'table.tooltip.sendEmail'
                                                                                )}
                                                                            />
                                                                        </a>

                                                                        <ReactTooltip
                                                                            place="bottom"
                                                                            id="contactByEmail"
                                                                        />
                                                                    </span>
                                                                )}

                                                                {client.slack && (
                                                                    <span className="card-rounded-btn">
                                                                        <i
                                                                            style={{
                                                                                color: '#222b2a',
                                                                            }}
                                                                            className="fab fa-slack ms-4"
                                                                            data-for="slackUsername"
                                                                            data-tip={
                                                                                client.slack
                                                                            }
                                                                        />

                                                                        <ReactTooltip
                                                                            place="bottom"
                                                                            id="slackUsername"
                                                                        />
                                                                    </span>
                                                                )}

                                                                {!client.isBlocked ? (
                                                                    <span
                                                                        onClick={() =>
                                                                            this.handleOpenedBlockClientModal(
                                                                                client
                                                                            )
                                                                        }
                                                                        className="btn-pointer me-2 ms-2 card-rounded-btn"
                                                                    >
                                                                        <i
                                                                            style={{
                                                                                color: 'green',
                                                                            }}
                                                                            className="fas fa-check ms-4"
                                                                            data-for="lockClient"
                                                                            data-tip={t(
                                                                                'table.tooltip.blockClient'
                                                                            )}
                                                                        />

                                                                        <ReactTooltip
                                                                            place="bottom"
                                                                            id="lockClient"
                                                                        />
                                                                    </span>
                                                                ) : (
                                                                    <span
                                                                        onClick={() =>
                                                                            this.handleChangeBlockClientState(
                                                                                client,
                                                                                indexClient
                                                                            )
                                                                        }
                                                                        className="btn-pointer me-2 ms-2 card-rounded-btn"
                                                                    >
                                                                        <i
                                                                            style={{
                                                                                color: 'red',
                                                                            }}
                                                                            className="fas fa-times ms-4"
                                                                            data-for="allowClient"
                                                                            data-tip={t(
                                                                                'table.tooltip.unblockClient'
                                                                            )}
                                                                        />

                                                                        <ReactTooltip
                                                                            place="bottom"
                                                                            id="allowClient"
                                                                        />
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                )}

                                                {isMobile && (
                                                    <Col
                                                        xs="12"
                                                        md="12"
                                                        className="mt-1"
                                                    >
                                                        {!client.isBlocked ? (
                                                            <Button
                                                                color="success"
                                                                size="sm"
                                                                onClick={() =>
                                                                    this.handleOpenedBlockClientModal(
                                                                        client
                                                                    )
                                                                }
                                                            >
                                                                <span className="as--light">
                                                                    {t(
                                                                        'table.tooltip.blockClient'
                                                                    )}
                                                                </span>
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                color="danger"
                                                                size="sm"
                                                                onClick={() =>
                                                                    this.handleChangeBlockClientState(
                                                                        client,
                                                                        indexClient
                                                                    )
                                                                }
                                                            >
                                                                <span className="as--light">
                                                                    {t(
                                                                        'table.tooltip.unblockClient'
                                                                    )}
                                                                </span>
                                                            </Button>
                                                        )}
                                                    </Col>
                                                )}

                                                {client.integration !==
                                                    null && (
                                                    <Col xs="1" md="1">
                                                        <div className="flex-fill align-items-center">
                                                            <div className="flex-fill d-flex align-items-center">
                                                                <Badge color="info">
                                                                    {client.integration.name.toUpperCase()}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                )}
                                            </Row>
                                        </div>
                                    )}
                                </>
                            ))}

                            <CustomPagination
                                currentPage={this.state.currentPage + 1}
                                totalElements={totalClients}
                                itemPerPage={itemPerPage}
                                onPageChanged={this.onPageChanged}
                            />
                        </Col>
                    </Row>
                ) : isError ? (
                    <div
                        className="alert alert-danger"
                        role="alert"
                        style={{ marginTop: '50px' }}
                    >
                        {t('errors.unableToLoad')}
                    </div>
                ) : (
                    <section className="card-form">
                        {t('errors.noClientFound')} <br />
                        {t('errors.addPricingModelBefore')}
                    </section>
                )}

                {confirmDeleteClientModalOpened && (
                    <ConfirmDeleteClient
                        isModalOpen={confirmDeleteClientModalOpened}
                        handleClose={this.closeDeleteClientModal}
                        client={clientToDelete}
                        handleDeleteClient={this.handleDeleteClient}
                    />
                )}

                {blockClientModalOpened && (
                    <BlockClientDeals
                        isModalOpened={blockClientModalOpened}
                        handleModal={this.handleOpenedBlockClientModal}
                        client={clickedClient}
                        customMessage={customMessageBlock}
                        customMessageChange={
                            this.handleBlockClientMessageChange
                        }
                        handleBlockClient={this.handleChangeBlockClientState}
                        handleDeleteClient={this.handleDeleteClient}
                    />
                )}
                {hasAssociatedAclModalOpen && (
                    <ClientHasAcl
                        client={clientToDelete}
                        isOpen={hasAssociatedAclModalOpen}
                        setIsOpen={() =>
                            this.setState({ hasAssociatedAclModalOpen: false })
                        }
                        toRoute={'./retrieval-acl'}
                    />
                )}
            </div>
        )
    }
}

export default withAuth0(withTranslation('ClientContainer')(ClientContainer))
