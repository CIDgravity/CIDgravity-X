import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { useTranslation } from 'react-i18next'

export const ConfirmUnlinkAddress = ({
    isModalOpened,
    handleModal,
    handleDeleteAddress,
    selectedAddress,
    selectedActorType,
}) => {
    const { t } = useTranslation('ConfirmUnlinkMinerAddress') // second param ignored i18n

    return (
        <Modal
            isOpen={isModalOpened}
            fade={false}
            toggle={handleModal}
            size="lg"
        >
            <ModalHeader toggle={handleModal}>
                {t('header', { addressId: selectedAddress.addressId })}
            </ModalHeader>

            <ModalBody>
                {t('body.willUnlinkFromYourAccount')}
                <br /> <br />
                <strong>
                    <i class="fas fa-exclamation-triangle" />
                    {'  '}
                    {t('body.beCareful')}
                </strong>{' '}
                {t('body.signNewMessage')}
            </ModalBody>

            <ModalFooter>
                <Button
                    onClick={() => handleDeleteAddress(selectedAddress, selectedActorType)}
                    color="danger"
                >
                    {t('button.confirm')}
                </Button>

                <Button onClick={handleModal} color="secondary">
                    {t('button.cancel')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ConfirmUnlinkAddress
