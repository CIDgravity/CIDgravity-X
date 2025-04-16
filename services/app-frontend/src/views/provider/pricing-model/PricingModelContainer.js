import React, { PureComponent } from 'react'

import { withAuth0 } from '@auth0/auth0-react'
import { Button, Col, Row, Badge } from 'reactstrap'
import { Link } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import { isBrowser, isMobile } from 'react-device-detect'

import { Loader } from 'shared/components'
import { ViewPricingModel } from 'shared/modals'
import { ConfirmDeletePricingModel } from 'shared/modals'
import {
    GetAllPricingModelsWithRulesForCurrentUserPaginated,
    UpdatePricingModel,
    RemovePricingModel,
} from 'shared/services/pricing-model'
import { GetCurrentAddress } from 'shared/services/addresses_claim'
import { CustomPagination } from 'shared/components/CustomPagination'
import { toast } from 'react-toastify'
import { computePriceEquivalence } from 'shared/utils/fil'

import ReactTooltip from 'react-tooltip'

class PricingModelContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            error: false,
            isLoading: true,
            viewPricingModalOpened: false,
            confirmDeletePricingModalOpened: false,
            clickedPricingModel: null,
            pricingModelToDelete: null,
            indexPricingModelToDelete: null,
            pricingModels: [],
            totalModels: 0,
            currentPage: 0,
            itemPerPage: 30,
            currentAddress: {
                settings: {
                    acceptDealsFromUnkown: true
                },
            },
        }
    }

    async componentDidMount() {
        await this.loadCurrentAddressSettings()
        await this.loadExistingPricingModels()
    }

    loadCurrentAddressSettings = async () => {
        try {
            const currentAddress = await GetCurrentAddress()

            this.setState({ currentAddress: currentAddress.data })
        } catch (error) {
            this.setState({ error: true, isLoading: false })
        }
    }

    loadExistingPricingModels = async () => {
        const { itemPerPage, currentPage } = this.state

        try {
            const response = await GetAllPricingModelsWithRulesForCurrentUserPaginated(currentPage, itemPerPage)

            this.setState({
                pricingModels: response.data['response'],
                totalModels: response.data['x-total-count'],
                isLoading: false,
            })
        } catch (error) {
            this.setState({ error: true, isLoading: false })
        }
    }

    handleChangeDefaultRulesModel = async (ruleToUpdate, index) => {
        const { t } = this.props
        var pricingModelsCopy = [...this.state.pricingModels]

        pricingModelsCopy.map(
            (rule, idx) => (pricingModelsCopy[idx].default = false)
        )
        pricingModelsCopy[index].default = true

        try {
            const response = await UpdatePricingModel(pricingModelsCopy)

            if (response) {
                await this.loadExistingPricingModels()
                toast.success(
                    t('notification.success.onUpdateDefaultPricingModel')
                )
            } else {
                toast.error(t('notification.error.onUpdateDefaultPricingModel'))
            }
        } catch (error) {
            toast.error(t('notification.error.onUpdateDefaultPricingModel'))
        }
    }

    handleConfirmDeletePricingModal = (pricingModel, index) => {
        if (pricingModel) {
            this.setState({
                confirmDeletePricingModalOpened:
                    !this.state.confirmDeletePricingModalOpened,
                pricingModelToDelete: pricingModel,
                indexPricingModelToDelete: index,
            })
        } else {
            this.setState({ confirmDeletePricingModalOpened: false })
        }
    }

    handleViewPricingModelModal = () => {
        this.setState({
            viewPricingModalOpened: !this.state.viewPricingModalOpened,
        })
    }

    handleOpenedViewPricingModel = (pricingModel) => {
        var rulesWithComputedPrice = []

        for (const rule of pricingModel.rules) {
            if (pricingModel.currency === 'attofil_gib_epoch') {
                rule['price_for_30days_fil'] = computePriceEquivalence(rule.price, "FIL")
            } else if (pricingModel.currency === 'usd_tib_month') {
                rule['price_for_30days_usd'] = rule.price
            }

            rulesWithComputedPrice.push(rule);
        }

        // Update the state and open the modal to view pricing model details
        this.setState({ clickedPricingModel: { ...pricingModel, rules: rulesWithComputedPrice } })
        this.handleViewPricingModelModal()
    }

    handleDeletePricingModel = async () => {
        const { t } = this.props
        const {
            pricingModelToDelete,
            pricingModels,
            indexPricingModelToDelete,
        } = this.state
        this.handleConfirmDeletePricingModal()

        try {
            const response = await RemovePricingModel(pricingModelToDelete)

            if (response) {
                var pricingModelsCopy = [...pricingModels]
                pricingModelsCopy[indexPricingModelToDelete].archived = true

                this.setState({
                    pricingModelToDelete: null,
                    indexPricingModelToDelete: null,
                    pricingModels: pricingModelsCopy,
                })

                toast.success(t('notification.success.onDeletePricingModel'))
            } else {
                toast.error(t('notification.error.onDeletePricingModel'))
            }
        } catch (error) {
            toast.error(t('notification.error.onDeletePricingModel'))
        }
    }

    displayDefaultRulesOutsideModal = (pricingModel) => {
        if (pricingModel) {
            this.setState({
                clickedPricingModel: pricingModel,
                displayDefaultModel: true,
            })
        } else {
            this.setState({
                clickedPricingModel: null,
                displayDefaultModel: false,
            })
        }
    }

    handlePageChanged = (value) => {
        this.setState({ currentPage: value - 1, isLoading: true }, () =>
            this.loadExistingPricingModels()
        )
    }

    render() {
        const { t } = this.props
        const {
            pricingModels,
            error,
            isLoading,
            viewPricingModalOpened,
            currentAddress,
            confirmDeletePricingModalOpened,
            pricingModelToDelete,
            clickedPricingModel,
            totalModels,
            currentPage,
            itemPerPage,
        } = this.state

        return (
            <div className="container">
                <Row className="mt-4">
                    <Col xs={12} md={6}>
                        <h1>{t('title')}</h1>
                        <p>{t('subtitle')}</p>
                    </Col>

                    {pricingModels && !isLoading && isBrowser && (
                        <Col xs={12} md={6}>
                            <div className="text-end ms-2">
                                <Button
                                    tag={Link}
                                    id="createNewPricingModel"
                                    to="./pricing-model/new"
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
                        ) : pricingModels ? (
                            <>
                                <Row className="d-md-flex mb-2">
                                    <Col
                                        className="u-pointer-cursor text-secondary"
                                        xs="3"
                                        md="3"
                                    >
                                        {t('table.name.title')}
                                    </Col>
                                    <Col
                                        className="u-pointer-cursor text-secondary"
                                        xs="2"
                                        md="2"
                                    >
                                        {t('table.currency.title')}
                                    </Col>
                                    <Col
                                        className="u-pointer-cursor text-secondary"
                                        xs="1"
                                        md="1"
                                    >
                                        {t('table.rule.title')}
                                    </Col>
                                    <Col
                                        className="u-pointer-cursor text-secondary"
                                        xs="2"
                                        md="2"
                                    >
                                        {t('table.client.title')}
                                    </Col>
                                </Row>

                                {pricingModels.map((pricingModel, index) => (
                                    <>
                                        {!pricingModel.archived && (
                                            <div
                                                id={'modelCard' + index}
                                                key={pricingModel.id}
                                                className={`p-3 ${
                                                    pricingModel.default
                                                        ? 'card-form-default'
                                                        : 'card-form'
                                                }`}
                                            >
                                                <Row
                                                    key={pricingModel.id}
                                                    className="align-items-center align-items-stretch"
                                                >
                                                    <Col
                                                        xs={
                                                            isMobile ? '4' : '3'
                                                        }
                                                        md={
                                                            isMobile ? '5' : '3'
                                                        }
                                                    >
                                                        <div className="flex-fill d-flex align-items-center">
                                                            {pricingModel.name}
                                                        </div>
                                                    </Col>

                                                    <Col
                                                        xs={
                                                            isMobile ? '4' : '2'
                                                        }
                                                        md={
                                                            isMobile ? '5' : '2'
                                                        }
                                                    >
                                                        <div className="flex-fill d-flex align-items-center">
                                                            {t(`table.currency.units.${pricingModel.currency}`)}
                                                        </div>
                                                    </Col>

                                                    <Col xs="1" md="1">
                                                        <div className="flex-fill d-flex align-items-center">
                                                            {pricingModel.rules
                                                                ? pricingModel
                                                                      .rules
                                                                      .length
                                                                : t(
                                                                      'table.rule.noContent'
                                                                  )}
                                                        </div>
                                                    </Col>

                                                    <Col
                                                        xs={
                                                            isMobile ? '5' : '3'
                                                        }
                                                        md={
                                                            isMobile ? '5' : '3'
                                                        }
                                                    >
                                                        <div className="flex-fill d-flex align-items-center">
                                                            {pricingModel.default ? (
                                                                <>
                                                                    {currentAddress.settings.acceptDealsFromUnkown ? (
                                                                        <>
                                                                            {t(
                                                                                'table.client.defaultContentAndClients',
                                                                                {
                                                                                    count:
                                                                                        pricingModel.clients &&
                                                                                        pricingModel.clientsWithDefault
                                                                                            ? pricingModel
                                                                                                .clients
                                                                                                .length +
                                                                                            pricingModel
                                                                                                .clientsWithDefault
                                                                                                .length
                                                                                            : 0,
                                                                                }
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            {t(
                                                                                'table.client.defaultContentAndClientsWithoutUnknown',
                                                                                {
                                                                                    count:
                                                                                        pricingModel.clients &&
                                                                                        pricingModel.clientsWithDefault
                                                                                            ? pricingModel
                                                                                                .clients
                                                                                                .length +
                                                                                            pricingModel
                                                                                                .clientsWithDefault
                                                                                                .length
                                                                                            : 0,
                                                                                }
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {t(
                                                                        'table.client.content',
                                                                        {
                                                                            count: pricingModel.clients
                                                                                ? pricingModel
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
                                                                        'viewModel' +
                                                                        index
                                                                    }
                                                                    onClick={() =>
                                                                        this.handleOpenedViewPricingModel(
                                                                            pricingModel
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

                                                                {pricingModel.default ? (
                                                                    <Link
                                                                        style={{
                                                                            color: '#ffff',
                                                                        }}
                                                                        className="card-rounded-btn ms-4 icons-white btn-pointer"
                                                                        id={`edit-${pricingModel.id}`}
                                                                        to={`./pricing-model/${pricingModel.id}`}
                                                                    >
                                                                        <i
                                                                            id={
                                                                                'editModel' +
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
                                                                        id={`edit-${pricingModel.id}`}
                                                                        to={`./pricing-model/${pricingModel.id}`}
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

                                                                {!pricingModel.default && (
                                                                    <>
                                                                        <span
                                                                            onClick={() =>
                                                                                this.handleConfirmDeletePricingModal(
                                                                                    pricingModel,
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
                                                                                this.handleChangeDefaultRulesModel(
                                                                                    pricingModel,
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

                                                                {pricingModel.default && (
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
                                ))}

                                <CustomPagination
                                    currentPage={currentPage + 1}
                                    totalElements={totalModels}
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
                                    id="createFirstDefaultModel"
                                    to="./pricing-model/new"
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

                {viewPricingModalOpened && (
                    <ViewPricingModel
                        isModalOpened={viewPricingModalOpened}
                        handleModal={this.handleViewPricingModelModal}
                        pricingModel={clickedPricingModel}
                    />
                )}

                {confirmDeletePricingModalOpened && (
                    <ConfirmDeletePricingModel
                        isModalOpened={confirmDeletePricingModalOpened}
                        handleDeletePricingModel={this.handleDeletePricingModel}
                        handleModal={this.handleConfirmDeletePricingModal}
                        pricingModel={pricingModelToDelete}
                    />
                )}
            </div>
        )
    }
}

export default withAuth0(
    withTranslation('PricingModelContainer')(PricingModelContainer)
)
