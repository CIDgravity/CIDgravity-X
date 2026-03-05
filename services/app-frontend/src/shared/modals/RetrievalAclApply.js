import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import Modal from 'react-bootstrap/Modal'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import ModalHeader from 'react-bootstrap/ModalHeader'

export default function RetrievalAclApply({
    show,
    setIsOpen,
    onConfirm,
    amountChanges,
    isLoading,
}) {
    const { t } = useTranslation('RetrievalAclApply') // second param ignored i18n

    return (
        <Modal
            show={show}
            animation={false}
            onHide={() => setIsOpen(false)}
            size="lg"
        >
            <ModalHeader closeButton>
                {t('header')}
            </ModalHeader>

            <ModalBody>{t('body')}</ModalBody>
            <ModalFooter>
                <div className="d-flex flex-row justify-content-center align-items-center"></div>
                <div className="p-1">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setIsOpen(false)}
                    >
                        {t('button.close')}
                    </button>
                </div>
                <div className="p-1">
                    <button
                        disabled={isLoading}
                        className="btn btn-primary"
                        onClick={onConfirm}
                    >
                        {isLoading ? (
                            <FontAwesomeIcon spin icon={faSpinner} size="2xs" />
                        ) : (
                            t('button.apply', {
                                count: amountChanges,
                            })
                        )}
                    </button>
                </div>
            </ModalFooter>
        </Modal>
    )
}
