import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
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
            isOpen={isModalOpened}
            fade={false}
            toggle={handleModal}
            size="lg"
        >
            <ModalHeader toggle={handleModal}>
                {t('header', { integrationName: integrationName })}
            </ModalHeader>

            <ModalBody>
                <Trans t={t} i18nKey="body.willDisconnectIntegration" />
            </ModalBody>

            <ModalFooter>
                <Button onClick={handleDisconnect} color="danger" size="1x">
                    {t('button.continue')}
                </Button>

                <Button onClick={handleModal} color="secondary" size="1x">
                    {t('button.cancel')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default DisconnectIntegration
