import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { useTranslation, Trans } from 'react-i18next'

export const ConfirmDeleteClient = ({
    isModalOpen,
    handleClose,
    handleDeleteClient,
    client,
}) => {
    const { t } = useTranslation('ConfirmDeleteClient') // second param ignored i18n

    return (
        <Modal isOpen={isModalOpen} fade={false} toggle={handleClose} size="lg">
            <ModalHeader toggle={handleClose}>
                {t('header', { clientName: client.name })}
            </ModalHeader>

            <ModalBody>
                <Trans t={t} i18nKey="body.willCompletelyRemoveClient" />
            </ModalBody>

            <ModalFooter>
                <Button onClick={handleDeleteClient} color="danger">
                    {t('button.continue')}
                </Button>

                <Button onClick={handleClose} color="secondary">
                    {t('button.close')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ConfirmDeleteClient
