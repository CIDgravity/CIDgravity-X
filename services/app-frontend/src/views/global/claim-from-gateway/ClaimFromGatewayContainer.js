import React, { useState, useCallback } from 'react'
import { withAuth0 } from '@auth0/auth0-react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import { Loader } from 'shared/components'
import { Trans, withTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { LinkGatewayAddressToUser } from 'shared/services/claim-gateway'
import { HasAccessToAddress } from 'shared/services/addresses_claim'

const ClaimFromGatewayContainer = ({ t }) => {
    const { signedMessage } = useParams()

    const [isLoading, setIsLoading] = useState(false)
    const [claimedAddress, setClaimedAddress] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [confirmed, setConfirmed] = useState(false)
    const navigate = useNavigate()

    const translateErrorMessage = useCallback((originalErrorMessage) => {
        switch (originalErrorMessage) {
            case 'challenge not found':
                return 'error.challengeNotFound'
            case 'you have already claimed this address':
                return 'error.alreadyClaimed'
            case 'address limit reached':
                return 'error.limitReached'
            default:
                return 'error.somethingWrong'
        }
    }, [])

    const handleConfirm = async () => {
        setIsLoading(true)
        setErrorMessage(null)
        try {
            const response = await LinkGatewayAddressToUser(signedMessage)
            if (response) {
                setClaimedAddress(response.data.address)
                setConfirmed(true)
            }
        } catch (error) {
            console.error(error)
            setErrorMessage(error?.response?.data?.error || 'unknown error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoToDashboard = () => {
        if (!claimedAddress) return
        HasAccessToAddress(claimedAddress)
            .then(() => {
                navigate(`/client/${claimedAddress}`)
            })
            .catch(() => {
                setErrorMessage('error.somethingWrong')
            })
    }

    return (
        <Container>
            {isLoading ? (
                <>
                    <Row className="mt-4 mb-4">
                        <Col xs={12}>
                            <h1>{t('header.loadingOrError')}</h1>
                        </Col>
                    </Row>
                    <Row className="mt-4 mb-4">
                        <Col xs={12}>
                            <Loader />
                        </Col>
                    </Row>
                </>
            ) : confirmed ? (
                <>
                    <Row className="mt-4 mb-4">
                        <Col xs={12}>
                            <h1>{t('header.success', { address: claimedAddress })}</h1>
                            <p>{t('body.success')}</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <Button onClick={handleGoToDashboard} className="mt-2 custom-cidg-button">
                                <span className="as--light">
                                    {t('button.goToDashboard')}
                                </span>
                            </Button>
                        </Col>
                    </Row>
                </>
            ) : errorMessage ? (
                <>
                    <Row className="mt-4">
                        <Col xs={12}>
                            <h1>{t('header.loadingOrError')}</h1>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col xs={12}>
                            <div className="alert alert-danger" role="alert" style={{ marginTop: '50px' }}>
                                <Trans t={t} i18nKey={translateErrorMessage(errorMessage)} />
                            </div>
                        </Col>
                    </Row>
                </>
            ) : (
                <>
                    <Row className="mt-4 mb-4">
                        <Col xs={12}>
                            <h1>{t('header.loadingOrError')}</h1>
                            <p>{t('body.confirmClaimDescription')}</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <Button onClick={handleConfirm} variant="primary" className="custom-cidg-button">
                                {t('button.confirmConnect')}
                            </Button>
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    )
}

export default withAuth0(
    withTranslation('ClaimFromGatewayContainer')(ClaimFromGatewayContainer)
)
