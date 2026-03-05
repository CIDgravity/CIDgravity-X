import { useTranslation } from 'react-i18next'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import ModalHeader from 'react-bootstrap/ModalHeader'
import Row from 'react-bootstrap/Row'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import CodeEditor from '@uiw/react-textarea-code-editor'

export const ImportExportOnboardingPolicy = ({ 
    isModalOpened, handleImportOnboardingPolicy, onboardingPolicyJson, 
    handleCopyOnboardingPolicyJsonToClipboard, handleOnChangeJsonContent, handleModal, isImportLoading }) => {

    const { t } = useTranslation('ImportExportOnboardingPolicy') // second param ignored i18n

    return (
        <Modal show={isModalOpened} animation={false} onHide={handleModal} size="lg">
            <ModalHeader closeButton>{t('header')}</ModalHeader>

            <ModalBody>
                <Row>
                    <Col>{t('body.description')}</Col>
                </Row>

                <Row className="mt-4">
                    <Col>
                        <CodeEditor
                            value={onboardingPolicyJson}
                            language="json"
                            placeholder={t('body.editor.placeholder')}
                            onChange={(evn) => handleOnChangeJsonContent(evn.target.value)}
                            padding={15}
                            data-color-mode="dark"
                            style={{
                                fontSize: 14,
                                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                            }}
                        />
                    </Col>
                </Row>
            </ModalBody>

            <ModalFooter>
                <Button onClick={handleCopyOnboardingPolicyJsonToClipboard} variant="secondary" disabled={isImportLoading}>
                    {t('button.copyToClipboard')}
                </Button>

                <Button onClick={handleImportOnboardingPolicy} className="custom-cidg-button" disabled={isImportLoading}>
                    {isImportLoading ? (
                        <FontAwesomeIcon spin icon={faSpinner} size="2xs" />
                    ) : (
                        <>
                            {t('button.apply')}
                        </>
                    )}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ImportExportOnboardingPolicy
