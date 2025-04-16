import { Trans, withTranslation } from 'react-i18next'
import { withAuth0 } from '@auth0/auth0-react'
import { faSlack } from '@fortawesome/free-brands-svg-icons'
import { faWrench, faBook } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { PureComponent } from 'react'
import { PopupModal } from 'react-calendly'
import { Button, Col, Container, Row } from 'reactstrap'
import { isMobile } from 'react-device-detect'
import { Link } from 'react-router-dom'

import { GetSelectedAddressIdFromSessionStorage, GetSelectedAddressActorTypeFromSessionStorage } from 'shared/utils/auth'

class HelpCenterContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            isOpen: false,
            selectedAddress: GetSelectedAddressIdFromSessionStorage(),
            selectedAddressActorType: GetSelectedAddressActorTypeFromSessionStorage()
        }
    }

    render() {
        const { t } = this.props
        const { selectedAddress, selectedAddressActorType } = this.state

        return (
            <Container>
                <Row className="mt-4 mb-4">
                    <Col xs={12} md={6}>
                        <h1>{t('title')}</h1>
                    </Col>
                </Row>

                <Row className="mt-4 mb-4">
                    {selectedAddress !== null && selectedAddressActorType === 'storageminer' && (
                            <Col xs="6" md="6" className="">
                                <section className="card-form">
                                    <div>
                                        <h4>
                                            <div className="d-flex flex-row">
                                                <div>
                                                    {t('diagnosis.title')}
                                                </div>
                                                <div
                                                    style={{
                                                        marginLeft: 10 + 'px',
                                                        marginBottom: 20 + 'px',
                                                    }}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faWrench}
                                                    />
                                                </div>
                                            </div>
                                        </h4>

                                        <p>
                                            <Trans
                                                t={t}
                                                i18nKey="diagnosis.description"
                                            />
                                        </p>

                                        <Button
                                            tag={Link}
                                            to={`provider/${selectedAddress}/diagnosis`}
                                            className="custom-cidg-button"
                                            size="sm"
                                        >
                                            <span className="as--light">
                                                {t(
                                                    'diagnosis.goToDiagnosisPage'
                                                )}
                                            </span>
                                        </Button>
                                    </div>
                                </section>
                            </Col>
                        )}

                    <Col xs="6" md="6">
                        <section className="card-form">
                            <div>
                                <h4>
                                    <div className="d-flex flex-row">
                                        <div>{t('docs.title')}</div>
                                        <div
                                            style={{
                                                marginLeft: 10 + 'px',
                                                marginBottom: 20 + 'px',
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faBook} />
                                        </div>
                                    </div>
                                </h4>

                                <p>
                                    <Trans t={t} i18nKey="docs.description" />
                                </p>

                                <a
                                    className="btn btn-sm custom-cidg-button"
                                    target="_blank"
                                    rel="noreferrer"
                                    href={'https://docs.cidgravity.com'}
                                >
                                    {t('docs.readDocumentation')}
                                </a>
                            </div>
                        </section>
                    </Col>
                </Row>

                <Row className="mt-4 mb-4">
                    <Col xs="12" md="4" className="me-2">
                        <section
                            className="card-form"
                            style={!isMobile ? { height: 280 + 'px' } : {}}
                        >
                            <div>
                                <h4>
                                    <div className="d-flex flex-row">
                                        <div>{t('community.title')}</div>
                                        <div
                                            style={{
                                                marginLeft: 10 + 'px',
                                                marginBottom: 20 + 'px',
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faSlack} />
                                        </div>
                                    </div>
                                </h4>
                                <p>
                                    <Trans
                                        t={t}
                                        i18nKey="community.description"
                                    />
                                </p>

                                <a
                                    className="btn btn-sm custom-cidg-button"
                                    style={{ marginTop: '1rem' }}
                                    target="_blank"
                                    rel="noreferrer"
                                    href={
                                        'https://filecoinproject.slack.com/archives/C04SCAG37FH'
                                    }
                                >
                                    {t('community.joinSlack')}
                                </a>
                            </div>
                        </section>
                    </Col>

                    <Col>
                        <section
                            className="card-form"
                            style={!isMobile ? { height: 280 + 'px' } : {}}
                        >
                            <div>
                                <h4>
                                    <div className="d-flex flex-row">
                                        <div>{t('issue.title')}</div>
                                        <div
                                            style={{
                                                marginLeft: 10 + 'px',
                                                marginBottom: 20 + 'px',
                                            }}
                                        >
                                            <i className="fab fa-github"></i>
                                        </div>
                                    </div>
                                </h4>
                                <p>
                                    <Trans
                                        t={t}
                                        i18nKey="issue.createIssueOnGithub"
                                    >
                                        {'Create an issue directly on '}
                                        <a
                                            href="https://github.com/CIDgravity/CIDgravity-X/issues"
                                            rel="noreferrer noopener"
                                            target="_blank"
                                        >
                                            Github
                                        </a>
                                    </Trans>
                                </p>
                            </div>
                        </section>
                    </Col>

                    <Col xs="12" md="4" className="ms-2">
                        <section
                            className="card-form"
                            style={!isMobile ? { height: 280 + 'px' } : {}}
                        >
                            <div>
                                <h4>
                                    <div className="d-flex flex-row">
                                        <div>{t('training.title')}</div>
                                        <div
                                            style={{
                                                marginLeft: 10 + 'px',
                                                marginBottom: 20 + 'px',
                                            }}
                                        >
                                            <i className="fa fa-calendar"></i>
                                        </div>
                                    </div>
                                </h4>
                                <p>
                                    <Trans
                                        t={t}
                                        i18nKey="training.bookCallWithExpert"
                                    />
                                    <br />
                                    <div>
                                        <Button
                                            size="sm"
                                            className="custom-cidg-button"
                                            onClick={() =>
                                                this.setState({ isOpen: true })
                                            }
                                            style={{ marginTop: '1rem' }}
                                        >
                                            {t('button.book')}
                                        </Button>
                                        <PopupModal
                                            url="https://calendly.com/juliennoel/meeting-cidgravity?hide_event_type_details=1&hide_gdpr_banner=1"
                                            text="Calendly"
                                            rootElement={document.getElementById(
                                                'root'
                                            )}
                                            onModalClose={() =>
                                                this.setState({ isOpen: false })
                                            }
                                            open={this.state.isOpen}
                                            prefill={{
                                                email: this.props.auth0.user
                                                    .email,
                                                name: this.props.auth0.user
                                                    .name,
                                                customAnswers: {
                                                    a1: t(
                                                        'training.formDefaultMessage'
                                                    ),
                                                },
                                            }}
                                        />
                                    </div>
                                </p>
                            </div>
                        </section>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default withAuth0(
    withTranslation('HelpCenterContainer')(HelpCenterContainer)
)
