import React from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/ModalHeader'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import { Trans, useTranslation } from 'react-i18next'

export const DisconnectIntegration = ({
    isModalOpened,
    handleModal,
    handleDisconnect,
    integrationName,
}) => {
    const { t } = useTranslation('DisconnectIntegration') // second param ignored i18n

    return (
        <Modal
            show={isModalOpened}
            animation={false}
            onHide={handleModal}
            size="lg"
        >
            <ModalHeader closeButton>
                {t('header', { integrationName: integrationName })}
            </ModalHeader>

            <ModalBody>
                <Trans t={t} i18nKey="body.willDisconnectIntegration" />
            </ModalBody>

            <ModalFooter>
                <Button onClick={handleDisconnect} variant="danger" size="1x">
                    {t('button.continue')}
                </Button>

                <Button onClick={handleModal} variant="secondary" size="1x">
                    {t('button.cancel')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default DisconnectIntegration
