import React from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/ModalHeader'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
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
            show={isModalOpened}
            animation={false}
            onHide={handleModal}
            size="lg"
        >
            <ModalHeader closeButton>
                {t('header', { addressId: selectedAddress.addressId })}
            </ModalHeader>

            <ModalBody>
                {t('body.willUnlinkFromYourAccount')}
                <br /> <br />
                <strong>
                    <i className="fas fa-exclamation-triangle" />
                    {'  '}
                    {t('body.beCareful')}
                </strong>{' '}
                {t('body.signNewMessage')}
            </ModalBody>

            <ModalFooter>
                <Button
                    onClick={() => handleDeleteAddress(selectedAddress, selectedActorType)}
                    variant="danger"
                >
                    {t('button.confirm')}
                </Button>

                <Button onClick={handleModal} variant="secondary">
                    {t('button.cancel')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ConfirmUnlinkAddress
