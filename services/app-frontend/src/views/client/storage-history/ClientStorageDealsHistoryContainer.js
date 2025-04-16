import React, { PureComponent } from 'react'

import { isBrowser, isMobile } from 'react-device-detect'
import { withAuth0 } from '@auth0/auth0-react'
import { Col, Row } from 'reactstrap'
import { Loader } from 'shared/components'
import { GetAllClientDealsSentFromReportingService } from 'shared/services/deal-proposals'
import { ViewDealProposalJson } from 'shared/modals'
import { CustomPagination } from 'shared/components/CustomPagination'
import { Link } from 'react-router-dom'

import { GenerateTableColumnForDealStatus } from 'shared/utils/deal-status'
import ClientStorageDealsHistorySearchAndFilters from './ClientStorageDealsHistorySearchAndFilters'
import { withTranslation } from 'react-i18next'

import ReactTooltip from 'react-tooltip'
import moment from 'moment'

class ClientStorageDealsHistoryContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.datetimeFormat = 'YYYY/MM/DD HH:mm:ss'

        this.state = {
            isError: false,
            isLoading: true,
            dealsHistory: [],
            selectedDealProposal: null,
            viewDealProposalJsonOpened: false,
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
            selectedDecisionOrStatus: 'all',
            decisionOrStatusLastSearch: 'all',
            isFilteredByProviderOrProposalUUID: false,
            isFilteredByDate: false,
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

    handleViewProposalJson = (dealProposal) => {
        this.setState({ selectedDealProposal: dealProposal })
        this.handleViewProposalJsonModal()
    }

    loadDealsHistoryFromReporting = async () => {
        const {
            itemPerPage,
            currentPage,
            sort,
            order,
            searchTerm,
            searchDate,
            selectedDecisionOrStatus,
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
            this.setState({ isFilteredByProviderOrProposalUUID: false })
        } else {
            this.setState({ isFilteredByProviderOrProposalUUID: true })
        }

        try {
            const response = await GetAllClientDealsSentFromReportingService({
                activePage: currentPage,
                size: itemPerPage,
                searchTerm,
                startDate: startDateToFilter,
                endDate: endDateToFilter,
                status: selectedDecisionOrStatus,
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
        const newOrder = item !== sort ? 'asc' : order === 'asc' ? 'desc' : 'asc'

        this.setState({ order: newOrder, sort: item }, () =>
            this.handlePageChanged(1)
        )
    }

    handleSearchProviderOrProposalUUID = (searchTerm) => {
        this.setState({ searchTerm })
    }

    handleSearchProviderOrProposalUUIDKeyDown = async (event) => {
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

    parseDurationTime = (durationInSeconds) => {
        if (durationInSeconds <= 0) {
            return "-";
        }
    
        const fm = [
            (Math.floor(Math.floor(Math.floor(durationInSeconds / 60) / 60) / 24)).toString().padStart(2, '0') + 'd',
            (Math.floor(Math.floor(durationInSeconds / 60) / 60) % 24).toString().padStart(2, '0') + 'h',
            (Math.floor(durationInSeconds / 60) % 60).toString().padStart(2, '0') + 'm'
        ];
    
        return fm.map(v => v).join(' ');
    };

    getProviderNameLookupIfAvailable = (deal) => {
        const { t } = this.props

        if (deal.providerLookup === null ) {
            return t('table.providerName.unknown')
        }

        return deal.providerLookup.companyName
    }

    render() {
        const {
            dealsHistory,
            isError,
            isLoading,
            viewDealProposalJsonOpened,
            selectedDealProposal,
            totalProposals,
            itemPerPage,
            currentPage,
            sort,
            order,
            searchDate,
            isFilteredByProviderOrProposalUUID,
            isFilteredByDate,
            isFilteredByDecisionOrStatus,
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
                    <ClientStorageDealsHistorySearchAndFilters
                        onSearchProviderOrProposalUUID={this.handleSearchProviderOrProposalUUID}
                        onSearchProviderOrProposalUUIDKeyDown={this.handleSearchProviderOrProposalUUIDKeyDown}
                        onSearchDate={this.handleSearchDate}
                        onSearchDecisionOrStatus={this.handleSearchDecisionOrStatus}
                        startDate={searchDate.startDate}
                        endDate={searchDate.endDate}
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

                                <Col className="u-pointer-cursor text-secondary" xs="1" md="1">
                                    {t('table.provider.title')}
                                </Col>

                                <Col className="u-pointer-cursor text-secondary" xs="2" md="2">
                                    {t('table.providerName.title')}
                                </Col>

                                <Col className="u-pointer-cursor text-secondary" xs="2" md="2">
                                    {t('table.datetime.title', { datetimeFormat: this.datetimeFormat })}

                                    {sort === 'received_on' && order === 'asc' ? (
                                        <i onClick={() => this.handleSort('received_on')} className="fas fa-caret-down ms-2"/>
                                    ) : (
                                        <i onClick={() => this.handleSort('received_on')} className="fas fa-caret-up ms-2" />
                                    )}
                                </Col>

                                <Col className="u-pointer-cursor text-secondary" xs="2" md="2">
                                    <span data-for="sealling-duration-tooltip" data-tip={t('table.sealingDuration.tooltip')}>
                                        {t('table.sealingDuration.title')}
                                    </span>
                                    
                                    <ReactTooltip className="maxWidthTooltip" place="bottom" id="sealling-duration-tooltip"/>
                                </Col>

                                <Col className="u-pointer-cursor text-secondary" xs="2" md="2">
                                    <span data-for="overall-duration-tooltip" data-tip={t('table.overallDuration.tooltip')}>
                                        {t('table.overallDuration.title')}
                                    </span>

                                    <ReactTooltip className="maxWidthTooltip" place="bottom" id="overall-duration-tooltip"/>
                                </Col>

                                <Col className="u-pointer-cursor text-secondary" xs="1"md="1"></Col>
                            </Row>

                            {dealsHistory &&
                                dealsHistory.map((deal) => (
                                    <Row className='py-3 align-items-center align-items-stretch card-form-base'>
                                        <Col xs="2" md="2" className="align-items-center ps-3 flex-fill d-flex">
                                            {GenerateTableColumnForDealStatus(t, deal, true)}
                                        </Col>

                                        <Col xs={isMobile ? '6' : '1'} md={isMobile ? '6' : '1'}>
                                            <Link to={`./provider-details/${deal.provider}`}>
                                                {deal.provider}
                                            </Link>
                                        </Col>

                                        <Col xs={isMobile ? '6' : '2'} md={isMobile ? '6' : '2'}>
                                            {this.getProviderNameLookupIfAvailable(deal)}
                                        </Col>

                                        <Col xs={isMobile ? '5' : '2'} md={isMobile ? '5' : '2'} className="text-break flex-fill d-flex align-items-center">
                                            <span className="ml-4 mr-4">
                                                {moment(deal.receivedOn).format(this.datetimeFormat)}
                                            </span>
                                        </Col>

                                        <Col xs='2' md="2">
                                            {this.parseDurationTime(deal.sealingTime * 30)}
                                        </Col>

                                        <Col xs='2' md="2">
                                            {this.parseDurationTime(deal.onboardingTime / 1000)}
                                        </Col>

                                        {isBrowser && (
                                            <Col xs="1" md="1" className="flex-fill align-items-center justify-content-end d-flex">
                                                {/* Because in DB, an empty JSON is stored, we need to check "{}" for empty proposal */}
                                                {deal.originalProposal !== '{}' && deal.originalProposal !== undefined && deal.originalProposal !== null && (
                                                    <div className="pe-3">
                                                        <span onClick={() => this.handleViewProposalJson(deal)} className="btn-pointer card-rounded-btn">
                                                            <i data-for="inspect-deal-proposal" data-tip={t('table.inspect.tooltip')} className="fa fa-eye" />
                                                            <ReactTooltip place="bottom" id="inspect-deal-proposal"/>
                                                        </span>
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
                                onPageChanged={(event, value) => this.handlePageChanged(value)}
                            />
                        </Col>
                    </Row>
                ) : isError ? (
                    <div className="alert alert-danger" role="alert" style={{ marginTop: '50px' }}>
                        {t('error.generic')}
                    </div>
                ) : isFilteredByDate || isFilteredByDecisionOrStatus || isFilteredByProviderOrProposalUUID ? (
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
            </div>
        )
    }
}

export default withAuth0(
    withTranslation(['ClientStorageDealsHistoryContainer', 'dealStatus'])(ClientStorageDealsHistoryContainer)
)
