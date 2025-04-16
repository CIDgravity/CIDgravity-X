import React, { PureComponent } from 'react'

import { withAuth0 } from '@auth0/auth0-react'
import { Button, Col, Row, FormGroup, Label } from 'reactstrap'
import { Link } from 'react-router-dom'
import { Trans, withTranslation } from 'react-i18next'
import { isBrowser, isMobile } from 'react-device-detect'

import { Loader } from 'shared/components'
import { ConfirmDeletePolicyGroup, ImportExportOnboardingPolicy } from 'shared/modals'

import { GetCurrentAddressIsPremium } from 'shared/services/cidg-services/client-backend/address'

import {  
    GetAllOnboardingPolicyGroupsForCurrentTenant, 
    RemovePolicyGroup 
} from 'shared/services/cidg-services/client-backend/onboarding_policy_groups'

import { 
    GetOnboardingPolicySettingsForCurrentTenant, 
    UpdateOnboardingPolicySettings,
    GetExportationFormatForCurrentTenant,
    ImportOnboardingPolicyForCurrentTenant,
} from 'shared/services/cidg-services/client-backend/onboarding_policy_settings'

import { toast } from 'react-toastify'
import { withStyles } from "@mui/styles";

import BadgeMui from "@mui/material/Badge";
import Select from 'react-select'
import ReactTooltip from 'react-tooltip'

import PremiumRestrictedSection from 'shared/components/PremiumRestrictedSection'
import CustomButtonPremium from 'shared/components/CustomButtonPremium'

const CustomBadge = withStyles((theme) => ({
    badge: { width: props => props.width, padding: "10px", backgroundColor: props => props.bgColor, color: props => props.textColor },
}))(BadgeMui);

class OnboardingPolicyContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            error: false,
            isLoading: true,
            isImportLoading: false,
            isPremium: false,
            confirmDeletePolicyGroupModalOpened: false,
            exportImportOnboardingPolicyModalOpened: false,
            policyGroupToDelete: null,
            indexPolicyGroupToDelete: null,
            policyGroups: [],
            policySettings: {
                id: '',
                priority: '',
                mixNumberOfCopies: 0,
                updatedOn: ''
            },
            policyExportationFormat: {
                Settings: {},
                MixGroup: {},
                Groups: [],
            },
            policyExportationFormatEdited: {
                Settings: {},
                MixGroup: {},
                Groups: [],
            }
        }
    }

    async componentDidMount() {
        this.loadData()
    }

    loadData = () => {
        let isPremiumAccount = false;

        GetCurrentAddressIsPremium().then(function (response) {
            isPremiumAccount = response.data.result.isPremium

        }).catch(() => {
            this.setState({ error: true, isLoading: false})

        }).finally(async () => {
            this.setState({ isPremium: isPremiumAccount })

            // export format loading will be done after click on Import/Export button
            if (isPremiumAccount) {
                this.loadExistingPolicyGroups()
            }

            this.loadOnboardingPolicySettings()
        })
    }

    loadOnboardingPolicyExportationFormat = async() => {
        this.setState({ isLoading: true })

        try {
            const response = await GetExportationFormatForCurrentTenant()

            if (response.status === 204) {
                this.setState({  
                    policyExportationFormat: null,
                    policyExportationFormatEdited: null,
                    isLoading: false
                })

            } else if (response.status === 200 && response.data) {
                this.setState({  
                    policyExportationFormat: JSON.stringify(response?.data?.result, null, 2),
                    policyExportationFormatEdited: JSON.stringify(response?.data?.result, null, 2),
                    isLoading: false
                })

            } else {
                this.setState({ error: true, isLoading: false})
            }

        } catch (error) {
            this.setState({ error: true, isLoading: false })
        }
    }

    loadExistingPolicyGroups = async () => {
        this.setState({ isLoading: true })

        try {
            const response = await GetAllOnboardingPolicyGroupsForCurrentTenant()

            if (response.data) {
                this.setState({ policyGroups: response.data.result, isLoading: false })
            } else {
                this.setState({ error: true, isLoading: false })
            }

        } catch (error) {
            this.setState({ error: true, isLoading: false })
        }
    }

    loadOnboardingPolicySettings = async () => {
        this.setState({ isLoading: true })

        try {
            const response = await GetOnboardingPolicySettingsForCurrentTenant()

            if (response.status === 204) {
                this.setState({ policySettings: null, isLoading: false })

            } else if (response.status === 200 && response.data) {
                this.setState({ policySettings: response?.data?.result, isLoading: false })
                
            } else {
                this.setState({ error: true, isLoading: false})
            }
            
        } catch (error) {
            this.setState({ error: true, isLoading: false })
        }
    }

    handleConfirmDeletePolicyGroupModal = (group, index) => {
        if (group) {
            this.setState({
                confirmDeletePolicyGroupModalOpened: !this.state.confirmDeletePolicyGroupModalOpened,
                policyGroupToDelete: group,
                indexPolicyGroupToDelete: index,
            })
        } else {
            this.setState({ confirmDeletePolicyGroupModalOpened: false })
        }
    }

    handleDeletePolicyGroup = async () => {
        const { t } = this.props
        const { policyGroupToDelete, policyGroups, indexPolicyGroupToDelete } = this.state
        this.handleConfirmDeletePolicyGroupModal()

        try {
            const response = await RemovePolicyGroup(policyGroupToDelete.id)

            if (response) {
                var policyGroupsCopy = policyGroups
                delete policyGroupsCopy[indexPolicyGroupToDelete];
                
                this.setState({
                    policyGroupToDelete: null,
                    indexPolicyGroupToDelete: null,
                    policyGroups: policyGroupsCopy,
                })

                toast.success(t('notification.success.onDeletePolicyGroup'))
            } else {
                toast.error(t('notification.error.onDeletePolicyGroup'))
            }
        } catch (error) {
            toast.error(t('notification.error.onDeletePolicyGroup'))
        }
    }
    
    handlePolicyPriorityChange = (selectedOption) => {
        const { policySettings } = this.state;

        this.setState({
            policySettings: {
                ...policySettings,
                priority: selectedOption.value,
            }
        })
    }

    handleSavePolicySettings = async () => {
        const { t } = this.props
        const { policySettings } = this.state;

        try {
            const response = await UpdateOnboardingPolicySettings(policySettings)

            if (response) {
                toast.success(t('notification.success.onUpdatePolicySettings'))
            } else {
                toast.error(t('notification.error.onUpdatePolicySettings'))
            }
        } catch (error) {
            console.log(error)
            toast.error(t('notification.error.onUpdatePolicySettings'))
        }
    }

    // Export / import policy functions
    handleExportImportPolicyModal = () => {
        const { isPremium, exportImportOnboardingPolicyModalOpened, policyExportationFormat } = this.state;

        if (exportImportOnboardingPolicyModalOpened) {
            this.setState({ 
                exportImportOnboardingPolicyModalOpened: false,
                policyExportationFormatEdited: policyExportationFormat
            })
        } else {
            if (isPremium) {
                this.loadOnboardingPolicyExportationFormat()
            }

            this.setState({ 
                exportImportOnboardingPolicyModalOpened: true 
            })
        }
    } 

    handleCopyOnboardingPolicyJsonToClipboard = () => {
        const { policyExportationFormatEdited } = this.state
        let area = document.createElement('textarea')
        document.body.appendChild(area)
        area.value = policyExportationFormatEdited
        area.select()
        document.execCommand('copy')
        document.body.removeChild(area)
        toast.success('Copied to clipboard')
    }

    handleImportPolicy = async () => {
        const { i18n, t } = this.props
        const { policyExportationFormatEdited } = this.state;

        // Check JSON is not empty to avoid EOF
        if (policyExportationFormatEdited == null || (typeof policyExportationFormatEdited === "string" && policyExportationFormatEdited.trim().length === 0)) {
            toast.error(t('notification.error.EMPTY_REQUEST_BODY'))
            return
        }

        this.setState({ isImportLoading: true })

        try {
            const response = await ImportOnboardingPolicyForCurrentTenant(policyExportationFormatEdited)

            if (response) {
                this.loadData()
                this.setState({ isImportLoading: false })
                this.handleExportImportPolicyModal()
                toast.success(t('notification.success.onImportPolicy'))
            } else {
                toast.error(t('notification.error.onImportPolicy'))
            }

        } catch (err) {
            this.setState({ isImportLoading: false })

            if (err.response.data.error) {
                if (i18n.exists(`OnboardingPolicyContainer:notification.error.${err.response.data.error.message}`)) {
                    toast.error(t(`notification.error.${err.response.data.error.message}`))
                } else {
                    toast.error(err.response.data.error.message)
                }
            } else {
                toast.error(t('notification.error.onImportPolicy'))
            }
        }
    }
    
    handlePolicyJsonContentChange  = (content) => {
        this.setState({ policyExportationFormatEdited: content })
    }

    getProviderNameLookupIfAvailable = (provider) => {
        const providerName = provider.providerLookup !== null ? " (" + provider.providerLookup.companyName + ")" : ""
        return provider.addressId + providerName
    }

    // to fit every content, we define 7px per letter
    // this function will define the content and return the width to apply
    // if there is no provider name apply a minimum width of 70px
    getProviderBadgeWidth = (provider) => {
        if (provider.providerLookup === null) {
            return 70
        }

        const providerName = provider.providerLookup !== null ? " (" + provider.providerLookup.companyName + ")" : ""
        const content = provider.addressId + providerName
        return 7 * content.length
    }

    render() {
        const { t } = this.props
        const {
            isImportLoading,
            policyGroups,
            isPremium,
            policySettings,
            policyExportationFormatEdited,
            error,
            isLoading,
            confirmDeletePolicyGroupModalOpened,
            exportImportOnboardingPolicyModalOpened,
            policyGroupToDelete
        } = this.state

        const policyPriorityOptions = [
            { value: "number_of_copies", label: t('settings.priority.options.numberOfCopies') },
            { value: "policy_respected", label: t('settings.priority.options.policyRespected') }
        ]

        return (
            <div className="container">
                <Row className="mt-4">
                    <Col xs={12} md={6}>
                        <h1>{t('title')}</h1>
                        <p>{t('subtitle')}</p>
                    </Col>

                    {/* Create group and import/export buttons */}
                    {policySettings && policyGroups && !isLoading && isBrowser && (
                        <Col xs={12} md={6}>
                            <div className="text-end ms-2">
                                <CustomButtonPremium
                                    btnTag={Link}
                                    btnId="createNewOnboardingPolicyGroup"
                                    btnToLink="./onboarding-policy/new"
                                    btnClassName="me-4 custom-cidg-button"
                                    disabled={policyGroups.length >= 10}
                                    isPremium={isPremium}
                                    btnText={t('button.new')}
                                />

                                <CustomButtonPremium
                                    btnHandleAction={this.handleExportImportPolicyModal}
                                    btnId="importExportPolicyFromJson"
                                    btnClassName="me-4"
                                    btnColor="primary"
                                    btnText={t('button.importExportFromJson')}
                                    isPremium={isPremium}
                                />
                            </div>
                        </Col>
                    )}
                </Row>

                {isLoading ? (
                    <Loader />

                ) : error ? (
                    <div className="alert alert-danger" role="alert" style={{ marginTop: '50px' }}>
                        {t('error.generic')}
                    </div>
                
                ) : !policySettings ? (
                    <section className="card-form mt-4">
                        {t('initOnboardingPolicy.title')}
                        <br />
                        <br />
                        <Button
                            tag={Link}
                            id="initOnboardingPolicy"
                            to="./onboarding-policy/init"
                            type="submit"
                            color="primary"
                            size="1x"
                            className="me-4 custom-cidg-button"
                        >
                            <span className="as--light">
                                {t('button.initOnboardingPolicy')}
                            </span>
                        </Button>
                    </section>
                
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

                        <div className={!isPremium ? "premium-section" : ""} disabled={!isPremium} aria-disabled={!isPremium}>
                            <Row className="mt-4">
                                <Col xs="12" md="12">
                                    <div className="card p-4">
                                        <Row>
                                            <h5 className="mb-4">{t('settings.title')}</h5>

                                            <Col xs="4" md="4">
                                                <FormGroup>
                                                    <Label for="settings-priority" className="form-label">
                                                        {t('settings.priority.label')}
                                                    </Label>{' *'}

                                                    <i
                                                        style={{ marginTop: '4px' }}
                                                        data-for="policySettingsPriority"
                                                        data-tip={t('settings.priority.tooltip')}
                                                        className="ms-4 fas fa-info-circle fa-sm"
                                                    />

                                                    <ReactTooltip place="bottom" id="policySettingsPriority" />
                                        
                                                    <Select 
                                                        name="entityType"
                                                        id="entity-type"
                                                        onChange={this.handlePolicyPriorityChange}
                                                        value={policyPriorityOptions.find(opt => opt.value === policySettings?.priority)}
                                                        options={policyPriorityOptions}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col className="text-end">
                                                <CustomButtonPremium
                                                    btnHandleAction={() => this.handleSavePolicySettings()}
                                                    btnId="saveSettings"
                                                    btnClassName="custom-cidg-button"
                                                    btnText={t('button.saveSettings')}
                                                    isPremium={isPremium}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        <Row>
                            <Col xs={12} md={12} style={{ marginTop: 50 + 'px' }}>
                                <Row className="d-md-flex mb-2">
                                    <Col className="u-pointer-cursor text-secondary" xs="3" md="3">
                                        {t('table.name.title')}
                                    </Col>

                                    <Col className="u-pointer-cursor text-secondary" xs="3" md="3">
                                        {t('table.providers.title')}
                                    </Col>

                                    <Col className="u-pointer-cursor text-secondary" xs="2" md="2">
                                        {t('table.numberOfCopies.title')}
                                    </Col>
                                </Row>

                                {/* Display all onboarding policy groups first */}
                                {/* Editing custom group will be disabled if user is non premium account, only mix can be edited */}
                                {policyGroups?.map((policyGroup, index) => (
                                    <div id={'modelCard' + index} key={policyGroup.id} disabled={!isPremium} aria-disabled={!isPremium} className="p-3 card-form">
                                        <Row key={policyGroup.id} className="align-items-center align-items-stretch">
                                            <Col xs={isMobile ? '4' : '3'} md={isMobile ? '5' : '3'}>
                                                <div className="flex-fill d-flex align-items-center">
                                                    {policyGroup.name}
                                                </div>
                                            </Col>

                                            <Col xs="3" md="3">
                                                {policyGroup.providers?.map((provider, index) => (
                                                    <div className={"ms-3" + (index > 0 ? ' mt-2' : '')}>
                                                        <Link to={`./provider-details/${provider.addressId}`}>
                                                            <CustomBadge 
                                                                bgColor="#000b44"
                                                                textColor="#ffffff"
                                                                badgeContent={this.getProviderNameLookupIfAvailable(provider)}
                                                                width={this.getProviderBadgeWidth(provider)}
                                                                data-for={'viewProviderComment-' + index} 
                                                                data-tip={provider.comment} 
                                                            />
                                                        </Link>
                                                        
                                                        <ReactTooltip place="bottom" id={'viewProviderComment-' + index} />
                                                    </div>
                                                ))}
                                            </Col>

                                            <Col xs={isMobile ? '5' : '3'} md={isMobile ? '5' : '3'}>
                                                <div className="flex-fill d-flex align-items-center">
                                                    {policyGroup.numberOfCopies}{' '}
                                                    {t('table.numberOfCopies.copy', { count: policyGroup.numberOfCopies })}
                                                </div>
                                            </Col>

                                            {isBrowser && (
                                                <Col id={'policyGroupActions' + index} xs="3" md="3">
                                                    <div className="flex-fill d-flex align-items-center">
                                                        <Link
                                                            style={{ color: '#222b2a'}}
                                                            className="card-rounded-btn ms-4 btn-pointer icons"
                                                            id={`edit-${policyGroup.id}`}
                                                            to={`./onboarding-policy/${policyGroup.id}`}
                                                        >
                                                            <i
                                                                id={'editPolicy' + index}
                                                                className="fas fa-edit"
                                                                data-for="edit"
                                                                data-tip={t('table.edit.tooltip')}
                                                            />

                                                            <ReactTooltip place="bottom" id="edit"/>
                                                        </Link>

                                                        <span
                                                            id={'deletePolicy' + index}
                                                            onClick={() => this.handleConfirmDeletePolicyGroupModal(policyGroup, index)}
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

                                {/* Latest row display the mix as group using policy settings */}
                                <div id="modelCard-mix" className="p-3 card-form">
                                    <Row className="align-items-center align-items-stretch">
                                        <Col xs={isMobile ? '4' : '3'} md={isMobile ? '5' : '3'}>
                                            <div className="flex-fill d-flex align-items-center">
                                                {t('mixGroupName')}
                                            </div>
                                        </Col>

                                        <Col xs="3" md="3">
                                            <div className="flex-fill d-flex align-items-center">
                                                {t('table.providers.all')}
                                            </div>
                                        </Col>

                                        <Col xs={isMobile ? '5' : '3'} md={isMobile ? '5' : '3'}>
                                            <div className="flex-fill d-flex align-items-center">
                                                {policySettings.mixNumberOfCopies}{' '}
                                                {t('table.numberOfCopies.copy', { count: policySettings.mixNumberOfCopies })}
                                            </div>
                                        </Col>

                                        {isBrowser && (
                                            <Col id="policyGroupActions-mix" xs="3" md="3">
                                                <div>
                                                    <Link
                                                        style={{ color: '#222b2a'}}
                                                        className="card-rounded-btn ms-4 btn-pointer icons"
                                                        id="edit-mix"
                                                        to="./onboarding-policy/mix"
                                                    >
                                                        <i
                                                            id="editPolicy-mix"
                                                            className="fas fa-edit"
                                                            data-for="edit"
                                                            data-tip={t('table.edit.tooltip')}
                                                        />

                                                        <ReactTooltip place="bottom" id="edit"/>
                                                    </Link>
                                                </div>
                                            </Col>
                                        )}
                                    </Row>
                                </div>
                            </Col>
                        </Row>
                    </>
                )}

                {confirmDeletePolicyGroupModalOpened && (
                    <ConfirmDeletePolicyGroup
                        isModalOpened={confirmDeletePolicyGroupModalOpened}
                        handleDeletePolicyGroup={this.handleDeletePolicyGroup}
                        handleModal={this.handleConfirmDeletePolicyGroupModal}
                        policyGroup={policyGroupToDelete}
                    />
                )}

                {exportImportOnboardingPolicyModalOpened && (
                    <ImportExportOnboardingPolicy
                        isImportLoading={isImportLoading}
                        isModalOpened={exportImportOnboardingPolicyModalOpened}
                        handleImportOnboardingPolicy={this.handleImportPolicy}
                        onboardingPolicyJson={policyExportationFormatEdited}
                        handleOnChangeJsonContent={this.handlePolicyJsonContentChange}
                        handleModal={this.handleExportImportPolicyModal}
                        handleCopyOnboardingPolicyJsonToClipboard={this.handleCopyOnboardingPolicyJsonToClipboard}
                    />
                )}
            </div>
        )
    }
}

export default withAuth0(
    withTranslation('OnboardingPolicyContainer')(OnboardingPolicyContainer)
)
