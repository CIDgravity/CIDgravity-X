import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { useTranslation, Trans } from 'react-i18next'

export const ConfirmEnableMinerStatusChecker = ({
    isModalOpened,
    handleModal,
    handleConfirm,
}) => {
    const { t } = useTranslation('ConfirmEnableMinerStatusChecker') // second param ignored i18n

    return (
        <Modal
            isOpen={isModalOpened}
            fade={false}
            toggle={handleModal}
            size="lg"
        >
            <ModalHeader toggle={handleModal}>{t('header')}</ModalHeader>

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
                <Button onClick={() => handleConfirm()} color="danger">
                    {t('button.confirm')}
                </Button>

                <Button onClick={handleModal} color="secondary">
                    {t('button.cancel')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ConfirmEnableMinerStatusChecker
