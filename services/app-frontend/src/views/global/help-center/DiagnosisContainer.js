import React, { PureComponent } from 'react'

import { isBrowser } from 'react-device-detect'
import { withAuth0 } from '@auth0/auth0-react'
import { Button, Col, Row, Alert } from 'reactstrap'
import { Trans, withTranslation } from 'react-i18next'
import {
    SendProposalTest,
    CheckForTestResponseAvailable,
    GenerateErrorCodesFromCheckResult,
    GenerateErrorCodesFromUriParam,
    CheckErrorCodeHandled,
} from 'shared/services/cidg-services/miner-status-checker'

import Loader from 'shared/components/Loader'
import { CustomCodeHighlight } from 'shared/components/CustomCodeHighlight'
import { GetSelectedAddressIdFromSessionStorage } from 'shared/utils/auth'

class DiagnosisContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            selectedAddress: GetSelectedAddressIdFromSessionStorage(),
            isError: false,
            isLoading: false,
            testProposalSent: false,
            verificationStep: 1,
            sendTestResults: {
                boostResponse: {
                    reason: '',
                    message: '',
                },
                checkId: '',
            },
            receiveTestResults: {
                id: '',
                checkId: '',
                isAvailable: false,
                sentOn: '',
                receivedOn: '',
                minerStats: null,
                errorRawProposal: null,
                proposalVersion: '',
                agent: '',
                errorCode: '',
                connectorVersion: '',
            },
            testResultsAsErrorCodes: [],
            errorCodeSimulated: null,
        }
    }

    /* For easier translating, we create a url to simulate error code /*
    /* We will pass a number in param to match a specific code */
    async componentDidMount() {
        if (this.props.match.params.errorCode !== undefined) {
            this.setState({
                errorCodeSimulated: GenerateErrorCodesFromUriParam(
                    this.props.match.params.errorCode
                ),
            })
        }
    }

    sendConnectivityTest = async () => {
        this.setState({
            isLoading: true,
            isError: false,
            testProposalSent: true,
            testResultsAsErrorCodes: [],
        })

        // Send the proposal and launch the checking process right after
        // If an error code is set as checkTestResults param, it means this code will be displayed (simulation for debug)
        SendProposalTest()
            .then((res) => {
                this.setState({ sendTestResults: res.data })

                // For this function, if we want to simulate a specific code (translation or something else)
                // We can use parameters (by default the test results will be used)
                // first param = isAvailable (true / false), second param is the status code returned by backend
                // this.checkTestResults(false, 'ERR_DEAL_PROTOCOL_UNSUPPORTED')
                this.checkTestResults()
            })
            .catch((err) => {
                this.setState({ isLoading: false, isError: true })
            })
    }

    checkTestResults = async () => {
        let numberTries = 0
        const { sendTestResults, errorCodeSimulated } = this.state

        const interval = setInterval(() => {
            CheckForTestResponseAvailable(sendTestResults.checkId)
                .then((res) => {
                    if (res.status === 204) {
                        this.setState({ verificationStep: numberTries })
                        numberTries++

                        // Wait for 6 retries = 30 seconds
                        if (numberTries > 6) {
                            this.setState({
                                receiveTestResults: {
                                    isAvailable: false,
                                    errorCode:
                                        'ERR_CIDGRAVITY_CONNECTOR_MISCONFIGURED',
                                    agent: '',
                                    connectorVersion: '',
                                },
                                testResultsAsErrorCodes:
                                    GenerateErrorCodesFromCheckResult(
                                        'ERR_CIDGRAVITY_CONNECTOR_MISCONFIGURED'
                                    ),
                                isLoading: false,
                                verificationStep: 1,
                            })

                            clearInterval(interval)
                        }
                    } else if (res.status === 200) {
                        // If miner is not available, check if errorCode returned is part of errorCodeArray
                        // If not, build a generic results (error related to CIDgravity side)
                        // otherwise if miner is available, display a green check on every step
                        if (res.data.status === 'available') {
                            this.setState({
                                receiveTestResults: {
                                    isAvailable: errorCodeSimulated
                                        ? false
                                        : true,
                                    errorCode: errorCodeSimulated
                                        ? errorCodeSimulated
                                        : '',
                                    agent: res.data.agent,
                                    connectorVersion: res.data.connectorVersion,
                                },
                                testResultsAsErrorCodes:
                                    GenerateErrorCodesFromCheckResult(
                                        errorCodeSimulated
                                            ? errorCodeSimulated
                                            : 'DIAGNOSIS_SUCCESS'
                                    ),
                                isLoading: false,
                                verificationStep: 1,
                            })
                        } else {
                            if (CheckErrorCodeHandled(res.data.errorCode)) {
                                this.setState({
                                    receiveTestResults: {
                                        isAvailable: errorCodeSimulated
                                            ? false
                                            : res.data.isAvailable,
                                        errorCode: errorCodeSimulated
                                            ? errorCodeSimulated
                                            : res.data.errorCode,
                                        agent: res.data.agent,
                                        connectorVersion:
                                            res.data.connectorVersion,
                                    },
                                    testResultsAsErrorCodes:
                                        GenerateErrorCodesFromCheckResult(
                                            errorCodeSimulated
                                                ? errorCodeSimulated
                                                : res.data.errorCode
                                        ),
                                    isLoading: false,
                                    verificationStep: 1,
                                })
                            } else {
                                this.setState({
                                    receiveTestResults: {
                                        isAvailable: false,
                                        errorCode: 'ERR_CIDGRAVITY_SIDE',
                                        agent: '',
                                        connectorVersion: '',
                                    },
                                    testResultsAsErrorCodes:
                                        GenerateErrorCodesFromCheckResult(
                                            'ERR_CIDGRAVITY_SIDE'
                                        ),
                                    isLoading: false,
                                    verificationStep: 1,
                                })
                            }
                        }

                        clearInterval(interval)
                    }
                })
                .catch((err) => {
                    this.setState({
                        isLoading: false,
                        isError: true,
                        verificationStep: 1,
                    })
                })
        }, 5000)
    }

    render() {
        const { t } = this.props
        const {
            isLoading,
            isError,
            receiveTestResults,
            sendTestResults,
            testProposalSent,
            verificationStep,
            testResultsAsErrorCodes,
            selectedAddress,
        } = this.state

        return (
            <div className="container">
                <Row className="mt-4">
                    <Col xs={12} md={7}>
                        <h1>{t('title')}</h1>
                        <p>
                            <Trans t={t} i18nKey="subtitle" />
                        </p>
                    </Col>

                    {isBrowser && (
                        <Col xs={6} md={5}>
                            <div className="text-end">
                                <Button
                                    disabled={isLoading}
                                    onClick={this.sendConnectivityTest}
                                    size="1x"
                                    className="me-2 custom-cidg-button"
                                >
                                    <span className="as--light">
                                        {t('button.sendTest')}
                                    </span>
                                </Button>
                            </div>
                        </Col>
                    )}
                </Row>

                <Row className="mt-4">
                    <Col xs={'12'} md={'12'}>
                        <section className="card-form">
                            {testProposalSent && isLoading ? (
                                <Row className="p-4">
                                    <Col
                                        xs={12}
                                        md={12}
                                        className="text-center"
                                    >
                                        <Loader />
                                        <h5 className="mt-2">
                                            {verificationStep <= 1
                                                ? t('step.sendingProposal')
                                                : t('step.checkingResults', {
                                                      step: verificationStep,
                                                  })}
                                        </h5>
                                    </Col>
                                </Row>
                            ) : testProposalSent && !isLoading && !isError ? (
                                <Row className="p-4 diag-results">
                                    <Col xs={12} md={12}>
                                        <Row>
                                            <Col>
                                                {testResultsAsErrorCodes.length >
                                                    0 && (
                                                    <table className="table diag-results">
                                                        <tbody>
                                                            {testResultsAsErrorCodes.map(
                                                                (errorCode) => (
                                                                    <tr>
                                                                        <td>
                                                                            {t(
                                                                                `errorCode.${errorCode.code}.name`,
                                                                                {
                                                                                    minerID:
                                                                                        selectedAddress,
                                                                                    nodeType:
                                                                                        receiveTestResults?.agent,
                                                                                    connectorVersion:
                                                                                        receiveTestResults?.connectorVersion,
                                                                                    multiaddresses:
                                                                                        sendTestResults
                                                                                            ?.boostResponse
                                                                                            ?.multiaddresses
                                                                                            ?.length >
                                                                                        1
                                                                                            ? sendTestResults?.boostResponse?.multiaddresses.join(
                                                                                                  ' , '
                                                                                              )
                                                                                            : sendTestResults
                                                                                                  ?.boostResponse
                                                                                                  ?.multiaddresses
                                                                                                  ?.length ===
                                                                                              1
                                                                                            ? sendTestResults
                                                                                                  ?.boostResponse
                                                                                                  ?.multiaddresses[0]
                                                                                            : '',
                                                                                    peerId: sendTestResults
                                                                                        ?.boostResponse
                                                                                        ?.peerId,
                                                                                    getAskPricePerGib:
                                                                                        sendTestResults
                                                                                            ?.boostResponse
                                                                                            ?.getAskPricePerGib,
                                                                                    getAskVerifiedPricePerGib:
                                                                                        sendTestResults
                                                                                            ?.boostResponse
                                                                                            ?.getAskVerifiedPricePerGib,
                                                                                    getAskMinPieceSize:
                                                                                        sendTestResults
                                                                                            ?.boostResponse
                                                                                            ?.getAskMinPieceSize,
                                                                                    getAskMaxPieceSize:
                                                                                        sendTestResults
                                                                                            ?.boostResponse
                                                                                            ?.getAskMaxPieceSize,
                                                                                    getAskSectorSize:
                                                                                        sendTestResults
                                                                                            ?.boostResponse
                                                                                            ?.getAskSectorSize,
                                                                                    dealProtocolsSupported:
                                                                                        sendTestResults
                                                                                            ?.boostResponse
                                                                                            ?.dealProtocolsSupported,
                                                                                }
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            {errorCode.status ===
                                                                            'passed' ? (
                                                                                <i
                                                                                    className="fa fa-check-circle fa-1x"
                                                                                    style={{
                                                                                        color: 'green',
                                                                                    }}
                                                                                ></i>
                                                                            ) : errorCode.status ===
                                                                              'failed' ? (
                                                                                <i
                                                                                    className="fa fa-exclamation-circle fa-1x"
                                                                                    style={{
                                                                                        color: 'red',
                                                                                    }}
                                                                                ></i>
                                                                            ) : (
                                                                                <i
                                                                                    className="fa fa-exclamation-circle fa-1x"
                                                                                    style={{
                                                                                        color: 'blue',
                                                                                    }}
                                                                                ></i>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </Col>

                                            <Col>
                                                {receiveTestResults.isAvailable ? (
                                                    <Alert color="success">
                                                        <h4 className="alert-heading">
                                                            {t(
                                                                `step.results.finishedSuccess.title`
                                                            )}
                                                        </h4>
                                                        <hr />
                                                        <p>
                                                            {t(
                                                                `step.results.finishedSuccess.description`,
                                                                {
                                                                    minerID:
                                                                        selectedAddress,
                                                                    nodeType:
                                                                        receiveTestResults?.agent,
                                                                    connectorVersion:
                                                                        receiveTestResults?.connectorVersion,
                                                                    multiaddresses:
                                                                        sendTestResults
                                                                            ?.boostResponse
                                                                            ?.multiaddresses
                                                                            ?.length >
                                                                        1
                                                                            ? sendTestResults?.boostResponse?.multiaddresses.join(
                                                                                  ' , '
                                                                              )
                                                                            : sendTestResults
                                                                                  ?.boostResponse
                                                                                  ?.multiaddresses
                                                                                  ?.length ===
                                                                              1
                                                                            ? sendTestResults
                                                                                  ?.boostResponse
                                                                                  ?.multiaddresses[0]
                                                                            : '',
                                                                    peerId: sendTestResults
                                                                        ?.boostResponse
                                                                        ?.peerId,
                                                                    getAskPricePerGib:
                                                                        sendTestResults
                                                                            ?.boostResponse
                                                                            ?.getAskPricePerGib,
                                                                    getAskVerifiedPricePerGib:
                                                                        sendTestResults
                                                                            ?.boostResponse
                                                                            ?.getAskVerifiedPricePerGib,
                                                                    getAskMinPieceSize:
                                                                        sendTestResults
                                                                            ?.boostResponse
                                                                            ?.getAskMinPieceSize,
                                                                    getAskMaxPieceSize:
                                                                        sendTestResults
                                                                            ?.boostResponse
                                                                            ?.getAskMaxPieceSize,
                                                                    getAskSectorSize:
                                                                        sendTestResults
                                                                            ?.boostResponse
                                                                            ?.getAskSectorSize,
                                                                    dealProtocolsSupported:
                                                                        sendTestResults
                                                                            ?.boostResponse
                                                                            ?.dealProtocolsSupported,
                                                                }
                                                            )}
                                                        </p>
                                                    </Alert>
                                                ) : (
                                                    <Alert color="info">
                                                        <h4 className="alert-heading">
                                                            {t(
                                                                `step.results.howToSolve`
                                                            )}
                                                        </h4>
                                                        <hr />
                                                        <p>
                                                            {t(
                                                                `errorCode.${receiveTestResults.errorCode}.resolveTips`,
                                                                {
                                                                    minerID:
                                                                        selectedAddress,
                                                                    nodeType:
                                                                        receiveTestResults?.agent,
                                                                    connectorVersion:
                                                                        receiveTestResults?.connectorVersion,
                                                                    multiaddresses:
                                                                        sendTestResults
                                                                            ?.boostResponse
                                                                            ?.multiaddresses
                                                                            ?.length >
                                                                        1
                                                                            ? sendTestResults?.boostResponse?.multiaddresses.join(
                                                                                  ' , '
                                                                              )
                                                                            : sendTestResults
                                                                                  ?.boostResponse
                                                                                  ?.multiaddresses
                                                                                  ?.length ===
                                                                              1
                                                                            ? sendTestResults
                                                                                  ?.boostResponse
                                                                                  ?.multiaddresses[0]
                                                                            : '',
                                                                    peerId: sendTestResults
                                                                        ?.boostResponse
                                                                        ?.peerId,
                                                                    getAskPricePerGib:
                                                                        sendTestResults
                                                                            ?.boostResponse
                                                                            ?.getAskPricePerGib,
                                                                    getAskVerifiedPricePerGib:
                                                                        sendTestResults
                                                                            ?.boostResponse
                                                                            ?.getAskVerifiedPricePerGib,
                                                                    getAskMinPieceSize:
                                                                        sendTestResults
                                                                            ?.boostResponse
                                                                            ?.getAskMinPieceSize,
                                                                    getAskMaxPieceSize:
                                                                        sendTestResults
                                                                            ?.boostResponse
                                                                            ?.getAskMaxPieceSize,
                                                                    getAskSectorSize:
                                                                        sendTestResults
                                                                            ?.boostResponse
                                                                            ?.getAskSectorSize,
                                                                    dealProtocolsSupported:
                                                                        sendTestResults
                                                                            ?.boostResponse
                                                                            ?.dealProtocolsSupported,
                                                                }
                                                            )}
                                                        </p>

                                                        {t(
                                                            `errorCode.${receiveTestResults.errorCode}.resolveTipsCommand`
                                                        ) !== 'N/A' && (
                                                            <p className="mb-0">
                                                                <CustomCodeHighlight
                                                                    text={t(
                                                                        `errorCode.${receiveTestResults.errorCode}.resolveTipsCommand`,
                                                                        {
                                                                            minerID:
                                                                                selectedAddress.addressId,
                                                                            nodeType:
                                                                                receiveTestResults?.agent,
                                                                            connectorVersion:
                                                                                receiveTestResults?.connectorVersion,
                                                                            multiaddresses:
                                                                                sendTestResults
                                                                                    ?.boostResponse
                                                                                    ?.multiaddresses
                                                                                    ?.length >
                                                                                1
                                                                                    ? sendTestResults?.boostResponse?.multiaddresses.join(
                                                                                          ' , '
                                                                                      )
                                                                                    : sendTestResults
                                                                                          ?.boostResponse
                                                                                          ?.multiaddresses
                                                                                          ?.length ===
                                                                                      1
                                                                                    ? sendTestResults
                                                                                          ?.boostResponse
                                                                                          ?.multiaddresses[0]
                                                                                    : '',
                                                                            peerId: sendTestResults
                                                                                ?.boostResponse
                                                                                ?.peerId,
                                                                            getAskPricePerGib:
                                                                                sendTestResults
                                                                                    ?.boostResponse
                                                                                    ?.getAskPricePerGib,
                                                                            getAskVerifiedPricePerGib:
                                                                                sendTestResults
                                                                                    ?.boostResponse
                                                                                    ?.getAskVerifiedPricePerGib,
                                                                            getAskMinPieceSize:
                                                                                sendTestResults
                                                                                    ?.boostResponse
                                                                                    ?.getAskMinPieceSize,
                                                                            getAskMaxPieceSize:
                                                                                sendTestResults
                                                                                    ?.boostResponse
                                                                                    ?.getAskMaxPieceSize,
                                                                            getAskSectorSize:
                                                                                sendTestResults
                                                                                    ?.boostResponse
                                                                                    ?.getAskSectorSize,
                                                                            dealProtocolsSupported:
                                                                                sendTestResults
                                                                                    ?.boostResponse
                                                                                    ?.dealProtocolsSupported,
                                                                        }
                                                                    )}
                                                                />
                                                            </p>
                                                        )}
                                                    </Alert>
                                                )}
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            ) : isError ? (
                                <Row className="p-4 diag-results">
                                    <Col xs={12} md={12}>
                                        <Row>
                                            <Col>
                                                <table className="table">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                {t(
                                                                    `errorCode.ERR_TIMEOUT.name`
                                                                )}
                                                            </td>
                                                            <td>
                                                                <i
                                                                    className="fa fa-exclamation-circle fa-1x"
                                                                    style={{
                                                                        color: 'red',
                                                                    }}
                                                                ></i>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </Col>

                                            <Col>
                                                <Alert color="info">
                                                    <h4 className="alert-heading">
                                                        {t(
                                                            `step.results.howToSolve`
                                                        )}
                                                    </h4>
                                                    <hr />
                                                    <p>
                                                        <Trans
                                                            t={t}
                                                            i18nKey={`errorCode.ERR_TIMEOUT.resolveTips`}
                                                        />
                                                    </p>
                                                </Alert>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            ) : (
                                <Row className="p-4">
                                    <Col
                                        xs={12}
                                        md={12}
                                        className="text-center"
                                    >
                                        <h5 className="mt-2 mb-2">
                                            {t('step.readyToLaunch')}
                                        </h5>
                                    </Col>
                                </Row>
                            )}
                        </section>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default withAuth0(
    withTranslation('DiagnosisContainer')(DiagnosisContainer)
)
