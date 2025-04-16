import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { Trans, useTranslation } from 'react-i18next'

export const ConfirmDeletePricingModel = ({
    isModalOpened,
    handleModal,
    handleDeletePricingModel,
    pricingModel,
}) => {
    const { t } = useTranslation('ConfirmDeletePricingModel') // second param ignored i18n

    return (
        <Modal
            isOpen={isModalOpened}
            fade={false}
            toggle={handleModal}
            size="lg"
        >
            {!pricingModel.clients || pricingModel.clients.length > 0 ? (
                <>
                    <ModalHeader toggle={handleModal}>
                        {t('unableToRemove.header', {
                            pricingModelName: pricingModel.name,
                        })}
                    </ModalHeader>

                    <ModalBody>
                        <Trans
                            t={t}
                            i18nKey="unableToRemove.body.needToUpdateClientsPricingModels"
                        />

                        <ul className="mt-4">
                            {pricingModel.clients.map((client) => (
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
                            pricingModelName: pricingModel.name,
                        })}
                    </ModalHeader>

                    <ModalBody>
                        {t(
                            'removeConfirmation.body.willRemoveThisPricingModel'
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            onClick={handleDeletePricingModel}
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

export default ConfirmDeletePricingModel
