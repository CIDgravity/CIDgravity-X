import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

export default function RetrievalAclEmptyWhitelist({
    isOpen,
    setIsOpen,
    onConfirm,
    isLoading,
    amountChanges,
}) {
    const { t } = useTranslation('RetrievalAclEmptyWhitelist') // second param ignored i18n
    return (
        <Modal
            isOpen={isOpen}
            fade={false}
            toggle={() => setIsOpen(false)}
            size="lg"
        >
            <ModalHeader toggle={() => setIsOpen(false)}>
                {t('header')}
            </ModalHeader>

            <ModalBody>{t('body')}</ModalBody>
            <ModalFooter>
                <div className="d-flex flex-row justify-content-center align-items-center">
                    <div className="p-1">
                        <button
                            disabled={isLoading}
                            className="btn btn-danger"
                            onClick={onConfirm}
                        >
                            {isLoading ? (
                                <FontAwesomeIcon
                                    spin
                                    icon={faSpinner}
                                    size="2xs"
                                />
                            ) : (
                                t('button.apply', {
                                    count: amountChanges,
                                })
                            )}
                        </button>
                    </div>
                    <div className="p-1">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setIsOpen(false)}
                        >
                            {t('button.close')}
                        </button>
                    </div>
                </div>
            </ModalFooter>
        </Modal>
    )
}
