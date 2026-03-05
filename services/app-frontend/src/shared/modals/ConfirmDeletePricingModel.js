import React from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/ModalHeader'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
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
            show={isModalOpened}
            animation={false}
            onHide={handleModal}
            size="lg"
        >
            {!pricingModel.clients || pricingModel.clients.length > 0 ? (
                <>
                    <ModalHeader closeButton>
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
                                <li key={client.name}>{client.name}</li>
                            ))}
                        </ul>
                    </ModalBody>

                    <ModalFooter>
                        <Button onClick={handleModal} variant="secondary">
                            {t('button.close')}
                        </Button>
                    </ModalFooter>
                </>
            ) : (
                <>
                    <ModalHeader closeButton>
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
                            variant="danger"
                        >
                            {t('button.confirm')}
                        </Button>

                        <Button onClick={handleModal} variant="secondary">
                            {t('button.cancel')}
                        </Button>
                    </ModalFooter>
                </>
            )}
        </Modal>
    )
}

export default ConfirmDeletePricingModel
