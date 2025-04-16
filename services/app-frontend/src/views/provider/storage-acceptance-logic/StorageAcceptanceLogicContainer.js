import React, { PureComponent } from 'react'

import { withAuth0 } from '@auth0/auth0-react'
import { Button, Col, Row, Badge } from 'reactstrap'
import { Link } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import { isBrowser, isMobile } from 'react-device-detect'

import { Loader } from 'shared/components'
import {
    ViewStorageAcceptanceLogic,
    ConfirmDeleteAcceptanceLogic,
} from 'shared/modals'
import {
    UpdateDefaultAcceptanceLogic,
    GetAllAcceptanceLogicsForCurrentUserPaginated,
    RemoveAcceptanceLogic,
} from 'shared/services/storage-acceptance-logic'
import { CustomPagination } from 'shared/components/CustomPagination'
import { toast } from 'react-toastify'

import ReactTooltip from 'react-tooltip'

class StorageAcceptanceLogicContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            error: false,
            isLoading: true,
            viewAcceptanceLogicModalOpened: false,
            confirmDeleteAcceptanceLogicModalOpened: false,
            clickedAcceptanceLogic: null,
            indexAcceptanceLogicToDelete: null,
            acceptanceLogics: [],
            totalAcceptanceLogics: 0,
            currentPage: 0,
            itemPerPage: 30,
        }
    }

    async componentDidMount() {
        await this.loadExistingAcceptanceLogics()
    }

    loadExistingAcceptanceLogics = async () => {
        const { itemPerPage, currentPage } = this.state

        try {
            const response =
                await GetAllAcceptanceLogicsForCurrentUserPaginated(
                    currentPage,
                    itemPerPage
                )

            this.setState({
                acceptanceLogics: response.data['response'],
                totalAcceptanceLogics: response.data['x-total-count'],
                isLoading: false,
            })
        } catch (error) {
            this.setState({ error: true, isLoading: false })
        }
    }

    handleViewAcceptanceLogicModal = () => {
        this.setState({
            viewAcceptanceLogicModalOpened:
                !this.state.viewAcceptanceLogicModalOpened,
        })
    }

    handleChangeDefaultAcceptanceLogic = async (acceptanceLogic, index) => {
        const { t } = this.props
        var acceptanceLogicsCopy = [...this.state.acceptanceLogics]

        acceptanceLogicsCopy.map(
            (logic, idx) => (acceptanceLogicsCopy[idx].isDefault = false)
        )
        acceptanceLogicsCopy[index].isDefault = true

        try {
            const response = await UpdateDefaultAcceptanceLogic(
                acceptanceLogic.id
            )

            if (response) {
                this.setState({ acceptanceLogics: acceptanceLogicsCopy })
                await this.loadExistingAcceptanceLogics()
                this.setState({ isLoading: false })
                toast.success(
                    t('notification.success.onUpdateDefaultAcceptanceLogic')
                )
            } else {
                toast.error(
                    t('notification.error.onUpdateDefaultAcceptanceLogic')
                )
            }
        } catch (error) {
            toast.error(t('notification.error.onUpdateDefaultAcceptanceLogic'))
        }
    }

    handleConfirmDeleteAcceptanceLogicModal = (acceptanceLogic, index) => {
        if (acceptanceLogic) {
            this.setState({
                confirmDeleteAcceptanceLogicModalOpened:
                    !this.state.confirmDeleteAcceptanceLogicModalOpened,
                clickedAcceptanceLogic: acceptanceLogic,
                indexAcceptanceLogicToDelete: index,
            })
        } else {
            this.setState({ confirmDeleteAcceptanceLogicModalOpened: false })
        }
    }

    handleDeleteAcceptanceLogic = async () => {
        const { t } = this.props
        const {
            clickedAcceptanceLogic,
            acceptanceLogics,
            indexAcceptanceLogicToDelete,
        } = this.state

        try {
            const response = await RemoveAcceptanceLogic(clickedAcceptanceLogic)

            if (response) {
                var acceptanceLogicsCopy = [...acceptanceLogics]
                acceptanceLogicsCopy[
                    indexAcceptanceLogicToDelete
                ].isArchived = true

                this.setState({
                    confirmDeleteAcceptanceLogicModalOpened: false,
                    acceptanceLogicToDelete: null,
                    indexAcceptanceLogicToDelete: null,
                    acceptanceLogics: acceptanceLogicsCopy,
                })

                toast.success(t('notification.success.onDeleteAcceptanceLogic'))
            } else {
                toast.error(t('notification.error.onDeleteAcceptanceLogic'))
            }
        } catch (error) {
            toast.error(t('notification.error.onDeleteAcceptanceLogic'))
        }
    }

    handlePageChanged = (value) => {
        this.setState({ currentPage: value - 1, isLoading: true }, () =>
            this.loadExistingAcceptanceLogics()
        )
    }

    handleOpenedViewAcceptanceLogic = (acceptanceLogic) => {
        this.setState({ clickedAcceptanceLogic: acceptanceLogic })
        this.handleViewAcceptanceLogicModal()
    }

    render() {
        const { t } = this.props
        const {
            acceptanceLogics,
            totalAcceptanceLogics,
            error,
            isLoading,
            confirmDeleteAcceptanceLogicModalOpened,
            viewAcceptanceLogicModalOpened,
            clickedAcceptanceLogic,
            currentPage,
            itemPerPage,
        } = this.state

        return (
            <div className="container">
                <Row className="mt-4">
                    <Col xs={12} md={8}>
                        <h1>{t('title')}</h1>
                        <p>
                            {t('subtitle')}
                            <br />

                            <span style={{ color: 'red' }}>
                                {t('requirements')}
                            </span>
                        </p>
                    </Col>

                    {acceptanceLogics && !isLoading && isBrowser && (
                        <Col xs={12} md={4}>
                            <div className="text-end ms-2">
                                <Button
                                    tag={Link}
                                    id="createNewAcceptanceLogic"
                                    to="./storage-acceptance-logic/new"
                                    type="submit"
                                    color="primary"
                                    size="1x"
                                    className="me-4 custom-cidg-button"
                                >
                                    <span className="as--light">
                                        {t('button.new')}
                                    </span>
                                </Button>
                            </div>
                        </Col>
                    )}
                </Row>

                <Row className="mt-4">
                    <Col xs={12} md={12}>
                        {isLoading ? (
                            <Loader />
                        ) : acceptanceLogics && acceptanceLogics.length > 0 ? (
                            <>
                                <Row className="d-md-flex mb-2">
                                    <Col
                                        className="u-pointer-cursor text-secondary"
                                        xs="5"
                                        md="5"
                                    >
                                        {t('table.name.title')}
                                    </Col>
                                    <Col
                                        className="u-pointer-cursor text-secondary"
                                        xs="3"
                                        md="3"
                                    >
                                        {t('table.client.title')}
                                    </Col>
                                </Row>

                                {acceptanceLogics.map(
                                    (acceptanceLogic, index) => (
                                        <>
                                            {!acceptanceLogic.isArchived && (
                                                <div
                                                    id={'modelCard' + index}
                                                    key={acceptanceLogic.id}
                                                    className={`p-3 ${
                                                        acceptanceLogic.isDefault
                                                            ? 'card-form-default'
                                                            : 'card-form'
                                                    }`}
                                                >
                                                    <Row
                                                        key={acceptanceLogic.id}
                                                        className="align-items-center align-items-stretch"
                                                    >
                                                        <Col
                                                            xs={
                                                                isMobile
                                                                    ? '4'
                                                                    : '5'
                                                            }
                                                            md={
                                                                isMobile
                                                                    ? '5'
                                                                    : '5'
                                                            }
                                                        >
                                                            <div className="flex-fill d-flex align-items-center">
                                                                {
                                                                    acceptanceLogic.name
                                                                }
                                                            </div>
                                                        </Col>

                                                        <Col
                                                            xs={
                                                                isMobile
                                                                    ? '5'
                                                                    : '3'
                                                            }
                                                            md={
                                                                isMobile
                                                                    ? '5'
                                                                    : '3'
                                                            }
                                                        >
                                                            <div className="flex-fill d-flex align-items-center">
                                                                {acceptanceLogic.isDefault ? (
                                                                    <>
                                                                        {t(
                                                                            'table.client.defaultContentAndClients',
                                                                            {
                                                                                count:
                                                                                    acceptanceLogic.clients &&
                                                                                    acceptanceLogic.clientsWithDefault
                                                                                        ? acceptanceLogic
                                                                                              .clients
                                                                                              .length +
                                                                                          acceptanceLogic
                                                                                              .clientsWithDefault
                                                                                              .length
                                                                                        : 0,
                                                                            }
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {t(
                                                                            'table.client.content',
                                                                            {
                                                                                count: acceptanceLogic.clients
                                                                                    ? acceptanceLogic
                                                                                          .clients
                                                                                          .length
                                                                                    : 0,
                                                                            }
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </Col>

                                                        {isBrowser && (
                                                            <Col
                                                                id={
                                                                    'pricingModelActions' +
                                                                    index
                                                                }
                                                                xs="3"
                                                                md="3"
                                                            >
                                                                <div className="flex-fill d-flex align-items-center">
                                                                    <span
                                                                        id={
                                                                            'viewLogic' +
                                                                            index
                                                                        }
                                                                        onClick={() =>
                                                                            this.handleOpenedViewAcceptanceLogic(
                                                                                acceptanceLogic
                                                                            )
                                                                        }
                                                                        className="btn-pointer card-rounded-btn"
                                                                    >
                                                                        <i
                                                                            className="fas fa-eye"
                                                                            data-for="view"
                                                                            data-tip={t(
                                                                                'table.view.tooltip'
                                                                            )}
                                                                        />

                                                                        <ReactTooltip
                                                                            place="bottom"
                                                                            id="view"
                                                                        />
                                                                    </span>

                                                                    {acceptanceLogic.isDefault ? (
                                                                        <Link
                                                                            style={{
                                                                                color: '#ffff',
                                                                            }}
                                                                            className="card-rounded-btn ms-4 icons-white btn-pointer"
                                                                            id={`edit-${acceptanceLogic.id}`}
                                                                            to={`./storage-acceptance-logic/${acceptanceLogic.id}`}
                                                                        >
                                                                            <i
                                                                                id={
                                                                                    'editAcceptanceLogic' +
                                                                                    index
                                                                                }
                                                                                className="fas fa-edit"
                                                                                data-for="edit"
                                                                                data-tip={t(
                                                                                    'table.edit.tooltip'
                                                                                )}
                                                                            />

                                                                            <ReactTooltip
                                                                                place="bottom"
                                                                                id="edit"
                                                                            />
                                                                        </Link>
                                                                    ) : (
                                                                        <Link
                                                                            style={{
                                                                                color: '#222b2a',
                                                                            }}
                                                                            className="card-rounded-btn ms-4 icons btn-pointer"
                                                                            id={`edit-${acceptanceLogic.id}`}
                                                                            to={`./storage-acceptance-logic/${acceptanceLogic.id}`}
                                                                        >
                                                                            <i
                                                                                className="fas fa-edit"
                                                                                data-for="edit"
                                                                                data-tip={t(
                                                                                    'table.edit.tooltip'
                                                                                )}
                                                                            />

                                                                            <ReactTooltip
                                                                                place="bottom"
                                                                                id="edit"
                                                                            />
                                                                        </Link>
                                                                    )}

                                                                    {!acceptanceLogic.isDefault && (
                                                                        <>
                                                                            <span
                                                                                onClick={() =>
                                                                                    this.handleConfirmDeleteAcceptanceLogicModal(
                                                                                        acceptanceLogic,
                                                                                        index
                                                                                    )
                                                                                }
                                                                                className="btn-pointer card-rounded-btn ms-4"
                                                                            >
                                                                                <i
                                                                                    className="fas fa-trash-alt"
                                                                                    data-for="delete"
                                                                                    data-tip={t(
                                                                                        'table.delete.tooltip'
                                                                                    )}
                                                                                />

                                                                                <ReactTooltip
                                                                                    place="bottom"
                                                                                    id="delete"
                                                                                />
                                                                            </span>

                                                                            <span
                                                                                onClick={() =>
                                                                                    this.handleChangeDefaultAcceptanceLogic(
                                                                                        acceptanceLogic,
                                                                                        index
                                                                                    )
                                                                                }
                                                                                className="btn-pointer card-rounded-btn ms-4"
                                                                            >
                                                                                <i
                                                                                    className="fas fa-shield-alt"
                                                                                    data-for="default"
                                                                                    data-tip={t(
                                                                                        'table.setToDefault.tooltip'
                                                                                    )}
                                                                                />

                                                                                <ReactTooltip
                                                                                    place="bottom"
                                                                                    id="default"
                                                                                />
                                                                            </span>
                                                                        </>
                                                                    )}

                                                                    {acceptanceLogic.isDefault && (
                                                                        <Badge
                                                                            color="success"
                                                                            className="ms-4"
                                                                        >
                                                                            {t(
                                                                                'table.defaultBadge'
                                                                            )}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </Col>
                                                        )}
                                                    </Row>
                                                </div>
                                            )}
                                        </>
                                    )
                                )}

                                <CustomPagination
                                    currentPage={currentPage + 1}
                                    totalElements={totalAcceptanceLogics}
                                    itemPerPage={itemPerPage}
                                    onPageChanged={(event, value) =>
                                        this.handlePageChanged(value)
                                    }
                                />
                            </>
                        ) : error ? (
                            <div
                                className="alert alert-danger"
                                role="alert"
                                style={{ marginTop: '50px' }}
                            >
                                {t('error.generic')}
                            </div>
                        ) : (
                            <section className="card-form">
                                {t('empty.title')}
                                <br />
                                <br />
                                <Button
                                    tag={Link}
                                    id="createDefaultAcceptanceLogic"
                                    to="./storage-acceptance-logic/new"
                                    type="submit"
                                    color="primary"
                                    size="1x"
                                    className="me-4 custom-cidg-button"
                                >
                                    <span className="as--light">
                                        {t('button.empty.new')}
                                    </span>
                                </Button>
                            </section>
                        )}
                    </Col>
                </Row>

                {viewAcceptanceLogicModalOpened && (
                    <ViewStorageAcceptanceLogic
                        isModalOpened={viewAcceptanceLogicModalOpened}
                        handleModal={this.handleViewAcceptanceLogicModal}
                        acceptanceLogic={clickedAcceptanceLogic}
                    />
                )}

                {confirmDeleteAcceptanceLogicModalOpened && (
                    <ConfirmDeleteAcceptanceLogic
                        isModalOpened={confirmDeleteAcceptanceLogicModalOpened}
                        handleDeleteAcceptanceLogic={
                            this.handleDeleteAcceptanceLogic
                        }
                        handleModal={
                            this.handleConfirmDeleteAcceptanceLogicModal
                        }
                        acceptanceLogic={clickedAcceptanceLogic}
                    />
                )}
            </div>
        )
    }
}

export default withAuth0(
    withTranslation('StorageAcceptanceLogicContainer')(
        StorageAcceptanceLogicContainer
    )
)
