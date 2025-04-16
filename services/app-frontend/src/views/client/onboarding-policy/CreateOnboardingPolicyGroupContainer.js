import { PureComponent } from 'react'

import { withAuth0 } from '@auth0/auth0-react'
import { Trans, withTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button, Col, Container, Row } from 'reactstrap'
import { Loader } from 'shared/components'

import { GetCurrentAddressIsPremium } from 'shared/services/cidg-services/client-backend/address'

import {
    checkIfAllProvidersAreFilled,
    checkIfAllProvidersAreValid
} from 'shared/utils/onboarding-policy'

import {
    GetOnboardingPolicyGroupByIdAndCurrentTenant,
    CheckOnboardingPolicyGroupNameAlreadyUsed,
    CreateOnboardingPolicyGroup,
    UpdateOnboardingPolicyGroup
} from 'shared/services/cidg-services/client-backend/onboarding_policy_groups'

import {
    UpdateOnboardingPolicySettings,
    GetOnboardingPolicySettingsForCurrentTenant,
    InitOnboardingPolicySettings
} from 'shared/services/cidg-services/client-backend/onboarding_policy_settings'

import CreateOnboardingPolicyGroupForm from './CreateOnboardingPolicyGroupForm'
import PremiumRestrictedSection from 'shared/components/PremiumRestrictedSection'

class CreateOnboardingPolicyGroupContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            isNew: false,
            isInitOrMixGroup: false,
            isPremiumRequired: false,
            isLoading: true,
            isError: false,
            providersList: [],
            policySettings: {
                id: '',
                priority: '',
                mixNumberOfCopies: 0,
                updatedOn: ''
            },
            policyGroup: {
                id: -1,
                name: '',
                providers: [],
                numberOfCopies: 0
            },
        }
    }

    // First load if current address is premium or not
    // Edit mix or init not require premium account, but edit custom group or create new group require premium
    async componentDidMount() {
        let isPremiumAccount = false;

        // Check current address is premium or not
        // Do the rest of the code in finally block to be sure the result of isPremium is arrived
        GetCurrentAddressIsPremium().then(function (response) {
            isPremiumAccount = response.data.result.isPremium

        }).catch(() => {
            this.setState({ error: true, isLoading: false})

        }).finally(async () => {

            // Check action depending on url param (only used for page title)
            if (this.props.match.params.policyGroupId === 'mix' || this.props.match.params.policyGroupId === 'init') {
                this.setState({ isInitOrMixGroup: true })
            } else if(this.props.match.params.policyGroupId === 'new') {
                this.setState({ isNew: true })
            }

            // Check URL params to load required data
            if (this.props.match.params.policyGroupId === 'mix' || this.props.match.params.policyGroupId === 'init') {
                try {
                    const policySettingsWithMix = await GetOnboardingPolicySettingsForCurrentTenant()

                    if (policySettingsWithMix.status === 204) {
                        this.setState({ policySettings: null, isLoading: false })

                    } else if (policySettingsWithMix.status === 200 && policySettingsWithMix.data) {
                        this.setState({ policySettings: policySettingsWithMix.data.result, isLoading: false })
                        
                    } else {
                        this.setState({ error: true, isLoading: false})
                    }
                } catch (error) {
                    console.log(error)
                }

            } else if (this.props.match.params.policyGroupId === 'new' && isPremiumAccount) {
                this.setState({ isLoading: false })

            } else if (isPremiumAccount) {
                try {
                    const response = await GetOnboardingPolicyGroupByIdAndCurrentTenant(this.props.match.params.policyGroupId)

                    if (response.data) {
                        this.setState({ 
                            policyGroup: response.data.result, 
                            providersList: response.data.result?.providers?.map((provider) => ({ ...provider })),
                            isLoading: false 
                        })
                    } else {
                        this.setState({ isError: true, isLoading: false })
                    }
                } catch (error) {
                    console.log(error)
                    this.setState({ isError: true, isLoading: false })
                }
            } else {
                this.setState({ isPremiumRequired: true, isLoading: false })
            }
        });
    }

    // Providers function
    handleProviderInputChange = (e, index) => {
        const { name, value } = e.target
        const list = [...this.state.providersList]
        list[index][name] = value
        this.setState({ providersList: list })
    }

    handleAddProvider = () => {
        this.setState({
            providersList: [
                ...this.state.providersList,
                {
                    addressId: '',
                    comment: '',
                },
            ],
        })
    }

    handleRemoveProvider = (index) => {
        const providersList = [...this.state.providersList]
        providersList.splice(index, 1)
        this.setState({ providersList })
    }

    // Submit and save functions
    handleValidSubmitMixGroupSetup = async (values) => {
        const { t } = this.props
        const { policySettings } = this.state;

        // If policySettings is null, create with the selected numberOfCopies and default values
        // Default policy is number_of_copies
        if (!policySettings) {
            const policySettingsToCreate = { 
                priority: 'number_of_copies',
                mixNumberOfCopies: values.numberOfCopies,
            }

            try {
                const response = await InitOnboardingPolicySettings(policySettingsToCreate)
    
                if (response) {
                    return { status: true, message: '' }
                } else {
                    return { status: false, message: t('validation.onInitPolicySettings')}
                }
            } catch (error) {
                console.log(error)
                return { status: false, message: t('validation.onInitPolicySettings') }
            }

        } else {
            const policySettingsToSave = { 
                ...policySettings,
                mixNumberOfCopies: values.numberOfCopies ,
            }

            try {
                const response = await UpdateOnboardingPolicySettings(policySettingsToSave)

                if (response) {
                    return { status: true, message: '' }
                } else {
                    return { status: false, message: t('validation.onUpdatePolicyGroup')}
                }
            } catch (error) {
                console.log(error)
                return { status: false, message: t('validation.onUpdatePolicyGroup') }
            }
        }
    }

    handleValidSubmit = async (values) => {
        const { policyGroup, providersList, isInitOrMixGroup, isNew } = this.state
        const { t } = this.props

        // First check if this is a configuration for the mix group
        if (isInitOrMixGroup) {
            return this.handleValidSubmitMixGroupSetup(values)
        }

        // Otherwise, do the standard checks: name unique, at least one provider ...
        // Passing groupId will exclude current group (if update process) and not include current group as duplicate
        const groupNameAlreadyUsed = await CheckOnboardingPolicyGroupNameAlreadyUsed({ name: values.name, groupId: policyGroup.id })

        if (providersList.length <= 0) {
            return { status: false, message: t('validation.atLeastOneProviderIsRequired') }
        }

        if (values.numberOfCopies > providersList.length) {
            return { status: false, message: t('validation.isMoreThanNumberOfProviders') }
        }

        if (!checkIfAllProvidersAreFilled(providersList)) {
            return { status: false, message: t('validation.atLeastOneProviderIsNotFilled') }
        }

        // Check all providers are valid (format, on chain validity ...)
        // this function return only first error (or undefined at first element if no error)
        const checkProvidersErrors = await checkIfAllProvidersAreValid(providersList, policyGroup.id)
        
        if (checkProvidersErrors.length > 0 && checkProvidersErrors[0] !== undefined) {
            return { status: false, message: checkProvidersErrors[0] }
        }

        // Begin creation / update depending on current state
        if (isNew) {
            if (!groupNameAlreadyUsed.data.result.isAlreadyUsed) {
                const policyGroupToCreate = {
                    name: values.name,
                    providers: providersList,
                    numberOfCopies: values.numberOfCopies,
                }

                // Create new policy group
                try {
                    const response = await CreateOnboardingPolicyGroup(policyGroupToCreate)

                    if (response) {
                        return { status: true, message: '' }
                    } else {
                        return { status: false, message: t('validation.onCreatePolicyGroup')}
                    }
                } catch (error) {
                    console.log(error)
                    return { status: false, message: t('validation.onCreatePolicyGroup') }
                }
            } else {
                return { status: false, message: t('validation.isNameAlreadyUsed')}
            }

        } else {
            if (values.name !== policyGroup.name) {
                if (groupNameAlreadyUsed.data.result.isAlreadyUsed) {
                    return { status: false, message: t('validation.isNameAlreadyUsed')}
                }
            }

            // Create object with all property
            const policyGroupToUpdate = {
                ...policyGroup,
                name: values.name,
                providers: providersList,
                numberOfCopies: values.numberOfCopies,
            }

            // Update policy group
            try {
                const response = await UpdateOnboardingPolicyGroup(policyGroupToUpdate)

                if (response) {
                    return { status: true, message: '' }
                } else {
                    return { status: false, message: t('validation.onUpdatePolicyGroup') }
                }
            } catch (error) {
                console.log(error)
                return { status: false, message: t('validation.onUpdatePolicyGroup') }
            }
        }
    }

    render() {
        const { t } = this.props
        const { isPremiumRequired, policyGroup, providersList, isInitOrMixGroup, isNew, isLoading, isError, policySettings } = this.state

        return (
            <Container>
                <Row className="mt-4">
                    <Col xs={12} md={12}>
                        {isInitOrMixGroup ? (
                            <h1>{t('title.initOrMixGroupEdit')}</h1>
                        ) : !isNew ? (
                            <h1>{t('title.edit')}</h1>
                        ) : (
                            <h1>{t('title.new')}</h1>
                        )}
                    </Col>
                </Row>

                {!isLoading && !isError && isPremiumRequired ? (
                    <PremiumRestrictedSection 
                        title={<Trans t={t} i18nKey="premium.title" />}
                        subtitle={<Trans t={t} i18nKey="premium.subtitle" />}
                        upgradeButtonText={<Trans t={t} i18nKey="premium.button" />}
                        backButtonText={<Trans t={t} i18nKey="premium.backButton" />}
                        backButtonUrl="../onboarding-policy"
                    />

                ) : !isLoading && !isError && !isPremiumRequired ? (
                    <Row className="mt-4">
                        <Col xs={12} md={12}>
                            <CreateOnboardingPolicyGroupForm
                                mixGroupNameTranslated={t('mixGroupName')}
                                onSubmit={this.handleValidSubmit}
                                isNew={isNew}
                                isInitOrMixGroup={isInitOrMixGroup}
                                policySettings={policySettings}
                                policyGroup={policyGroup}
                                onProviderInputChange={this.handleProviderInputChange}
                                onRemoveProvider={this.handleRemoveProvider}
                                onAddProvider={this.handleAddProvider}
                                selectedProvidersList={providersList}
                            />
                        </Col>
                    </Row>

                ) : !isLoading && isError ? (
                    <Row className="mt-4">
                        <Col xs={12} md={12}>
                            <section className="card-form mt-4">
                                {t('error.isPolicyGroupNotExistingOrNotAllowed')}
                                <br />
                                <br />
                                <Button
                                    tag={Link}
                                    to="../onboarding-policy"
                                    type="submit"
                                    color="danger"
                                    size="1x"
                                    className="me-4"
                                >
                                    <span className="as--light">
                                        {t('button.backToGroupList')}
                                    </span>
                                </Button>
                            </section>
                        </Col>
                    </Row>
                ) : (
                    <Loader />
                )}
            </Container>
        )
    }
}

export default withAuth0(
    withTranslation('CreateOnboardingPolicyGroupContainer')(CreateOnboardingPolicyGroupContainer)
)
