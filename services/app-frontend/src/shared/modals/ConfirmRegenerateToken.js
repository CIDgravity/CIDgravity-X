import React from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/ModalHeader'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import { Trans, useTranslation } from 'react-i18next'

export const ConfirmRegenerateToken = ({
    isModalOpened,
    handleModal,
    handleSubmitRegenerate,
}) => {
    const { t } = useTranslation('ConfirmRegenerateToken') // second param ignored i18n

    return (

        <Modal
            show={isModalOpened}
            animation={false}
            onHide={handleModal}
            size="lg"
        >
            <ModalHeader closeButton>{t('header')}</ModalHeader>

            <ModalBody>
                <Trans t={t} i18nKey="body.yourTokenWillBeInvalidated" />
                <strong>
                    <i className="fas fa-exclamation-triangle" />{' '}
                    {t('body.beCareful')}
                </strong>{' '}
                {t('body.dealProposalsWillNotBeProcessed')}
            </ModalBody>

            <ModalFooter>
                <Button onClick={handleSubmitRegenerate} variant="danger">
                    {t('button.confirm')}
                </Button>

                <Button onClick={handleModal} variant="secondary">
                    {t('button.cancel')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ConfirmRegenerateToken
