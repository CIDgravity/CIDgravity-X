import React from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/ModalHeader'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import { useTranslation, Trans } from 'react-i18next'

export const ConfirmDeleteClient = ({
    isModalOpen,
    handleClose,
    handleDeleteClient,
    client,
}) => {
    const { t } = useTranslation('ConfirmDeleteClient') // second param ignored i18n

    return (
        <Modal show={isModalOpen} animation={false} onHide={handleClose} size="lg">
            <ModalHeader closeButton>
                {t('header', { clientName: client.name })}
            </ModalHeader>

            <ModalBody>
                <Trans t={t} i18nKey="body.willCompletelyRemoveClient" />
            </ModalBody>

            <ModalFooter>
                <Button onClick={handleDeleteClient} variant="danger">
                    {t('button.continue')}
                </Button>

                <Button onClick={handleClose} variant="secondary">
                    {t('button.close')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ConfirmDeleteClient
