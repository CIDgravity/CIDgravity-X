import React from 'react'
import { Col, Row, Button } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'

import { UPGRADE_PAGE_LINK } from 'config/constants'

const PremiumRestrictedSection = ({ 
    title= "Premium content", 
    subtitle="Feature is accessible only to enterprise client", 
    upgradeButtonText = null,
    backButtonText = null,
    backButtonUrl = null
}) => (
    <Row className="mt-4">
        <Col xs="12" md="12">
            <div className="card p-4 premium-message-section">
                <h4>{title}</h4>
                <p className="mt-2">{subtitle}</p>

                {(upgradeButtonText || backButtonText) && (
                    <Row>
                        <Col>
                            {upgradeButtonText && (
                                <a className="btn custom-cidg-premium-button mt-2" target="_blank" rel="noreferrer" href={UPGRADE_PAGE_LINK}>
                                    <FontAwesomeIcon icon={faLock} />
                                    <span className="p-4">
                                        {upgradeButtonText}
                                    </span>
                                </a>
                            )}

                            {backButtonText && backButtonUrl && (
                                <Button tag={Link} to={backButtonUrl} size="1x" className="ms-4 btn custom-cidg-button mt-2">
                                    <span className="p-2 as--light">
                                        {backButtonText}
                                    </span>
                                </Button>
                            )}
                        </Col>
                    </Row>
                )}
            </div>
        </Col>
    </Row>
)

export default PremiumRestrictedSection