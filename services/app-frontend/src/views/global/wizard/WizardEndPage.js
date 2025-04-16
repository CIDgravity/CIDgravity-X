import React, { useState } from 'react'
import { Button, Col, Row } from 'reactstrap'
import { useHistory } from 'react-router-dom'
import { CustomCodeHighlight } from 'shared/components/CustomCodeHighlight'
import { FaCheckCircle, FaRegCircle } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

import { HasAccessToAddress } from 'shared/services/addresses_claim'

import { shortenAddress } from 'shared/utils/filecoinUtil'

export function WizardEndPage({
    address,
    actorType,
    token,
    shortAddressId,
    minerAlreadyClaimed,
}) {
    const { t } = useTranslation('WizardEndPage') // second param ignored i18n

    const [completedStep2, setCompletedStep2] = useState(false)
    const history = useHistory()

    if (minerAlreadyClaimed) {
        return (
            <section className="card-form">
                <div className="text-center">
                    <i className="fas fa-check-circle fa-2x mb-4 text-success" />
                    <h4>
                        {t('minerAlreadyClaimed.title', { address: shortenAddress(address) })}
                    </h4>

                    {actorType === 'account' ? (
                        <Button
                            onClick={() => {
                                HasAccessToAddress(shortAddressId)
                                .then(() => {
                                    history.push(`/client/${shortAddressId}`)
                                })
                            }}
                            size="1x"
                            className="mt-2 custom-cidg-button"
                        >
                            <span className="as--light">
                                {t('button.goToDashboard')}
                            </span>
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                HasAccessToAddress(shortAddressId)
                                .then(() => {
                                    history.push(`/provider/${shortAddressId}/diagnosis`)
                                })
                            }}
                            size="1x"
                            className="mt-2 custom-cidg-button"
                        >
                            <span className="as--light">
                                {t('button.testConnectivity')}
                            </span>
                        </Button>
                    )}
                </div>
            </section>
        )
    }
    
    return (
        <section className="card-form mt-4">
            {actorType === 'storageminer' ? (
                <>
                    <div className="text-center mb-4">
                        <i className="fas fa-check-circle fa-2x mb-4 text-success" />
                        <h4 className="alert-heading">{t('wizardComplete.title')}</h4>
                    </div>

                    <Col>
                        <Row className="align-items-center justify-content-center">
                            <Col md={1} xs={1} className="text-end">
                                <h5>
                                    <FaCheckCircle className="text-success" />
                                </h5>
                            </Col>
                            <Col md={7} xs={7}>
                                <h5>{t('wizardComplete.stepClaimAddress')}</h5>
                            </Col>
                        </Row>

                        <Row className="align-items-center justify-content-center">
                            <Col md={1} xs={1} className="text-end">
                                <h5>
                                    {completedStep2 ? (
                                        <FaCheckCircle className="text-success" />
                                    ) : (
                                        <FaRegCircle color="grey" />
                                    )}
                                </h5>
                            </Col>
                            <Col md={7} xs={7}>
                                <h5>
                                    {t('wizardComplete.stepDeployConnector')}
                                </h5>
                            </Col>
                        </Row>

                        <Row className="align-items-center justify-content-center">
                            <Col md={1} xs={1} />
                            <Col md={7} xs={7}>
                                <p>
                                    {t(
                                        'wizardComplete.connectorTokenExplanation'
                                    )}
                                    <CustomCodeHighlight text={token} />
                                </p>
                            </Col>
                        </Row>

                        <div style={{ display: 'flex' }} className="justify-content-center">
                            {completedStep2 ? (
                                <div style={{ display: 'flex' }} className="flex-row">
                                    <div className="ms-2">
                                        <Button
                                            onClick={() => {
                                                HasAccessToAddress(shortAddressId)
                                                .then(() => {
                                                    history.push(`/provider/${shortAddressId}`)
                                                })
                                            }}
                                            size="1x"
                                            className="mt-2 custom-cidg-button"
                                        >
                                            <span className="as--light">
                                                {t('button.goToDashboard')}
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    onClick={() => { 
                                        window.open('https://github.com/CIDgravity/CIDgravity-X')
                                        setCompletedStep2(true)
                                    }}
                                    size="1x"
                                    className="mt-2 custom-cidg-button"
                                >
                                    {t('button.deployConnector')}
                                </Button>
                            )}
                        </div>
                    </Col>
                </>
            ) : (
                <div className="text-center">
                    <i className="fas fa-check-circle fa-2x mb-4 text-success" />
                    <h4>
                        {t('clientClaimed.title', { address: shortenAddress(address) })}
                    </h4>

                    <Button
                        onClick={() => {
                            HasAccessToAddress(shortAddressId)
                            .then(() => {
                                history.push(`/client/${shortAddressId}`)
                            })
                        }}
                        size="1x"
                        className="mt-2 custom-cidg-button"
                    >
                        <span className="as--light">
                            {t('button.goToDashboard')}
                        </span>
                    </Button>
                </div>
            )}
        </section>
    )
}
