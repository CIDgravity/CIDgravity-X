import { useTranslation } from 'react-i18next'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import ModalHeader from 'react-bootstrap/ModalHeader'
import Row from 'react-bootstrap/Row'

import CodeEditor from '@uiw/react-textarea-code-editor'
export const ManualEditAcceptanceLogicFromJson = ({
    isModalOpened,
    handleLoadJsonToImmutableTree,
    currentJsonContent,
    handleChangeJsonContent,
    handleCopyJsonLogicToClipboard,
    handleModal,
}) => {
    const { t } = useTranslation('ManualEditAcceptanceLogicFromJson') // second param ignored i18n

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
                    <Col>{t('body.description')}</Col>
                </Row>

                <Row className="mt-4">
                    <Col>
                        <CodeEditor
                            value={currentJsonContent}
                            language="json"
                            placeholder={t('body.editor.placeholder')}
                            onChange={(evn) =>
                                handleChangeJsonContent(evn.target.value)
                            }
                            padding={15}
                            data-color-mode="dark"
                            style={{
                                fontSize: 14,
                                fontFamily:
                                    'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                            }}
                        />
                    </Col>
                </Row>
            </ModalBody>

            <ModalFooter>
                <Button
                    onClick={handleCopyJsonLogicToClipboard}
                    variant="secondary"
                >
                    {t('button.copyToClipboard')}
                </Button>

                <Button
                    onClick={handleLoadJsonToImmutableTree}
                    className="custom-cidg-button"
                >
                    {t('button.apply')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ManualEditAcceptanceLogicFromJson
