import React from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/ModalHeader'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

export const AlertCreatePricingFromClient = ({
    isModalOpened,
    handleModal,
    linkTo,
}) => {
    const { t } = useTranslation('AlertCreatePricingFromClient') // second param ignored i18n

    return (
        <Modal
            style={{ zIndex: 9999 }}
            show={isModalOpened}
            animation={false}
            onHide={handleModal}
            size="lg"
        >
            <ModalHeader closeButton>{t('header')}</ModalHeader>

            <ModalBody>{t('body.warningDataWillBeLost')}</ModalBody>

            <ModalFooter>
                <Button as={Link} to={linkTo} relative="path" variant="danger" size="1x">
                    {t('button.continue')}
                </Button>

                <Button onClick={handleModal} variant="secondary" size="1x">
                    {t('button.cancel')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default AlertCreatePricingFromClient
