import React, { PureComponent } from 'react'

import { isBrowser, isMobile } from 'react-device-detect'
import { withAuth0 } from '@auth0/auth0-react'
import { Col, Row } from 'reactstrap'
import { Link } from 'react-router-dom'
import { Loader } from 'shared/components'
import { GetAllDealsReceivedFromReportingService } from 'shared/services/deal-proposals'
import {
    ViewDealProposalJson,
    ViewStorageAcceptanceLogicResults,
} from 'shared/modals'
import { CustomPagination } from 'shared/components/CustomPagination'

import StorageHistorySearchAndFilters from './StorageHistorySearchAndFilters'
import { GetAllPricingModelsForCurrentUser } from 'shared/services/pricing-model'
import { stringArrayToSelectObjectList } from 'shared/utils/array-utils'
import { GenerateTableColumnForDealStatus } from 'shared/utils/deal-status'
import { shortenAddress } from 'shared/utils/filecoinUtil'
import { copyToClipboard } from 'shared/utils/copy-to-clipboard'
import { withTranslation } from 'react-i18next'

import { BsBuildingFillAdd } from 'react-icons/bs'

import ReactTooltip from 'react-tooltip'
import moment from 'moment'

class StorageHistoryContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.datetimeFormat = 'YYYY/MM/DD HH:mm:ss'

        this.state = {
            selectedMiner: null,
            isError: false,
            isLoading: true,
            dealsHistory: [],
            selectedDealProposal: null,
            viewDealProposalJsonOpened: false,
            viewAcceptanceLogicResultsOpened: false,
            totalProposals: 0,
            currentPage: 0,
            itemPerPage: 20,
            sort: 'received_on',
            order: 'desc',
            focusedInput: null,
            searchDate: {
                startDate: null,
                endDate: null,
            },
            dateLastSearch: {
                startDate: null,
                endDate: null,
            },
            searchTerm: '',
            termLastSearch: null,
            selectedPricing: null,
            selectedDecisionOrStatus: 'all',
            decisionOrStatusLastSearch: 'all',
            isFilteredByName: false,
            isFilteredByDate: false,
            isFilteredByPricing: false,
            isFilteredByDecisionOrStatus: false,
        }
    }

    async componentDidMount() {
        await this.loadDealsHistoryFromReporting()
    }

    handleViewProposalJsonModal = () => {
        if (this.state.viewDealProposalJsonOpened) {
            this.setState({
                viewDealProposalJsonOpened: false,
                selectedDealProposal: null,
            })
        } else {
            this.setState({ viewDealProposalJsonOpened: true })
        }
    }

    handleViewAcceptanceLogicResultsModal = () => {
        if (this.state.viewAcceptanceLogicResultsOpened) {
            this.setState({
                viewAcceptanceLogicResultsOpened: false,
                selectedDealProposal: null,
            })
        } else {
            this.setState({ viewAcceptanceLogicResultsOpened: true })
        }
    }

    handleViewProposalJson = (dealProposal) => {
        this.setState({ selectedDealProposal: dealProposal })
        this.handleViewProposalJsonModal()
    }

    handleViewAcceptanceLogicResults = (dealProposal) => {
        this.setState({ selectedDealProposal: dealProposal })
        this.handleViewAcceptanceLogicResultsModal()
    }

    loadPricingModelsAsSelectFormat = async () => {
        const pricingModels = await GetAllPricingModelsForCurrentUser()
        return stringArrayToSelectObjectList(pricingModels.data)
    }

    loadDealsHistoryFromReporting = async () => {
        const {
            itemPerPage,
            currentPage,
            sort,
            order,
            searchTerm,
            searchDate,
            selectedPricing,
            selectedDecisionOrStatus
        } = this.state

        this.setState({
            isLoading: true,
            loadFromBackend: false,
            dateLastSearch: searchDate,
            decisionOrStatusLastSearch: selectedDecisionOrStatus,
            termLastSearch: searchTerm,
        })

        const { startDate, endDate } = searchDate
        const startDateToFilter =
            startDate &&
            moment(startDate).set({ h: 0, m: 0, s: 0 }).toISOString()

        // If endDate is today, set moment.now() to avoid error message from reporting service (in future)
        let endDateToFilter =
            endDate &&
            moment(endDate).set({ h: 23, m: 59, s: 59 }).toISOString()

        if (endDate && moment(endDate).isSame(moment(), 'day')) {
            endDateToFilter = moment().toISOString()
        }

        if (searchTerm === '') {
            this.setState({ isFilteredByName: false })
        } else {
            this.setState({ isFilteredByName: true })
        }

        try {
            const response = await GetAllDealsReceivedFromReportingService({
                activePage: currentPage,
                size: itemPerPage,
                searchTerm,
                startDate: startDateToFilter,
                endDate: endDateToFilter,
                status: selectedDecisionOrStatus,
                pricingModel: selectedPricing,
                sort,
                order,
            })

            if (response) {
                this.setState({
                    dealsHistory: response.data['response'],
                    totalProposals: response.data['x-total-count'],
                    isLoading: false,
                    isError: false,
                })
            }
        } catch (error) {
            this.setState({
                isLoading: false,
                isError: true,
                dealsHistory: [],
                totalProposals: 0,
            })
        }
    }

    handlePageChanged = (value) => {
        this.setState({ currentPage: value - 1 }, () =>
            this.loadDealsHistoryFromReporting()
        )
    }

    handleSort = (item) => {
        const { sort, order } = this.state
        const newOrder =
            item !== sort ? 'asc' : order === 'asc' ? 'desc' : 'asc'

        this.setState({ order: newOrder, sort: item }, () =>
            this.handlePageChanged(1)
        )
    }

    handleSearchClientName = (searchTerm) => {
        this.setState({ searchTerm })
    }

    handleOnSearchNameKeyDown = async (event) => {
        const { key } = event
        const {
            searchDate,
            searchTerm,
            selectedDecisionOrStatus,
            dateLastSearch,
            termLastSearch,
            decisionOrStatusLastSearch
        } = this.state
        const hasParamsChangedSinceLastSearch =
            searchDate !== dateLastSearch ||
            searchTerm !== termLastSearch ||
            selectedDecisionOrStatus !== decisionOrStatusLastSearch
        if (key === 'Enter' && hasParamsChangedSinceLastSearch) {
            this.handlePageChanged(1)
        }
    }

    handleSearchDate = (start, end) => {
        if (start == null && end == null) {
            this.setState(
                {
                    searchDate: {
                        startDate: null,
                        endDate: null,
                    },
                    isFilteredByDate: false,
                },
                () => {
                    this.handlePageChanged(1)
                }
            )
        } else {
            const date = { startDate: start, endDate: end }

            this.setState(
                {
                    searchDate: date,
                    isFilteredByDate: true,
                },
                () => {
                    if (date.startDate && date.endDate) {
                        this.handlePageChanged(1)
                    }
                }
            )
        }
    }

    handleSearchPricing = (event, action) => {
        if (action.action === 'clear') {
            this.setState(
                {
                    selectedPricing: null,
                    isFilteredByPricing: false,
                },
                () => {
                    this.handlePageChanged(1)
                }
            )
        } else {
            this.setState(
                {
                    selectedPricing: event.value,
                    isFilteredByPricing: true,
                },
                () => {
                    this.handlePageChanged(1)
                }
            )
        }
    }

    handleSearchDecisionOrStatus = (event) => {
        const isFilteredByDecisionOrStatus = event && event.value !== 'all'

        // When changing filters, we need to reset the page before loading results
        // This will avoid to be on a page that doesn't exist after running the search
        this.setState(
            {
                selectedDecisionOrStatus: event ? event.value : 'all',
                isFilteredByDecisionOrStatus: isFilteredByDecisionOrStatus,
            },
            () => {
                this.handlePageChanged(1)
            }
        )
    }

    getInternalMessage = (deal) => {
        const { t } = this.props

        if (
            deal === null ||
            deal === undefined ||
            deal.decisionJson === null ||
            deal.decisionJson === undefined
        ) {
            return t('table.internalMessage.empty')
        }

        try {
            const decisionObj = deal.decisionJson

            if (
                decisionObj.internalMessage === undefined ||
                decisionObj.internalMessage === null
            ) {
                return t('table.internalMessage.empty')
            }

            return decisionObj.internalMessage
        } catch (error) {
            console.error('Unable to parse decision', deal, error)
            return t('table.internalMessage.empty')
        }
    }

    displayClientNameAndLookupFrom = (deal) => {
        const { t } = this.props

        if (deal.clientName === '' || deal.clientName === undefined) {
            return <span>{t('table.clientName.unknown')}</span>
        } else if (deal.clientNameLookupFrom === 'backend') {
            return (
                <span>
                    <span
                        data-for="clientCreatedAfterDealProcessed"
                        data-tip={t(
                            'table.clientName.tooltip.clientCreatedAfterDealProcessed'
                        )}
                        className="text-bold text-bold-italic"
                    >
                        {deal.clientName}
                    </span>

                    <ReactTooltip
                        place="bottom"
                        id="clientCreatedAfterDealProcessed"
                    />
                </span>
            )
        } else if (deal.clientNameLookupFrom === 'history') {
            return <span>{deal.clientName}</span>
        } else {
            return (
                <>
                    <span>
                        <span
                            data-for="importedFrom"
                            data-tip={this.getClientNameLookupSource(deal)}
                        >
                            {deal.clientName}
                        </span>

                        <ReactTooltip
                            place="bottom"
                            id="importedFrom"
                            html={true}
                        />
                    </span>

                    <Link
                        style={{ color: '#222b2a' }}
                        to={{
                            pathname: './client/new',
                            state: {
                                createClientFromHistory: true,
                                clientName: deal.clientName,
                                clientAddress: deal.fromAddress,
                            },
                        }}
                    >
                        <span>
                            <BsBuildingFillAdd
                                className="ms-4 fas fa-building fa-sm copy-btn"
                                id="createAsClient"
                                data-for="createAsClient"
                                data-tip={this.props.t(
                                    'table.clientName.tooltip.createAsClient'
                                )}
                            />

                            <ReactTooltip place="bottom" id="createAsClient" />
                        </span>
                    </Link>
                </>
            )
        }
    }

    getClientNameLookupSource = (deal) => {
        const { t } = this.props

        if (deal.clientNameLookup.length === 1) {
            return t('table.clientName.tooltip.importedFromSingle', {
                importedFrom: deal.clientNameLookupFrom,
            })
        } else if (deal.clientNameLookup.length > 1) {
            return deal.clientNameLookup
                .map(function (item) {
                    return (
                        t('table.clientName.tooltip.importedFromMultiple', {
                            clientName: item.clientName,
                            importedFrom: item.importedFrom,
                            importedOn: moment(item.importedOn).format(
                                'YYYY/MM/DD HH:mm'
                            ),
                        }) + '<br />'
                    )
                })
                .join('')
        }
    }

    render() {
        const {
            dealsHistory,
            isError,
            isLoading,
            viewDealProposalJsonOpened,
            viewAcceptanceLogicResultsOpened,
            selectedDealProposal,
            totalProposals,
            itemPerPage,
            currentPage,
            sort,
            order,
            searchDate,
            selectedPricing,
            isFilteredByName,
            isFilteredByDate,
            isFilteredByDecisionOrStatus,
            isFilteredByPricing,
        } = this.state
        const { t } = this.props

        return (
            <div className="container">
                <Row className="mt-4">
                    <Col xs={12} md={12}>
                        <h1>{t('title')}</h1>
                        <p>{t('subtitle')}</p>
                    </Col>
                </Row>

                {isBrowser && (
                    <StorageHistorySearchAndFilters
                        onSearchClientName={this.handleSearchClientName}
                        onSearchNameKeyDown={this.handleOnSearchNameKeyDown}
                        onSearchDate={this.handleSearchDate}
                        onSearchMatchingPricing={this.handleSearchPricing}
                        onSearchDecisionOrStatus={this.handleSearchDecisionOrStatus}

                        matchingPricingSelected={selectedPricing}
                        startDate={searchDate.startDate}
                        endDate={searchDate.endDate}
                        loadPricingModels={this.loadPricingModelsAsSelectFormat}
                    />
                )}

                {isLoading ? (
                    <Loader />
                ) : totalProposals > 0 ? (
                    <Row className="mt-4">
                        <Col xs={12} md={12}>
                            <Row className="d-none d-md-flex mb-2">
                                <Col className="u-pointer-cursor text-secondary" xs="2" md="2">
                                    {t('table.dealStatus.title')}
                                </Col>
                                <Col
                                    className="u-pointer-cursor text-secondary"
                                    xs="2"
                                    md="2"
                                >
                                    {t('table.fromAddress.title')}
                                </Col>
                                <Col
                                    className="u-pointer-cursor text-secondary"
                                    xs="2"
                                    md="2"
                                >
                                    {t('table.clientName.title')}
                                </Col>
                                <Col
                                    className="u-pointer-cursor text-secondary"
                                    xs="2"
                                    md="2"
                                >
                                    {t('table.datetime.title', {
                                        datetimeFormat: this.datetimeFormat,
                                    })}
                                    {sort === 'received_on' &&
                                    order === 'asc' ? (
                                        <i
                                            onClick={() =>
                                                this.handleSort('received_on')
                                            }
                                            className="fas fa-caret-down ms-2"
                                        />
                                    ) : (
                                        <i
                                            onClick={() =>
                                                this.handleSort('received_on')
                                            }
                                            className="fas fa-caret-up ms-2"
                                        />
                                    )}
                                </Col>
                                <Col
                                    className="u-pointer-cursor text-secondary"
                                    xs="2"
                                    md="2"
                                >
                                    {t('table.reason.title')}
                                </Col>
                                <Col
                                    className="u-pointer-cursor text-secondary"
                                    xs="2"
                                    md="2"
                                ></Col>
                            </Row>

                            {dealsHistory &&
                                dealsHistory.map((deal) => (
                                    <Row
                                        className={`py-3 align-items-center align-items-stretch ${
                                            deal.default
                                                ? 'card-form-default-base'
                                                : 'card-form-base'
                                        }`}
                                    >
                                        <Col xs="2" md="2" className="align-items-center ps-3 flex-fill d-flex">
                                            {GenerateTableColumnForDealStatus(t, deal, true)}
                                        </Col>

                                        <Col
                                            xs={isMobile ? '6' : '2'}
                                            md={isMobile ? '6' : '2'}
                                        >
                                            {deal.fromAddress === '' ||
                                            deal.fromAddress === undefined ? (
                                                <>
                                                    {t(
                                                        'table.fromAddress.unkownAddress'
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <span
                                                        data-for="fullAddress"
                                                        data-tip={
                                                            deal.fromAddress
                                                        }
                                                    >
                                                        {shortenAddress(
                                                            deal.fromAddress
                                                        )}

                                                        <ReactTooltip
                                                            place="bottom"
                                                            id="fullAddress"
                                                        />
                                                    </span>

                                                    <span
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                deal.fromAddress
                                                            )
                                                        }
                                                    >
                                                        <i
                                                            id="copyFullFromAddress"
                                                            className="ms-4 fas fa-copy fa-sm copy-btn"
                                                            data-for="copy"
                                                            data-tip={t(
                                                                'table.fromAddress.tooltip.copy'
                                                            )}
                                                        />

                                                        <ReactTooltip
                                                            place="bottom"
                                                            id="copy"
                                                        />
                                                    </span>
                                                </>
                                            )}
                                        </Col>

                                        <Col
                                            xs={isMobile ? '6' : '2'}
                                            md={isMobile ? '6' : '2'}
                                        >
                                            {this.displayClientNameAndLookupFrom(
                                                deal
                                            )}
                                        </Col>

                                        <Col
                                            xs={isMobile ? '5' : '2'}
                                            md={isMobile ? '5' : '2'}
                                            className="text-break flex-fill d-flex align-items-center"
                                        >
                                            <span className="ml-4 mr-4">
                                                {moment(deal.receivedOn).format(
                                                    this.datetimeFormat
                                                )}
                                            </span>
                                        </Col>

                                        <Col
                                            xs={isMobile ? '12' : '2'}
                                            md="2"
                                            className={
                                                isMobile
                                                    ? 'mt-2'
                                                    : 'text-break flex-fill d-flex align-items-center'
                                            }
                                        >
                                            {this.getInternalMessage(deal)}
                                        </Col>

                                        {isBrowser && (
                                            <Col
                                                xs="2"
                                                md="2"
                                                className="flex-fill align-items-center justify-content-end d-flex"
                                            >
                                                {/* Because in DB, an empty JSON is stored, we need to check "{}" for empty proposal */}
                                                {deal.originalProposal !==
                                                    '{}' &&
                                                    deal.originalProposal !==
                                                        undefined &&
                                                    deal.originalProposal !==
                                                        null && (
                                                        <div className="pe-3">
                                                            <span
                                                                onClick={() =>
                                                                    this.handleViewProposalJson(
                                                                        deal
                                                                    )
                                                                }
                                                                className="btn-pointer card-rounded-btn"
                                                            >
                                                                <i
                                                                    data-for="inspect-deal-proposal"
                                                                    data-tip={t(
                                                                        'table.inspect.tooltip'
                                                                    )}
                                                                    className="fa fa-eye"
                                                                />
                                                                <ReactTooltip
                                                                    place="bottom"
                                                                    id="inspect-deal-proposal"
                                                                />
                                                            </span>
                                                        </div>
                                                    )}

                                                {deal.storageAcceptanceLogicWithVarsSolved !==
                                                    '{}' &&
                                                    deal.storageAcceptanceLogicWithVarsSolved !==
                                                        undefined &&
                                                    deal.storageAcceptanceLogicWithVarsSolved !==
                                                        null &&
                                                    deal.storageAcceptanceLogic !==
                                                        null &&
                                                    deal.storageAcceptanceLogic !==
                                                        '' && (
                                                        <div className="pe-3">
                                                            <span
                                                                onClick={() =>
                                                                    this.handleViewAcceptanceLogicResults(
                                                                        deal
                                                                    )
                                                                }
                                                                className="btn-pointer card-rounded-btn"
                                                            >
                                                                <i
                                                                    data-for="inspect-acceptance-logic-results"
                                                                    data-tip={t(
                                                                        'table.inspectAcceptanceLogic.tooltip'
                                                                    )}
                                                                    className="fa fa-filter"
                                                                />
                                                                <ReactTooltip
                                                                    place="bottom"
                                                                    id="inspect-acceptance-logic-results"
                                                                />
                                                            </span>
                                                        </div>
                                                    )}

                                                {deal.decision !== 'error' && deal.internalDecision !== 'invalidProposal' && deal.internalDecision !== 'curioBackPressure' && (
                                                        <div className="pe-3">
                                                            <Link
                                                                to={`./playground/${deal.id}`}
                                                                className="icon-router-link"
                                                            >
                                                                <i
                                                                    data-for="go-to-playground"
                                                                    data-tip={t(
                                                                        'table.simulate.tooltip'
                                                                    )}
                                                                    className="fa fa-flask"
                                                                />
                                                                <ReactTooltip
                                                                    place="bottom"
                                                                    id="go-to-playground"
                                                                />
                                                            </Link>
                                                        </div>
                                                    )}
                                            </Col>
                                        )}
                                    </Row>
                                ))}

                            <CustomPagination
                                currentPage={currentPage + 1}
                                totalElements={totalProposals}
                                itemPerPage={itemPerPage}
                                onPageChanged={(event, value) =>
                                    this.handlePageChanged(value)
                                }
                            />
                        </Col>
                    </Row>
                ) : isError ? (
                    <div
                        className="alert alert-danger"
                        role="alert"
                        style={{ marginTop: '50px' }}
                    >
                        {t('error.generic')}
                    </div>
                ) : isFilteredByDate ||
                    isFilteredByDecisionOrStatus ||
                    isFilteredByPricing ||
                    isFilteredByName ? (
                    <section className="card-form-base p-3">
                        {t('table.noMatch')}
                    </section>
                ) : (
                    <section className="card-form-base p-3">
                        {t('table.empty')}
                    </section>
                )}

                {viewDealProposalJsonOpened && (
                    <ViewDealProposalJson
                        isModalOpened={viewDealProposalJsonOpened}
                        handleModal={this.handleViewProposalJsonModal}
                        dealProposal={selectedDealProposal}
                    />
                )}

                {viewAcceptanceLogicResultsOpened && (
                    <ViewStorageAcceptanceLogicResults
                        isModalOpened={viewAcceptanceLogicResultsOpened}
                        handleModal={this.handleViewAcceptanceLogicResultsModal}
                        dealProposal={selectedDealProposal}
                    />
                )}
            </div>
        )
    }
}

export default withAuth0(
    withTranslation(['StorageHistoryContainer', 'dealStatus'])(StorageHistoryContainer)
)
