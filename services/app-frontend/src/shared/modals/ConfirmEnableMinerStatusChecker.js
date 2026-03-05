import React from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/ModalHeader'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import { useTranslation, Trans } from 'react-i18next'

export const ConfirmEnableMinerStatusChecker = ({
    isModalOpened,
    handleModal,
    handleConfirm,
}) => {
    const { t } = useTranslation('ConfirmEnableMinerStatusChecker') // second param ignored i18n

    return (
        <Modal
            show={isModalOpened}
            animation={false}
            onHide={handleModal}
            size="lg"
        >
            <ModalHeader closeButton>{t('header')}</ModalHeader>

            <ModalBody>
                <Trans t={t} i18nKey="body.minerDataWillBeCollected" />

                <ul className="mr-4 mt-4 mb-4">
                    <li>
                        <Trans t={t} i18nKey="body.sealingPipelineStatus" />
                    </li>
                    <li>
                        <Trans t={t} i18nKey="body.walletStatus" />
                    </li>
                    <li>
                        <Trans t={t} i18nKey="body.storageStatus" />
                    </li>
                </ul>

                <strong>
                    <Trans t={t} i18nKey="body.testBeforeEnabling" />
                </strong>
            </ModalBody>

            <ModalFooter>
                <Button onClick={() => handleConfirm()} variant="danger">
                    {t('button.confirm')}
                </Button>

                <Button onClick={handleModal} variant="secondary">
                    {t('button.cancel')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ConfirmEnableMinerStatusChecker
