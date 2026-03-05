import React, { PureComponent } from 'react'

import Alert from 'react-bootstrap/Alert'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { withAuth0 } from '@auth0/auth0-react'
import { Loader } from 'shared/components'

import {  GetCurrentClientAddress,  UpdateClientInformations } from 'shared/services/cidg-services/client-backend/address'

import { toast } from 'react-toastify'
import { withTranslation } from 'react-i18next'

import ClientInformationForm from './ClientInformationForm'

class ClientInformationContainer extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            isError: false,
            currentAddress: {
                address: '',
                actorType: '',
                friendlyName: '',
                createdOn: '',
                information: {
                    addressId: '',
                    contactEmail: '',
                    contactFullName: '',
                    contactSlack: '',
                    datacapRequestLink: '',
                    entityCountry: '',
                    entityName: '',
                    entityType: '',
                    entityWebsite: ''
                }
            }
        }
    }

    async componentDidMount() {
        await this.loadCurrentClientAddress()
    }

    loadCurrentClientAddress = async () => {
        try {
            const response = await GetCurrentClientAddress()

            if (response.data) {
                this.setState({ isLoading: false, currentAddress: response.data.result })
            }
        } catch (error) {
            this.setState({ isLoading: false, isError: true })
            console.error(error)
        }
    }

    handleSubmitClientInformations = async values => {
        const { t } = this.props

        try {
            const response = await UpdateClientInformations(values)

            if (response.status === 200) {
                toast.success(t('notification.success.isClientInformationsUpdated'))
            }

        } catch (error) {
            toast.error(t('notification.error.isClientInformationsFailed'))
            console.error(error)
        }
    }

    render() {
        const { isLoading, currentAddress } = this.state
        const { t } = this.props

        return (
            <Container className="informations-container">
                <Row className="mt-4 mb-4">
                    <Col xs={12} md={12}>
                        <h1>{t('title')}</h1>
                        <p>{t('subtitle')}</p>

                        <Alert variant="warning" className="mt-4">
                            <strong>
                                <i className="fas fa-exclamation-triangle" />{' '}
                                {t('beCareful')}
                            </strong>{' '}

                            {t('subtitleKYC')}
                        </Alert>
                    </Col>
                </Row>

                {isLoading ? (
                    <Loader />

                ) : currentAddress ? (
                    <ClientInformationForm
                        currentAddress={currentAddress}
                        onSubmit={this.handleSubmitClientInformations}
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
    withTranslation('ClientInformationsContainer')(ClientInformationContainer)
)
