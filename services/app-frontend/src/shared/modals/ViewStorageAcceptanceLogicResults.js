import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import SyntaxHighlighter from 'react-syntax-highlighter'
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import {
    Button,
    Col,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
} from 'reactstrap'

export const ViewStorageAcceptanceLogicResults = ({
    isModalOpened,
    handleModal,
    dealProposal,
}) => {
    const { t } = useTranslation('ViewStorageAcceptanceLogicResults') // second param ignored i18n
    return (
        <Modal
            isOpen={isModalOpened}
            fade={false}
            toggle={handleModal}
            size="lg"
        >
            <ModalHeader toggle={handleModal}>{t('header')}</ModalHeader>

            <ModalBody>
                <Row>
                    <Col>
                        {t('body.acceptanceLogicUsed', {
                            acceptanceLogicName:
                                dealProposal.storageAcceptanceLogic,
                        })}
                        <br />

                        {t('body.solvedVarsExplanation')}
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Col>
                        <SyntaxHighlighter
                            language="json"
                            style={a11yDark}
                            wrapLongLines={true}
                        >
                            {JSON.stringify(
                                dealProposal.storageAcceptanceLogicWithVarsSolved,
                                null,
                                4
                            )}
                        </SyntaxHighlighter>
                    </Col>
                </Row>
            </ModalBody>

            <ModalFooter>
                <Button
                    tag={Link}
                    to={`./playground/${dealProposal.id}`}
                    className="btn-secondary"
                >
                    {t('button.simulateInPlayground')}
                </Button>

                <Button
                    tag={Link}
                    to={
                        './storage-acceptance-logic/' +
                        dealProposal.storageAcceptanceLogicId
                    }
                    className="btn-secondary"
                >
                    {t('button.viewAcceptanceLogic')}
                </Button>

                <Button onClick={handleModal} className="custom-cidg-button">
                    {t('button.close')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ViewStorageAcceptanceLogicResults
