import { useTranslation } from 'react-i18next'
import {
    Alert,
    Button,
    Col,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
} from 'reactstrap'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'

export const ViewStorageAcceptanceLogic = ({
    isModalOpened,
    handleModal,
    acceptanceLogic,
}) => {
    const { t } = useTranslation('ViewStorageAcceptanceLogic') // second param ignored i18n
    return (
        <Modal
            isOpen={isModalOpened}
            fade={false}
            toggle={handleModal}
            size="lg"
        >
            <ModalHeader toggle={handleModal}>
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
                                    <li>{client.name}</li>
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
                                                <li>{client.name}</li>
                                            )
                                        )}
                                    </ul>
                                )}

                                <Alert color="warning">
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
