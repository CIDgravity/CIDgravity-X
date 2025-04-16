import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { useTranslation } from 'react-i18next'

// type === 'blacklist' || type === 'whitelist'
export default function RetrievalAclAlreadyOtherList({
    type,
    isOpen,
    setIsOpen,
    onConfirm,
    selectedPeerOrClientId,
}) {
    const { t } = useTranslation('RetrievalAclAlreadyOtherList') // second param ignored i18n

    return (
        <Modal
            isOpen={isOpen}
            fade={false}
            toggle={() => setIsOpen(false)}
            size="lg"
        >
            <ModalHeader toggle={() => setIsOpen(false)}>
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
