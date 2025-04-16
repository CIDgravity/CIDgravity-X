import React, { PureComponent } from 'react'

import { withAuth0 } from '@auth0/auth0-react'
import { Button, Row, Col } from 'reactstrap'
import { Link } from 'react-router-dom'
import { withTranslation } from 'react-i18next'

import { SESSION_STORAGE_TENANT_KEY } from 'config/constants'
import { loadFirstAvailableAddressFromJwt } from 'shared/utils/addresses'

class NotAuthorized extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            isLoading: true,
            firstAddressActorTypeForPageUrl: null,
            firstAddressId: null,
        }
    }

    async componentDidMount() {
        sessionStorage.removeItem(SESSION_STORAGE_TENANT_KEY)

        // Get JWT token
        const { getAccessTokenSilently } = this.props.auth0
        const JWTToken = await getAccessTokenSilently()

        // Load first claim address
        const firstAddressDetails = loadFirstAvailableAddressFromJwt(JWTToken)

        if (firstAddressDetails !== null) {
            const [ actorType, addressId ] = firstAddressDetails; 

            this.setState({
                firstAddressId: addressId,
                firstAddressActorTypeForPageUrl: actorType === 'storageminer' ? 
                'provider' : actorType === 'account' ? 
                'client' : null,
            })
        }

        this.setState({ isLoading: false })
    }

    render() {
        const { isLoading, firstAddressId, firstAddressActorTypeForPageUrl } = this.state
        const { t } = this.props

        return (
            <div className="container">
                <Row className="mt-4">
                    <Col xs={12} md={12}>
                        <h1>{t('title')}</h1>
                    </Col>

                    <Col xs={12} md={12}>
                        <section className="card-form mt-4">
                            {t('permissionDenied')}

                            <div className="mt-2">
                                {!isLoading && firstAddressId !== null && firstAddressActorTypeForPageUrl !== null ? (
                                    <Button tag={Link} to={`${firstAddressActorTypeForPageUrl}/${firstAddressId}`} color="danger">
                                        <span className="as--light">
                                            {t('button.back')}
                                        </span>
                                    </Button>
                                ) : !isLoading ? (
                                    <Button className="mt-2" tag={Link} to="/onboarding" color="primary">
                                        <span className="as--light">
                                            {t('button.claim')}
                                        </span>
                                    </Button>
                                ) : null}
                            </div>
                        </section>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default withAuth0(
    withTranslation('NotAuthorized')(NotAuthorized)
)