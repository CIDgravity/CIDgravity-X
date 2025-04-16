import { useTranslation } from 'react-i18next'
import {
    Button,
    Col,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
} from 'reactstrap'

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
            isOpen={isModalOpened}
            fade={false}
            toggle={handleModal}
            size="lg"
        >
            <ModalHeader toggle={handleModal}>{t('header')}</ModalHeader>

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
                    color="secondary"
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
