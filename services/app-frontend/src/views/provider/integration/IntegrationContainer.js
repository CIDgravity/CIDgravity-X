import { withAuth0 } from '@auth0/auth0-react'
import { PureComponent } from 'react'
import { withTranslation } from 'react-i18next'
import { Col, Container, Row } from 'reactstrap'

import moment from 'moment'

import { Loader } from 'shared/components'
import { LoadConnectedIntegrations } from 'shared/services/integration'

class IntegrationContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.datetimeFormat = 'YYYY/MM/DD HH:mm:ss'

        this.state = {
            selectedMiner: null,
            isLoading: true,
            isError: false,
            integrations: [],
            displayMoreDetailsFor: null,
        }
    }

    componentDidMount() {
        this.setState({ selectedMiner: this.props.match.params.minerId })
        this.loadConnectedIntegrations()
    }

    displayMoreDetails = (detailsName) => {
        this.setState({ displayMoreDetailsFor: detailsName })
    }

    loadConnectedIntegrations = async () => {
        try {
            const integrations = await LoadConnectedIntegrations()

            this.setState({
                integrations: integrations.data,
                isLoading: false,
            })
        } catch (error) {
            this.setState({ error: true, isLoading: false })
        }
    }

    calculateTimeSinceUnsync = (value) => {
        const diff = moment.duration(moment().diff(value))

        // Convert in days, if > 0 display, otherwise convert in hours
        if (diff.asDays() > 1) {
            return Math.trunc(diff.asDays()) + ' days ago'
        }

        if (diff.asHours() > 1) {
            return Math.trunc(diff.asHours()) + ' hours ago'
        }

        if (diff.asMinutes() > 1) {
            return Math.trunc(diff.asMinutes()) + ' minutes ago'
        }

        if (diff.asSeconds() > 1) {
            return Math.trunc(diff.asSeconds()) + ' seconds ago'
        }
    }

    disconnectIntegration = async (integrationName) => {
        console.log('Not implemented yet (no more integration)')
    }

    render() {
        const { isLoading, isError, displayMoreDetailsFor } = this.state
        const { t } = this.props

        return (
            <Container>
                <Row className="mt-4 mb-4">
                    <Col xs={12} md={6}>
                        <h1>{t('title')}</h1>
                        <p>{t('subtitle')}</p>
                    </Col>
                </Row>

                {isLoading ? (
                    <Loader />
                ) : !isError ? (
                    <Row id="dealProposalsStats" className="mt-4">
                        Integrations
                    </Row>
                ) : (
                    <div
                        className="alert alert-danger"
                        role="alert"
                        style={{ marginTop: '50px' }}
                    >
                        {t('error.generic')}
                    </div>
                )}
            </Container>
        )
    }
}

export default withAuth0(
    withTranslation('IntegrationContainer')(IntegrationContainer)
)
