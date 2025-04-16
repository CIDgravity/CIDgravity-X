import React, { PureComponent } from 'react'

import { Alert, Container, Row, Col } from 'reactstrap'
import { withAuth0 } from '@auth0/auth0-react'
import { Loader } from 'shared/components'

import { GetCurrentAddress, UpdateAddressInformation } from 'shared/services/addresses_claim'

import { toast } from 'react-toastify'
import { withTranslation } from 'react-i18next'

import ProviderInformationForm from './ProviderInformationForm'

class ProviderInformationContainer extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            isError: false,
            currentProviderBio: null,
            currentAddress: {
                addressId: '',
                address: '',
                actorType: '',
                friendlyName: '',
                claimedOn: '',
                information: {
                    addressId: '',
                    contactEmail: '',
                    contactFullName: '',
                    contactSlack: '',
                    entityCountry: '',
                    entityName: '',
                    entityType: '',
                    entityWebsite: '',
                    providerBio: ''
                }
            }
        }
    }

    async componentDidMount() {
        await this.loadCurrentProviderAddress()
    }

    loadCurrentProviderAddress = async () => {
        try {
            const response = await GetCurrentAddress()

            if (response.data) {
                this.setState({ 
                    isLoading: false, 
                    currentAddress: response.data,
                    currentProviderBio: response.data.information.providerBio
                })
            }
        } catch (error) {
            this.setState({ isLoading: false, isError: true })
            console.error(error)
        }
    }

    handleSubmitInformation = async values => {
        const { t } = this.props
        const { currentProviderBio } = this.state;

        try {
            const data = {
                ...values,
                providerBio: currentProviderBio
            }

            const response = await UpdateAddressInformation(data)

            if (response.status === 200) {
                toast.success(t('notification.success.isProviderInformationUpdated'))
            }

        } catch (error) {
            toast.error(t('notification.error.isProviderInformationFailed'))
            console.error(error)
        }
    }

    handleProviderBioChange = ({ html, text }) => {
        this.setState({ currentProviderBio: text })
    }

    render() {
        const { isLoading, currentAddress, currentProviderBio } = this.state
        const { t } = this.props

        return (
            <Container className="informations-container">
                <Row className="mt-4 mb-4">
                    <Col xs={12} md={12}>
                        <h1>{t('title')}</h1>
                        <p>{t('subtitle')}</p>

                        <Alert color="warning" className="mt-4">
                            <strong>
                                <i class="fas fa-exclamation-triangle" />{' '}
                                {t('beCareful')}
                            </strong>{' '}

                            {t('subtitleKYC')}
                        </Alert>
                    </Col>
                </Row>

                {isLoading ? (
                    <Loader />

                ) : currentAddress ? (
                    <ProviderInformationForm
                        currentAddress={currentAddress}
                        onSubmit={this.handleSubmitInformation}
                        providerBioChange={this.handleProviderBioChange}
                        currentProviderBio={currentProviderBio}
                    />

                ) : (
                    <div className="alert alert-danger" role="alert" style={{ marginTop: '50px' }}>
                        {t('error.generic')}
                    </div>
                )}
            </Container>
        )
    }
}

export default withAuth0(
    withTranslation('ProviderInformationContainer')(ProviderInformationContainer)
)
