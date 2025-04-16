import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { Trans, useTranslation } from 'react-i18next'

export const ConfirmRegenerateClientToken = ({
    isModalOpened,
    handleModal,
    handleSubmitRegenerate,
}) => {
    const { t } = useTranslation('ConfirmRegenerateClientToken') // second param ignored i18n

    return (
        <Modal isOpen={isModalOpened} fade={false} toggle={handleModal} size="lg">
            <ModalHeader toggle={handleModal}>{t('header')}</ModalHeader>

            <ModalBody>
                <Trans t={t} i18nKey="body.yourTokenWillBeInvalidated" />
            </ModalBody>

            <ModalFooter>
                <Button onClick={handleSubmitRegenerate} color="danger">
                    {t('button.confirm')}
                </Button>

                <Button onClick={handleModal} color="secondary">
                    {t('button.cancel')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ConfirmRegenerateClientToken
