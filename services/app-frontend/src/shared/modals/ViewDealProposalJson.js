import { useTranslation } from 'react-i18next'

import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/light'
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
SyntaxHighlighter.registerLanguage('json', json)

import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import ModalHeader from 'react-bootstrap/ModalHeader'
import Row from 'react-bootstrap/Row'

export const ViewDealProposalJson = ({
    isModalOpened,
    handleModal,
    dealProposal,
}) => {
    const { t } = useTranslation('ViewDealProposalJson') // second param ignored i18n
    return (
        <Modal
            show={isModalOpened}
            animation={false}
            onHide={handleModal}
            size="lg"
        >
            <ModalHeader closeButton>{t('header')}</ModalHeader>

            <ModalBody>
                <Row>
                    <Col>
                        <SyntaxHighlighter
                            language="json"
                            style={a11yDark}
                            wrapLongLines={true}
                        >
                            {JSON.stringify(
                                dealProposal.originalProposal,
                                null,
                                4
                            )}
                        </SyntaxHighlighter>
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

export default ViewDealProposalJson
