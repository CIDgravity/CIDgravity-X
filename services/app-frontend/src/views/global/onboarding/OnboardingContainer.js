import React, { PureComponent } from 'react'

import { Container, Row, Col, Button } from 'reactstrap'
import { withAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'
import { Trans, withTranslation } from 'react-i18next'

class OnboardingContainer extends PureComponent {
    render() {
        const { t } = this.props

        return (
            <Container style={{ marginTop: 60 + 'px' }}>
                <Row className="mt-4 mb-4">
                    <Col xs={12} md={12}>
                        <h1>{t('title')}</h1>

                        <section className="mt-4 card-form">
                            <div>
                                <Trans t={t} i18nKey="subtitle" />

                                <ul className="mt-2">
                                    <li>
                                        <Trans
                                            t={t}
                                            i18nKey="step.joinSlackCommunity"
                                        >
                                            {
                                                "1. If it's not already done, join our "
                                            }
                                            <a
                                                href={
                                                    'https://filecoinproject.slack.com/archives/C04SCAG37FH'
                                                }
                                                rel="noopener noreferrer"
                                                target="_blank"
                                            >
                                                Slack
                                            </a>
                                        </Trans>
                                    </li>
                                    <li>{t('step.claimAddress')}</li>
                                    <li>
                                        <Trans
                                            t={t}
                                            i18nKey="step.deployTheConnector"
                                        >
                                            {'Deploy the '}
                                            <a
                                                href={
                                                    'https://github.com/CIDgravity/CIDgravity-X'
                                                }
                                                rel="noopener noreferrer"
                                                target="_blank"
                                            >
                                                CIDgravity-X connector
                                            </a>
                                            {' on the miner.'}
                                        </Trans>
                                    </li>
                                    <li>{t('step.testConnectivity')}</li>
                                </ul>
                            </div>

                            <Button
                                tag={Link}
                                className="mt-4 custom-cidg-button"
                                to="/wizard"
                                size="1x"
                            >
                                <span className="as--light">
                                    {t('button.next')}
                                </span>
                            </Button>
                        </section>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default withAuth0(
    withTranslation('OnboardingContainer')(OnboardingContainer)
)
