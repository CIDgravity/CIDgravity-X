import React from 'react'
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/ModalHeader'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import { useTranslation } from 'react-i18next'

// type === 'blacklist' || type === 'whitelist'
export default function RetrievalAclAlreadyOtherList({
    type,
    show,
    setIsOpen,
    onConfirm,
    selectedPeerOrClientId,
}) {
    const { t } = useTranslation('RetrievalAclAlreadyOtherList') // second param ignored i18n

    return (
        <Modal
            show={show}
            animation={false}
            onHide={() => setIsOpen(false)}
            size="lg"
        >
            <ModalHeader closeButton>
                {t(`${type}.header`)}
            </ModalHeader>

            <ModalBody>
                <p>
                    {t(`${type}.body`, {
                        elementLabel: `'${selectedPeerOrClientId?.label}'`,
                    })}
                </p>
            </ModalBody>
            <ModalFooter>
                <div className="d-flex flex-row justify-content-center align-items-center">
                    <div className="p-1">
                        <button className="btn btn-danger" onClick={onConfirm}>
                            {t(`button.${type}.confirm`)}
                        </button>
                    </div>
                    <div className="p-1">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setIsOpen(false)}
                        >
                            {t(`button.${type}.cancel`)}
                        </button>
                    </div>
                </div>
            </ModalFooter>
        </Modal>
    )
}
