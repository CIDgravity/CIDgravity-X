import { PureComponent } from 'react'

import { withAuth0 } from '@auth0/auth0-react'
import { isBrowser, isMobile } from 'react-device-detect'
import { Col, Input, Row } from 'reactstrap'

import { Loader } from 'shared/components'
import {
    BlacklistAddress,
    CheckBlacklisted,
    GetAllBlacklistedForCurrentUser,
    WhitelistAddress,
} from 'shared/services/blacklist'
import { checkAddressValidityAndResolveId } from 'shared/services/client'
import { copyToClipboard } from 'shared/utils/copy-to-clipboard'

import { toast } from 'react-toastify'
import { CustomPagination } from 'shared/components/CustomPagination'
import { Trans, withTranslation } from 'react-i18next'

import debounce from 'lodash/debounce'
import moment from 'moment'
import ReactTooltip from 'react-tooltip'
import BlacklistForm from './BlacklistForm'

import {
    getFilecoinAddressIfValidAndSupported,
    isShortAddress,
    shortenAddress,
} from 'shared/utils/filecoinUtil'

class BlacklistContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            selectedMiner: null,
            isLoading: true,
            isError: false,
            blacklistedAddresses: [],
            totalBlacklisted: 0,
            searchTerm: null,
            currentPage: 0,
            itemPerPage: 10,
        }
    }

    async componentDidMount() {
        // Store the selected miner from url to state
        this.setState({ selectedMiner: this.props.match.params.minerId })

        await this.loadBlacklistContent()
    }

    loadBlacklistContent = async () => {
        const { itemPerPage, currentPage, searchTerm } = this.state

        const response = await GetAllBlacklistedForCurrentUser({
            activePage: currentPage,
            size: itemPerPage,
            searchTerm,
        })

        if (response) {
            this.setState({
                blacklistedAddresses: response.data['response'],
                totalBlacklisted: response.data['x-total-count'],
                isLoading: false,
            })
        }
    }

    onPageChanged = (event, value) => {
        this.setState({ currentPage: value - 1, isLoading: true }, () =>
            this.loadBlacklistContent()
        )
    }

    handleSubmitBlacklist = async (values) => {
        const { t } = this.props

        const address = values.address
        const addressToCheck = { address: address }

        // First check if address match a valid Filecoin address
        const filecoinAddress = getFilecoinAddressIfValidAndSupported(address)

        if (!filecoinAddress) {
            if (filecoinAddress === undefined) {
                return {
                    status: false,
                    message: t(
                        'notification.error.onCheckAddressValidity.invalidFormat',
                        {
                            address: address,
                        }
                    ),
                }
            }
            if (filecoinAddress === null) {
                return {
                    status: false,
                    message: t(
                        'notification.error.onCheckAddressValidity.unsupportedType',
                        { address: address }
                    ),
                }
            }
        }

        let addressValidityDTO
        try {
            addressValidityDTO = await checkAddressValidityAndResolveId(
                addressToCheck
            )
            if (!addressValidityDTO.data.isValid) {
                switch (addressValidityDTO.data.reason) {
                    case 'blacklisted':
                        return {
                            status: false,
                            message: t(
                                'notification.error.onAddressAlreadyBlacklisted',
                                { address: address }
                            ),
                        }
                    case 'alreadyUsed':
                        return {
                            status: false,
                            message: t(
                                'notification.error.onCheckAddressValidity.alreadyUsed',
                                { address: address }
                            ),
                        }
                    case 'actorTypeIsNotAccount':
                        return {
                            status: false,
                            message: t(
                                'notification.error.onCheckAddressValidity.actorTypeIsNotAccount',
                                { address: address }
                            ),
                        }
                    default:
                        return {
                            status: false,
                            message: t(
                                'notification.error.onCheckAddressValidity.default',
                                { address: address }
                            ),
                        }
                }
            }
        } catch (error) {
            console.debug('Error while checking address validity', error)
            return {
                status: false,
                message: t('notification.error.onBlacklistAddress', {
                    address: address,
                }),
            }
        }

        const resolvedAddress = addressValidityDTO.data.stateAccountKey.address

        // Check address isn't already blacklisted
        const checkIfAddressBlacklisted = await CheckBlacklisted({
            value: resolvedAddress,
        })

        if (checkIfAddressBlacklisted.data) {
            if (isShortAddress(filecoinAddress)) {
                return {
                    status: false,
                    message: t(
                        'notification.error.onCheckBlacklisted.isShortAddress',
                        { address: address, resolved: resolvedAddress }
                    ),
                }
            } else {
                return {
                    status: false,
                    message: t(
                        'notification.error.onAddressAlreadyBlacklisted',
                        { address: address }
                    ),
                }
            }
        }

        // Insert new entry in DB
        const addressToBlacklist = {
            address: resolvedAddress,
            comment: values.comment,
        }

        try {
            const response = await BlacklistAddress(addressToBlacklist)

            if (response) {
                this.setState({ isLoading: true }, () =>
                    this.loadBlacklistContent()
                )

                return {
                    status: true,
                    message: t('notification.success.onBlacklistAddress'),
                }
            } else {
                return {
                    status: false,
                    message: t('notification.error.onAddressGenericError'),
                }
            }
        } catch (error) {
            console.log(error)
            return {
                status: false,
                message: t('notification.error.onAddressGenericError'),
            }
        }
    }

    whitelistAddress = async (address) => {
        const { t } = this.props

        try {
            const response = await WhitelistAddress(address)

            if (response) {
                this.setState({ isLoading: true }, () =>
                    this.loadBlacklistContent()
                )

                toast.success(t('notification.success.onWhitelistAddress'))
            } else {
                toast.error(t('notification.error.onWhitelistAddress'))
            }
        } catch (error) {
            console.log(error)
            toast.error(t('notification.error.onWhitelistAddress'))
        }
    }

    handleSearchAddressInBlacklist = debounce((searchTerm) => {
        this.setState({ searchTerm, isLoading: true }, () => {
            this.loadBlacklistContent()
        })
    }, 300)

    render() {
        const { t } = this.props
        const {
            isLoading,
            blacklistedAddresses,
            totalBlacklisted,
            currentPage,
            itemPerPage,
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
                    <Col xs={isMobile ? '12' : '6'} md={isMobile ? '12' : '6'}>
                        <BlacklistForm onSubmit={this.handleSubmitBlacklist} />
                    </Col>

                    <Col xs={isMobile ? '12' : '6'} md={isMobile ? '12' : '6'}>
                        <section className="card-form">
                            <Row className="d-none d-md-flex mb-4">
                                <Col xs={12} md={12} lg={12} className="mb-4">
                                    <Input
                                        id="search"
                                        placeholder={t(
                                            'searchForm.searchInput.placeholder'
                                        )}
                                        onChange={(e) =>
                                            this.handleSearchAddressInBlacklist(
                                                e.target.value
                                            )
                                        }
                                        className="form-control"
                                        autoFocus
                                    />
                                </Col>
                            </Row>

                            {!isLoading ? (
                                <>
                                    <Row className="d-md-flex mb-2">
                                        <Col
                                            className="u-pointer-cursor text-secondary"
                                            xs="6"
                                            md="6"
                                        >
                                            {t('table.address.title')}
                                        </Col>
                                        <Col
                                            className="u-pointer-cursor text-secondary"
                                            xs={isMobile ? '6' : '4'}
                                            md={isMobile ? '6' : '4'}
                                        >
                                            {t('table.addedDate.title')}
                                        </Col>

                                        {isBrowser && (
                                            <Col
                                                className="u-pointer-cursor text-secondary"
                                                xs="2"
                                                md="2"
                                            >
                                                {t('table.action.title')}
                                            </Col>
                                        )}
                                    </Row>

                                    {blacklistedAddresses && (
                                        <>
                                            {blacklistedAddresses.map(
                                                (blacklisted, index) => (
                                                    <div
                                                        key={blacklisted.id}
                                                        className="py-2"
                                                    >
                                                        <Row className="align-items-center align-items-stretch">
                                                            <Col xs="6" md="6">
                                                                <div className="flex-fill d-flex align-items-center">
                                                                    <span
                                                                        data-for="infoFullAddress"
                                                                        data-tip={
                                                                            blacklisted
                                                                                .stateAccountKey
                                                                                .addressId
                                                                                ? `${blacklisted.stateAccountKey.address} (${blacklisted.stateAccountKey.addressId})`
                                                                                : t(
                                                                                      'table.address.addressNotOnChain',
                                                                                      {
                                                                                          address:
                                                                                              blacklisted
                                                                                                  .stateAccountKey
                                                                                                  .address,
                                                                                      }
                                                                                  )
                                                                        }
                                                                        className="ml-4"
                                                                    >
                                                                        {shortenAddress(
                                                                            blacklisted
                                                                                .stateAccountKey
                                                                                .address
                                                                        )}
                                                                    </span>

                                                                    <i
                                                                        data-for="infoCopyAddress"
                                                                        data-tip={t(
                                                                            'table.address.copy.tooltip'
                                                                        )}
                                                                        style={{
                                                                            marginLeft:
                                                                                10 +
                                                                                'px ',
                                                                        }}
                                                                        className="fas fa-copy"
                                                                        onClick={() =>
                                                                            copyToClipboard(
                                                                                blacklisted
                                                                                    .stateAccountKey
                                                                                    .address
                                                                            )
                                                                        }
                                                                    />

                                                                    <ReactTooltip
                                                                        place="bottom"
                                                                        id="infoCopyAddress"
                                                                    />
                                                                </div>

                                                                <ReactTooltip
                                                                    place="bottom"
                                                                    id="infoFullAddress"
                                                                />
                                                            </Col>

                                                            <Col
                                                                xs={
                                                                    isMobile
                                                                        ? '6'
                                                                        : '4'
                                                                }
                                                                md={
                                                                    isMobile
                                                                        ? '6'
                                                                        : '4'
                                                                }
                                                            >
                                                                <div className="flex-fill d-flex align-items-center">
                                                                    {moment(
                                                                        blacklisted.createdAt
                                                                    ).format(
                                                                        'YYYY-MM-DD HH:mm:ss'
                                                                    )}
                                                                </div>
                                                            </Col>

                                                            {isBrowser && (
                                                                <Col
                                                                    xs="2"
                                                                    md="2"
                                                                >
                                                                    <div className="flex-fill d-flex align-items-center">
                                                                        {blacklisted.comment && (
                                                                            <span>
                                                                                <i
                                                                                    data-for="infoComment"
                                                                                    data-tip={
                                                                                        blacklisted.comment
                                                                                    }
                                                                                    className="fas fa-info-circle"
                                                                                />
                                                                                <ReactTooltip
                                                                                    place="bottom"
                                                                                    id="infoComment"
                                                                                />
                                                                            </span>
                                                                        )}

                                                                        <span
                                                                            onClick={() =>
                                                                                this.whitelistAddress(
                                                                                    blacklisted
                                                                                )
                                                                            }
                                                                            className="btn-pointer card-rounded-btn"
                                                                        >
                                                                            <i
                                                                                data-for="remove"
                                                                                data-tip={t(
                                                                                    'table.action.remove.tooltip'
                                                                                )}
                                                                                className="fas fa-minus-circle ms-4"
                                                                            />
                                                                            <ReactTooltip
                                                                                place="bottom"
                                                                                id="remove"
                                                                            />
                                                                        </span>
                                                                    </div>
                                                                </Col>
                                                            )}
                                                        </Row>
                                                    </div>
                                                )
                                            )}
                                        </>
                                    )}
                                </>
                            ) : (
                                <Loader />
                            )}
                        </section>

                        <CustomPagination
                            defaultPage={currentPage + 1}
                            totalElements={totalBlacklisted}
                            itemPerPage={itemPerPage}
                            onPageChanged={this.onPageChanged}
                        />
                    </Col>
                </Row>
            </div>
        )
    }
}

export default withAuth0(
    withTranslation('BlacklistContainer')(BlacklistContainer)
)
