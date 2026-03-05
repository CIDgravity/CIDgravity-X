import React, { useEffect, useState } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
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

export function WizardContainer() {
    const [address, setAddress] = useState(undefined)
    const [shortAddressId, setShortAddressId] = useState(undefined)
    const [actorType, setActorType] = useState(undefined)
    const [generatedChallenge, setGeneratedChallenge] = useState(undefined)
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
                    challenge: generatedChallenge,
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
                                <Steps current={0} items={[
                                    { title: t('step.start') },
                                    { title: t('step.signMessage') },
                                ]} />
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
                                <Steps current={1} items={[
                                    { title: t('step.start') },
                                    { title: t('step.signMessage') },
                                ]} />
                            </div>

                            <WizardSignMessageStep
                                address={address}
                                setAddress={setAddress}
                                generatedChallenge={generatedChallenge}
                                setGeneratedChallenge={setGeneratedChallenge}
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
                            generatedChallenge={generatedChallenge}
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
                                    <Steps current={3} items={[
                                        { title: t('step.providerInformation') },
                                        { title: t('step.friendlyName') },
                                        { title: t('step.settings') },
                                        { title: t('step.complete') },
                                    ]} />

                                ) : steps.length === 3 ? (
                                    <Steps current={3} items={[
                                        { title: t('step.providerInformation') },
                                        { title: t('step.friendlyName') },
                                        { title: t('step.settings') },
                                        { title: t('step.importClientsAndPricing') },
                                        { title: t('step.complete') },
                                    ]} />

                                ) : (
                                    <Steps current={2} items={[
                                        { title: t('step.start') },
                                        { title: t('step.signMessage') },
                                        { title: t('step.complete') },
                                    ]} />
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
