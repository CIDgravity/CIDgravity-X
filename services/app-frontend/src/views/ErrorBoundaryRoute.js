import React, { PureComponent } from 'react'

import { Button, Row, Col } from 'reactstrap'
import { Link } from 'react-router-dom'
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
                                tag={Link}
                                to="/"
                                type="submit"
                                color="danger"
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
