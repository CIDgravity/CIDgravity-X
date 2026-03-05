import React from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/ModalHeader'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import { Trans, useTranslation } from 'react-i18next'

export const ConfirmDeleteAcceptanceLogic = ({
    isModalOpened,
    handleModal,
    handleDeleteAcceptanceLogic,
    acceptanceLogic,
}) => {
    const { t } = useTranslation('ConfirmDeleteAcceptanceLogic') // second param ignored i18n

    return (
        <Modal
            show={isModalOpened}
            animation={false}
            onHide={handleModal}
            size="lg"
        >
            {!acceptanceLogic.clients || acceptanceLogic.clients.length > 0 ? (
                <>
                    <ModalHeader closeButton>
                        {t('unableToRemove.header', {
                            acceptanceLogicName: acceptanceLogic.name,
                        })}
                    </ModalHeader>

                    <ModalBody>
                        <Trans
                            t={t}
                            i18nKey="unableToRemove.body.needToUpdateClientsAcceptanceLogic"
                        />

                        <ul className="mt-4">
                            {acceptanceLogic.clients.map((client) => (
                                <li key={client.name}>{client.name}</li>
                            ))}
                        </ul>
                    </ModalBody>

                    <ModalFooter>
                        <Button onClick={handleModal} variant="secondary">
                            {t('button.close')}
                        </Button>
                    </ModalFooter>
                </>
            ) : (
                <>
                    <ModalHeader closeButton>
                        {t('removeConfirmation.header', {
                            acceptanceLogicName: acceptanceLogic.name,
                        })}
                    </ModalHeader>

                    <ModalBody>
                        {t(
                            'removeConfirmation.body.willRemoveThisAcceptanceLogic'
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            onClick={handleDeleteAcceptanceLogic}
                            variant="danger"
                        >
                            {t('button.confirm')}
                        </Button>

                        <Button onClick={handleModal} variant="secondary">
                            {t('button.cancel')}
                        </Button>
                    </ModalFooter>
                </>
            )}
        </Modal>
    )
}

export default ConfirmDeleteAcceptanceLogic
