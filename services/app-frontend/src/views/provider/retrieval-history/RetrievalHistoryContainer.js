import moment from 'moment'
import { useEffect, useState } from 'react'
import { isBrowser, isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'
import ReactTooltip from 'react-tooltip'
import { Col, Row } from 'reactstrap'
import { Loader } from 'shared/components'
import { CustomPagination } from 'shared/components/CustomPagination'
import { ViewDealProposalJson } from 'shared/modals'
import { GetAllDealsReceivedFromReportingService } from 'shared/services/retrieval-proposals'
import { copyToClipboard } from 'shared/utils/copy-to-clipboard'
import { RetrievalHistorySearchAndFilters } from './RetrievalHistorySearchAndFilters'

export function RetrievalHistoryContainer() {
    const [date, setDate] = useState({ startDate: null, endDate: null })
    const [dateLastSearch, setDateLastSearch] = useState({
        startDate: null,
        endDate: null,
    })
    const [term, setTerm] = useState('')
    const [termLastSearch, setTermLastSearch] = useState('')
    const [status, setStatus] = useState('all')
    const [statusLastSearch, setStatusLastSearch] = useState('all')
    const [focusedInput, setFocusedInput] = useState(null)
    const [isFilteredByDate, setIsFilteredByDate] = useState(false)
    const [isFilteredByStatus, setIsFilteredByStatus] = useState(false)
    const [isFilteredBySearch, setIsFilteredBySearch] = useState(false)
    const [isLastSearchFiltered, setIsLastSearchFiltered] = useState(false)
    const [hasSearchBeenTriggered, setHasSearchBeenTriggered] = useState(false)
    const [hasSearchBeenManuallyTriggered, setHasSearchBeenManuallyTriggered] =
        useState(false)
    const [selectedDealProposal, setSelectedDealProposal] = useState(null)
    const [viewDealProposalJsonOpen, setViewDealProposalJsonOpen] =
        useState(false)
    const [currentPage, setCurrentPage] = useState(0)
    const [dealsHistory, setDealsHistory] = useState([])
    const [totalProposals, setTotalProposals] = useState(0)
    const [sort, setSort] = useState('received_on')
    const [order, setOrder] = useState('desc')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const itemPerPage = 20

    const { t, i18n } = useTranslation('RetrievalHistoryContainer')

    const datetimeFormat = 'YYYY/MM/DD HH:mm:ss'

    const loadHistory = () => {
        setIsLoading(true)
        setDateLastSearch(date)
        setStatusLastSearch(status)
        setTermLastSearch(term)

        const startDateToFilter = moment(date.startDate)
            ?.set({ h: 0, m: 0, s: 0 })
            .toISOString()
        let endDateToFilter = moment(date.endDate)
            ?.set({ h: 23, m: 59, s: 59 })
            .toISOString()

        if (moment(date.endDate)?.isSame(moment(), 'day')) {
            endDateToFilter = moment().toISOString()
        }

        GetAllDealsReceivedFromReportingService({
            activePage: currentPage,
            size: itemPerPage,
            searchTerm: term,
            startDate: startDateToFilter,
            endDate: endDateToFilter,
            status: status,
            sort,
            order,
        })
            .then((res) => {
                setDealsHistory(res.data['response'])
                setTotalProposals(res.data['x-total-count'])
                setIsLoading(false)
            })
            .catch((err) => {
                console.error('Error while getting retrieval history', err)
                setError(err)
                setIsLoading(false)
            })
    }

    useEffect(() => {
        moment.locale(i18n.language.toLowerCase()) // moment uses lowercase country code
    }, [i18n.language])

    useEffect(() => {
        loadHistory()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date, status, currentPage, sort, order])

    useEffect(() => {
        if (hasSearchBeenManuallyTriggered) {
            loadHistory()
            setHasSearchBeenManuallyTriggered(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasSearchBeenManuallyTriggered])

    useEffect(() => {
        if (term === '') {
            setIsFilteredBySearch(false)
        } else {
            setIsFilteredBySearch(true)
        }
    }, [term])

    useEffect(() => {
        if (
            hasSearchBeenManuallyTriggered ||
            isFilteredByDate ||
            isFilteredByStatus
        ) {
            setHasSearchBeenTriggered(true)
        } else {
            setHasSearchBeenTriggered(false)
        }
    }, [hasSearchBeenManuallyTriggered, isFilteredByDate, isFilteredByStatus])

    useEffect(() => {
        if (hasSearchBeenTriggered) {
            setIsLastSearchFiltered(
                isFilteredByDate || isFilteredByStatus || isFilteredBySearch
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasSearchBeenTriggered])

    const getIconForDealStatus = (internalDecision) => {
        if (internalDecision === 'accept') {
            return (
                <i
                    data-for="status"
                    data-tip={t('table.internalDecision.accept.tooltip')}
                    style={{ color: 'green' }}
                    className="fas fa-arrow-right"
                />
            )
        } else if (internalDecision === 'maintenance') {
            return (
                <i
                    data-for="status"
                    data-tip={t('table.internalDecision.maintenance.tooltip')}
                    style={{ color: 'orange' }}
                    className="fas fa-tools"
                />
            )
        } else if (internalDecision === 'retrievalRateLimit') {
            return (
                <i
                    data-for="status"
                    data-tip={t(
                        'table.internalDecision.retrievalRateLimit.tooltip'
                    )}
                    style={{ color: 'red' }}
                    className="fas fa-greater-than-equal"
                />
            )
        } else if (internalDecision === 'acl') {
            return (
                <i
                    data-for="status"
                    data-tip={t('table.internalDecision.acl.tooltip')}
                    style={{ color: 'orange' }}
                    className="fas fa-ban"
                />
            )
        }
    }

    return (
        <div className="container">
            <Row className="mt-4">
                <Col xs={12} md={12}>
                    <h1>{t('title')}</h1>
                    <p>{t('subtitle')}</p>
                </Col>
            </Row>

            {isBrowser && (
                <RetrievalHistorySearchAndFilters
                    onSearchClientNameKeyDown={(event) => {
                        const hasParamsChangedSinceLastSearch =
                            date !== dateLastSearch ||
                            term !== termLastSearch ||
                            status !== statusLastSearch
                        if (
                            event.key === 'Enter' &&
                            hasParamsChangedSinceLastSearch
                        ) {
                            setHasSearchBeenManuallyTriggered(true)
                        }
                    }}
                    onSearchClientName={(searchTerm) => {
                        setTerm(searchTerm)
                        setIsFilteredBySearch(searchTerm !== '')
                        setCurrentPage(0)
                    }}
                    onSearchDate={(startDate, endDate) => {
                        setDate({
                            startDate: startDate ?? null,
                            endDate: endDate ?? null,
                        })
                        setIsFilteredByDate(!!startDate || !!endDate)
                        setCurrentPage(0)
                    }}
                    onSearchStatus={(event) => {
                        setStatus(event.value)
                        setIsFilteredByStatus(event.value !== 'all')
                        setCurrentPage(0)
                    }}
                    focusedInput={focusedInput}
                    setFocusedInput={setFocusedInput}
                    dealStatusSelected={status}
                    startDate={date.startDate}
                    endDate={date.endDate}
                />
            )}

            {isLoading ? (
                <Loader />
            ) : totalProposals > 0 ? (
                <Row className="mt-4">
                    <Col xs={12} md={12}>
                        <Row className="d-one d-md-flex mb-2">
                            <Col
                                className="u-pointer-cursor text-secondary"
                                xs="1"
                                md="1"
                            />
                            <Col
                                className="u-pointer-cursor text-secondary"
                                xs="3"
                                md="3"
                            >
                                {t('table.from.title')}
                            </Col>
                            <Col
                                className="u-pointer-cursor text-secondary"
                                xs="3"
                                md="3"
                            >
                                {t('table.datetime.title', {
                                    datetimeFormat: datetimeFormat,
                                })}
                                {sort === 'received_on' && order === 'asc' ? (
                                    <i
                                        onClick={() => {
                                            setSort('received_on')
                                            setOrder(
                                                'received_on' !== sort
                                                    ? 'asc'
                                                    : order === 'asc'
                                                    ? 'desc'
                                                    : 'asc'
                                            )
                                        }}
                                        className="fas fa-caret-down ms-2"
                                    />
                                ) : (
                                    <i
                                        onClick={() => {
                                            setSort('received_on')
                                            setOrder(
                                                'received_on' !== sort
                                                    ? 'asc'
                                                    : order === 'asc'
                                                    ? 'desc'
                                                    : 'asc'
                                            )
                                        }}
                                        className="fas fa-caret-up ms-2"
                                    />
                                )}
                            </Col>
                            <Col
                                className="u-pointer-cursor text-secondary"
                                xs="3"
                                md="3"
                            >
                                {t('table.reason.title')}
                            </Col>
                            <Col
                                className="u-pointer-cursor text-secondary"
                                xs="2"
                                md="2"
                            ></Col>
                        </Row>

                        {dealsHistory.map((deal) => (
                            <Row
                                className={`py-3 align-items-center align-items-stretch ${
                                    deal.default
                                        ? 'card-form-default-base'
                                        : 'card-form-base'
                                }`}
                            >
                                <Col
                                    xs="1"
                                    md="1"
                                    className="align-items-center ps-3 flex-fill d-flex"
                                >
                                    {getIconForDealStatus(
                                        deal.internalDecision
                                    )}
                                    <ReactTooltip place="bottom" id="status" />
                                </Col>

                                <Col
                                    xs={isMobile ? '6' : '3'}
                                    md={isMobile ? '6' : '3'}
                                    className="flex-fill d-flex align-items-center"
                                >
                                    {deal.clientName ? (
                                        deal.clientName
                                    ) : (
                                        <>
                                            {deal.receiver.length > 15
                                                ? deal.receiver.substring(
                                                      0,
                                                      5
                                                  ) +
                                                  ' [...] ' +
                                                  deal.receiver.substring(
                                                      deal.receiver.length - 5
                                                  )
                                                : deal.receiver}
                                            <span
                                                onClick={() =>
                                                    copyToClipboard(
                                                        deal.receiver
                                                    )
                                                }
                                            >
                                                <i
                                                    id="copyFullFromAddress"
                                                    className="ms-4 fas fa-copy fa-sm copy-btn"
                                                    data-for="copy"
                                                    data-tip={t(
                                                        'table.from.copy.tooltip'
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
                                    xs={isMobile ? '5' : '3'}
                                    md={isMobile ? '5' : '3'}
                                    className="text-break flex-fill d-flex align-items-center"
                                >
                                    {moment(deal.receivedOn).format(
                                        datetimeFormat
                                    )}
                                </Col>

                                <Col
                                    xs={isMobile ? '12' : '3'}
                                    md="3"
                                    className={
                                        isMobile
                                            ? 'mt-2'
                                            : 'text-break flex-fill d-flex align-items-center'
                                    }
                                >
                                    {deal?.decisionJson?.internalMessage}
                                </Col>

                                {isBrowser && (
                                    <Col
                                        xs="2"
                                        md="2"
                                        className="flex-fill align-items-center justify-content-end d-flex"
                                    >
                                        <div className="pe-3">
                                            <span
                                                onClick={() => {
                                                    setSelectedDealProposal(
                                                        deal
                                                    )
                                                    setViewDealProposalJsonOpen(
                                                        !viewDealProposalJsonOpen
                                                    )
                                                }}
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
                                    </Col>
                                )}
                            </Row>
                        ))}

                        <CustomPagination
                            currentPage={currentPage + 1}
                            totalElements={totalProposals}
                            itemPerPage={itemPerPage}
                            onPageChanged={(event, value) =>
                                setCurrentPage(value - 1)
                            }
                        />
                    </Col>
                </Row>
            ) : error ? (
                <div
                    className="alert alert-danger"
                    role="alert"
                    style={{ marginTop: '50px' }}
                >
                    {t('error.generic')}
                </div>
            ) : isLastSearchFiltered ? (
                <section className="card-form-base p-3">
                    {t('table.noMatch')}
                </section>
            ) : (
                <section className="card-form-base p-3">
                    {t('table.empty')}
                </section>
            )}

            {viewDealProposalJsonOpen && (
                <ViewDealProposalJson
                    isModalOpened={viewDealProposalJsonOpen}
                    handleModal={() =>
                        setViewDealProposalJsonOpen(!viewDealProposalJsonOpen)
                    }
                    dealProposalJson={selectedDealProposal.originalProposal}
                />
            )}
        </div>
    )
}
