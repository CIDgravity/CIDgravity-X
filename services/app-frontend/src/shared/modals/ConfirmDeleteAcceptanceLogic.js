import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
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
            isOpen={isModalOpened}
            fade={false}
            toggle={handleModal}
            size="lg"
        >
            {!acceptanceLogic.clients || acceptanceLogic.clients.length > 0 ? (
                <>
                    <ModalHeader toggle={handleModal}>
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
                                <li>{client.name}</li>
                            ))}
                        </ul>
                    </ModalBody>

                    <ModalFooter>
                        <Button onClick={handleModal} color="secondary">
                            {t('button.close')}
                        </Button>
                    </ModalFooter>
                </>
            ) : (
                <>
                    <ModalHeader toggle={handleModal}>
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
                            color="danger"
                        >
                            {t('button.confirm')}
                        </Button>

                        <Button onClick={handleModal} color="secondary">
                            {t('button.cancel')}
                        </Button>
                    </ModalFooter>
                </>
            )}
        </Modal>
    )
}

export default ConfirmDeleteAcceptanceLogic
