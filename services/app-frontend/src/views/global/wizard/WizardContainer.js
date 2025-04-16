import React, { useEffect, useState } from 'react'
import { Container, Row, Col } from 'reactstrap'
import { Steps } from 'antd'
import { useTranslation } from 'react-i18next'

import { CompleteMinerAlreadyExists } from 'shared/services/wizard'
import { shortenAddress } from 'shared/utils/filecoinUtil'
import { WizardClaimAddressContainer } from './WizardClaimAddressContainer'
import { WizardClaimAddressStep } from './steps/WizardClaimAddressStep'
import { WizardSignMessageStep } from './steps/WizardSignMessageStep'
import { WizardFriendlyNameClientStep } from './steps/WizardFriendlyNameClientStep'
import { WizardFriendlyNameProviderStep } from './steps/WizardFriendlyNameProviderStep'
import { WizardImportDataStep } from './steps/WizardImportDataStep'
import { WizardSettingsStep } from './steps/WizardSettingsStep'
import { WizardClientInformationsStep } from './steps/WizardClientInformationsStep'
import { WizardProviderInformationStep } from './steps/WizardProviderInformationStep'
import { WizardEndPage } from './WizardEndPage'
import { loadAddressesFromJwt } from 'shared/utils/addresses'
import { useAuth0 } from '@auth0/auth0-react'

const { Step } = Steps

export function WizardContainer() {
    const [address, setAddress] = useState(undefined)
    const [shortAddressId, setShortAddressId] = useState(undefined)
    const [actorType, setActorType] = useState(undefined)
    const [hexMessage, setHexMessage] = useState(undefined)
    const [signedMessage, setSignedMessage] = useState(undefined)
    const [claimedInfo, setClaimedInfo] = useState(undefined)
    const [currentForm, setCurrentForm] = useState(0)
    const [steps, setSteps] = useState([])
    const [miners, setMiners] = useState([])
    const [token, setToken] = useState(undefined)
    const [error, setError] = useState(undefined)

    const { getAccessTokenSilently } = useAuth0()
    const { t } = useTranslation('WizardContainer') // second param ignored i18n

    useEffect(() => {
        if (actorType === 'storageminer') {
            getAccessTokenSilently().then((JWTToken) => {
                loadAddressesFromJwt(JWTToken, false, true).then((res) => {
                    const [, providerAddresses] = res

                    if (providerAddresses) {
                        setMiners(providerAddresses.filter((address) => address.actorType === 'storageminer'))
                    }
                }).catch((_) => {})
            }).catch((_) => {})
        }

        if (!signedMessage) return

        if (claimedInfo) {
            CompleteMinerAlreadyExists({
                signature: {
                    address: address,
                    hexMsg: hexMessage,
                    signedMessage: signedMessage,
                    friendlyName: claimedInfo.friendlyName,
                },
            })
                .then((res) => {
                    setShortAddressId(res.data.addressId)
                    setCurrentForm(3)
                })
                .catch((err) => {
                    console.error('Error while submitting the form (CompleteMinerAlreadyExists)', err)
                    setError(err)
                })
        } else if (actorType === 'storageminer') {
            if (miners.length === 0) {
                setSteps([
                    WizardProviderInformationStep(t('step.providerInformation')),
                    WizardFriendlyNameProviderStep(t('step.friendlyName')), 
                    WizardSettingsStep(t('step.settings'))
                ])
            } else {
                setSteps([
                    WizardProviderInformationStep(t('step.providerInformation')),
                    WizardFriendlyNameProviderStep(t('step.friendlyName')),
                    WizardImportDataStep(t('step.importClientsAndPricing')),
                    WizardSettingsStep(t('step.settings')),
                ])
            }
        } else if (actorType === 'account') {
            setSteps([
                WizardFriendlyNameClientStep(t('step.friendlyName')), 
                WizardClientInformationsStep(t('step.clientInformation'))
            ])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actorType, signedMessage, claimedInfo])

    return (
        <Container className="mt-4">
            <Row className="mt-4">
                <Col xs={10} md={10}>
                    <h1>
                        {t('title', {
                            address: address ? ' - ' + shortenAddress(address) : '',
                        })}
                    </h1>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col xs={12} md={12}>
                    {currentForm === 0 ? (
                        <>
                            <div className="mb-4">
                                <Steps progressDot current={0}>
                                    <Step title={t('step.start')} key="1" />
                                    <Step title={t('step.signMessage')} key="2" />
                                </Steps>
                            </div>

                            <WizardClaimAddressStep
                                setAddress={setAddress}
                                address={address}
                                setActorType={setActorType}
                                currentForm={currentForm}
                                setCurrentForm={setCurrentForm}
                            />
                        </>
                    ) : currentForm === 1 ? (
                        <>
                            <div className="mb-4">
                                <Steps progressDot current={1}>
                                    <Step title={t('step.start')} key="1" />
                                    <Step title={t('step.signMessage')} key="2" />
                                </Steps>
                            </div>

                            <WizardSignMessageStep
                                address={address}
                                setAddress={setAddress}
                                hexMessage={hexMessage}
                                setHexMessage={setHexMessage}
                                setSignedMessage={setSignedMessage}
                                signedMessage={signedMessage}
                                currentForm={currentForm}
                                setCurrentForm={setCurrentForm}
                                setClaimedInfo={setClaimedInfo}
                                err={error}
                                setErr={setError}
                            />
                        </>
                    ) : currentForm === 2 ? (
                        <WizardClaimAddressContainer
                            address={address}
                            signedMessage={signedMessage}
                            actorType={actorType}
                            steps={steps}
                            currentForm={currentForm}
                            setCurrentForm={setCurrentForm}
                            setToken={setToken}
                            setShortAddressId={setShortAddressId}
                        />
                    ) : (
                        <>
                            <div className="mb-4">
                                {steps.length === 2 ? (
                                    <Steps progressDot current={3}>
                                        <Step title={t('step.providerInformation')} key="1" />
                                        <Step title={t('step.friendlyName')} key="2" />
                                        <Step title={t('step.settings')} key="3" />
                                        <Step title={t('step.complete')} key="4" />
                                    </Steps>

                                ) : steps.length === 3 ? (
                                    <Steps progressDot current={3}>
                                        <Step title={t('step.providerInformation')} key="1" />
                                        <Step title={t('step.friendlyName')} key="2" />
                                        <Step title={t('step.settings')} key="3" />
                                        <Step title={t('step.importClientsAndPricing')} key="4" />
                                        <Step title={t('step.complete')} key="5" />
                                    </Steps>

                                ) : (
                                    <Steps progressDot current={2}>
                                        <Step title={t('step.start')} key="1" />
                                        <Step title={t('step.signMessage')} key="2" />
                                        <Step title={t('step.complete')} key="3" />
                                    </Steps>
                                )}
                            </div>

                            <WizardEndPage
                                address={address}
                                actorType={actorType}
                                token={token}
                                shortAddressId={shortAddressId}
                                minerAlreadyClaimed={!!claimedInfo}
                            />
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    )
}
