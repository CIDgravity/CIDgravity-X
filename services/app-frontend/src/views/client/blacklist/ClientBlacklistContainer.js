import React, { PureComponent } from 'react'

import { withAuth0 } from '@auth0/auth0-react'
import { Input, Col, Row } from 'reactstrap'
import { Trans, withTranslation } from 'react-i18next'
import { isBrowser } from 'react-device-detect'
import { Loader } from 'shared/components'
import { toast } from 'react-toastify'

import { GetCurrentAddressIsPremium } from 'shared/services/cidg-services/client-backend/address'

import {  
    GetAllBlacklistedAddressesForCurrentTenantPaginated, 
    RemoveAddressFromBlacklist,
    InsertAddressToBlacklist,
    CheckIfAddressIsBlacklisted
} from 'shared/services/cidg-services/client-backend/blacklist'

import { CustomPagination } from 'shared/components/CustomPagination'
import { CheckProviderNotAlreadyUsedInPolicyGroup } from 'shared/services/cidg-services/client-backend/onboarding_policy_groups'
import { isShortAddressFromFilecoinAddressString } from 'shared/utils/filecoinUtil'
import { CheckProviderShortAddressOnChainValidity } from 'shared/services/filecoin'

import moment from 'moment'
import debounce from 'lodash/debounce'
import ReactTooltip from 'react-tooltip'
import ClientBlacklistForm from './ClientBlacklistForm'
import PremiumRestrictedSection from 'shared/components/PremiumRestrictedSection'

class ClientBlacklistContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            isPremium: false,
            error: false,
            isLoading: true,
            searchTerm: "",
            blacklistedAddresses: [],
            totalBlacklistedAddresses: 0,
            currentPage: 0,
            itemPerPage: 30,
        }
    }

    async componentDidMount() {
        let isPremiumAccount = false;

        GetCurrentAddressIsPremium().then(function (response) {
            isPremiumAccount = response.data.result.isPremium

        }).catch(() => {
            this.setState({ error: true, isLoading: false})

        }).finally(async () => {
            this.setState({ isPremium: isPremiumAccount })

            if (isPremiumAccount) {
                this.loadBlacklistedAddresses()
            } else {
                this.setState({ isLoading: false })
            }
        })
    }

    loadBlacklistedAddresses = async () => {
        const { itemPerPage, currentPage, searchTerm } = this.state

        try {
            const response = await GetAllBlacklistedAddressesForCurrentTenantPaginated(currentPage, itemPerPage, searchTerm)

            this.setState({
                blacklistedAddresses: response.data.result,
                totalBlacklistedAddresses: response.data.totalCount,
                isLoading: false,
            })
        } catch (error) {
            this.setState({ error: true, isLoading: false })
        }
    }

    handlePageChanged = (value) => {
        this.setState({ currentPage: value - 1, isLoading: true }, () =>
            this.loadBlacklistedAddresses()
        )
    }

    handleRemoveAddressFromBlacklist = async (blacklistedAddress) => {
        const { t } = this.props

        try {
            const response = await RemoveAddressFromBlacklist(blacklistedAddress.id)

            if (response) {
                this.loadBlacklistedAddresses()
                toast.success(t('notification.success.onRemoveFromBlacklist'))
            } else {
                toast.error(t('notification.error.onRemoveFromBlacklist'))
            }
        } catch (error) {
            toast.error(t('notification.error.onRemoveFromBlacklist'))
        }
    }

    handleAddAddressToBlacklist = async (values) => {
        const { t } = this.props

        // Check if address is a provider short address
        if (!isShortAddressFromFilecoinAddressString(values.addressId)) {
            return { status: false, message: t('validation.invalidProviderShortAddress') }
        }

        // Check provider address is valid on chain
        const isProviderAddressValidOnChain = await CheckProviderShortAddressOnChainValidity(values.addressId)

        if (isProviderAddressValidOnChain.data) {
            if (!isProviderAddressValidOnChain.data.isValid) {
                return { status: false, message: t('validation.providerAddressInvalidOnChain') }
            }
        } else {
            return { status: false, message: t('validation.internalErrorWhileCheckingProviderAddress') }
        }

        // Check address not already in blacklist
        const alreadyInBlacklist = await CheckIfAddressIsBlacklisted({ AddressId: values.addressId })

        if (alreadyInBlacklist.data.result.isBlacklisted) {
            return { status: false, message: t('validation.addressAlreadyInBlacklist') }
        }

        // Check address not in a policy group
        const alreadyInPolicyGroup = await CheckProviderNotAlreadyUsedInPolicyGroup({ addressId: values.addressId, groupId: -1 })

        if (alreadyInPolicyGroup.data.result.isAlreadyInGroup) {
            return { status: false, message: t('validation.addressUsedInPolicyGroup') }
        }

        // Begin insert
        const addressToBlacklist = {
            addressId: values.addressId,
            comment: values.comment,
        }

        try {
            const response = await InsertAddressToBlacklist(addressToBlacklist)

            if (response) {
                this.loadBlacklistedAddresses()
                return { status: true, message: '' }
            } else {
                return { status: false, message: t('notification.error.onInsertAddressToBlacklist')}
            }
        } catch (error) {
            console.log(error)
            return { status: false, message: t('notification.error.onInsertAddressToBlacklist') }
        }
    }

    handleSearchAddressInBlacklist = debounce((searchTerm) => {
        this.setState({ searchTerm, isLoading: true }, () => {
            this.loadBlacklistedAddresses()
        })
    }, 300)

    render() {
        const { t } = this.props
        const { error, isPremium, isLoading, blacklistedAddresses, totalBlacklistedAddresses, itemPerPage, currentPage } = this.state

        return (
            <div className="container">
                <Row className="mt-4">
                    <Col xs={12} md={6}>
                        <h1>{t('title')}</h1>
                        <p>{t('subtitle')}</p>
                    </Col>
                </Row>

                {/* Add address to blacklist form */}
                {isLoading ? (
                    <Loader />

                ) : error ? (
                    <div className="alert alert-danger" role="alert" style={{ marginTop: '50px' }}>
                        {t('error.generic')}
                    </div>

                ) : (
                    <>
                        {/* Display premium upgrade message */}
                        {!isPremium && (
                            <PremiumRestrictedSection 
                                title={<Trans t={t} i18nKey="premium.title" />}
                                subtitle={<Trans t={t} i18nKey="premium.subtitle" />}
                                upgradeButtonText={<Trans t={t} i18nKey="premium.button" />}
                            />
                        )}

                        {/* Display page content by everything will be disabled (read-only) */}
                        <div className={!isPremium ? "premium-section" : ""} disabled={!isPremium} aria-disabled={!isPremium}>
                            <ClientBlacklistForm 
                                isPremium={isPremium} 
                                onSubmit={this.handleAddAddressToBlacklist} 
                            />
                        
                            <div className="card-no-border mt-4 mb-4">
                                <Row>
                                    <Col xs={12} md={12} style={{ marginTop: 50 + 'px', paddingLeft: 50 + 'px', paddingRight: 50 + 'px' }}>
                                        <Input
                                            id="search"
                                            placeholder={t('searchForm.searchInput.placeholder')}
                                            onChange={(e) => this.handleSearchAddressInBlacklist(e.target.value)}
                                            className="form-control"
                                            autoFocus
                                        />
                                    </Col>
                                </Row>
            
                                <Row>
                                    <Col xs={12} md={12} style={{ marginTop: 50 + 'px', paddingLeft: 50 + 'px', paddingRight: 50 + 'px' }}>
                                        {blacklistedAddresses.length <= 0 ? (
                                            <section className="card-form">
                                                {t('empty.title')}
                                            </section>
                                        ) : (
                                            <>
                                                <Row className="d-md-flex mb-2">
                                                    <Col className="u-pointer-cursor text-secondary" xs="3" md="3">
                                                        {t('table.address.title')}
                                                    </Col>
                
                                                    <Col className="u-pointer-cursor text-secondary" xs="5" md="5">
                                                        {t('table.comment.title')}
                                                    </Col>
                
                                                    <Col className="u-pointer-cursor text-secondary" xs="2" md="2">
                                                        {t('table.addedOn.title')}
                                                    </Col>
                                                </Row>
            
                                                {blacklistedAddresses?.map((blacklistedAddress, index) => (
                                                    <div id={'modelCard' + index} key={blacklistedAddress.id} className="p-3 card-form">
                                                        <Row key={blacklistedAddress.id} className="align-items-center align-items-stretch">
                                                            <Col xs="3" md="3">
                                                                <div className="flex-fill d-flex align-items-center">
                                                                    {blacklistedAddress.addressId}
                                                                </div>
                                                            </Col>
                
                                                            <Col xs="5" md="5">
                                                                <div className="flex-fill d-flex align-items-center">
                                                                    {blacklistedAddress.comment}
                                                                </div>
                                                            </Col>
                
                                                            <Col xs="2" md="2">
                                                                <div className="flex-fill d-flex align-items-center">
                                                                    {moment(blacklistedAddress.addedOn).format('YYYY-MM-DD HH:mm:ss')}
                                                                </div>
                                                            </Col>
                
                                                            {isBrowser && (
                                                                <Col id={'blacklistedAddressesActions' + index} xs="2" md="2">
                                                                    <div className="flex-fill d-flex align-items-center">
                                                                        <span
                                                                            id={'removeAddress' + index}
                                                                            onClick={() => this.handleRemoveAddressFromBlacklist(blacklistedAddress)}
                                                                            className="btn-pointer card-rounded-btn ms-4"
                                                                        >
                                                                            <i
                                                                                className="fas fa-trash-alt"
                                                                                data-for="delete"
                                                                                data-tip={t('table.delete.tooltip')}
                                                                            />
                
                                                                            <ReactTooltip place="bottom" id="delete"/>
                                                                        </span>
                                                                    </div>
                                                                </Col>
                                                            )}
                                                        </Row>
                                                    </div>
                                                ))}
            
                                                <CustomPagination
                                                    currentPage={currentPage + 1}
                                                    totalElements={totalBlacklistedAddresses}
                                                    itemPerPage={itemPerPage}
                                                    onPageChanged={(event, value) => this.handlePageChanged(value)}
                                                />
                                            </>
                                        )}
                                    </Col>
                                </Row>  
                            </div>
                        </div>
                    </>
                )}
            </div>
        )
    }
}

export default withAuth0(
    withTranslation('ClientBlacklistContainer')(ClientBlacklistContainer)
)
