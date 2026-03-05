import { useTranslation } from 'react-i18next'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import ModalHeader from 'react-bootstrap/ModalHeader'
import Row from 'react-bootstrap/Row'
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/light'
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
SyntaxHighlighter.registerLanguage('json', json)

export const ViewStorageAcceptanceLogic = ({
    isModalOpened,
    handleModal,
    acceptanceLogic,
}) => {
    const { t } = useTranslation('ViewStorageAcceptanceLogic') // second param ignored i18n
    return (
        <Modal
            show={isModalOpened}
            animation={false}
            onHide={handleModal}
            size="lg"
        >
            <ModalHeader closeButton>
                {t('header', {
                    storageAcceptanceLogicName: acceptanceLogic?.name,
                })}
            </ModalHeader>

            <ModalBody>
                <Row>
                    <Col>
                        {acceptanceLogic?.jsonLogic ? (
                            <SyntaxHighlighter
                                language="json"
                                style={a11yDark}
                                wrapLongLines={true}
                            >
                                {JSON.stringify(
                                    acceptanceLogic?.jsonLogic,
                                    null,
                                    4
                                )}
                            </SyntaxHighlighter>
                        ) : (
                            <Alert>{t('error.emptyLogic')}</Alert>
                        )}
                    </Col>
                </Row>

                <hr />

                <Row className="mt-4 mb-4">
                    <Col>
                        <h5 className="mb-4">{t('body.client.title')}</h5>

                        {acceptanceLogic?.clients?.length !== 0 ? (
                            <ul>
                                {acceptanceLogic?.clients?.map((client) => (
                                    <li key={client.name}>{client.name}</li>
                                ))}
                            </ul>
                        ) : (
                            <Alert>
                                {t('body.client.acceptanceLogic.noClient')}
                            </Alert>
                        )}

                        {acceptanceLogic?.isDefault && (
                            <div style={{ marginTop: 50 + 'px' }}>
                                <h5 className="mb-4">
                                    {t('body.client.titleClientsWithDefault')}
                                </h5>

                                {acceptanceLogic?.clientsWithDefault?.length !==
                                    0 && (
                                    <ul>
                                        {acceptanceLogic?.clientsWithDefault?.map(
                                            (client) => (
                                                <li key={client.name}>{client.name}</li>
                                            )
                                        )}
                                    </ul>
                                )}

                                <Alert variant="warning">
                                    {t(
                                        'body.client.acceptanceLogic.alsoApplyToUnknownClients'
                                    )}
                                </Alert>
                            </div>
                        )}
                    </Col>
                </Row>
            </ModalBody>

            <ModalFooter>
                <Button onClick={handleModal} className="custom-cidg-button">
                    {t('button.close')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ViewStorageAcceptanceLogic
