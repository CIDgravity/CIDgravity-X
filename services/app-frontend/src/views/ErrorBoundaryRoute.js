import React, { PureComponent } from 'react'

import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Link } from 'react-router'
import { withTranslation } from 'react-i18next'

class ErrorBoundaryRoute extends PureComponent {
    render() {
        const { t } = this.props

        return (
            <div className="container">
                <Row className="mt-4">
                    <Col xs={12} md={12}>
                        <h1>{t('title')}</h1>
                    </Col>

                    <Col xs={12} md={12}>
                        <section className="card-form mt-4">
                            {t('pageDoesNotExist')}
                            <br />
                            <br />
                            <Button
                                as={Link}
                                to="/"
                                type="submit"
                                variant="danger"
                                size="1x"
                                className="me-4"
                            >
                                <span className="as--light">
                                    {t('button.goToDashboard')}
                                </span>
                            </Button>
                        </section>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default withTranslation('ErrorBoundaryRoute')(ErrorBoundaryRoute)
