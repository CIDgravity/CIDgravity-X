import { useTranslation } from 'react-i18next'

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

export const ViewDealProposalJson = ({
    isModalOpened,
    handleModal,
    dealProposal,
}) => {
    const { t } = useTranslation('ViewDealProposalJson') // second param ignored i18n
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
