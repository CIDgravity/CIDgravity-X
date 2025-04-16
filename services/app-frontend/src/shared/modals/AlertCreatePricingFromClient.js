import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export const AlertCreatePricingFromClient = ({
    isModalOpened,
    handleModal,
    linkTo,
}) => {
    const { t } = useTranslation('AlertCreatePricingFromClient') // second param ignored i18n

    return (
        <Modal
            zIndex="9999"
            isOpen={isModalOpened}
            fade={false}
            toggle={handleModal}
            size="lg"
        >
            <ModalHeader toggle={handleModal}>{t('header')}</ModalHeader>

            <ModalBody>{t('body.warningDataWillBeLost')}</ModalBody>

            <ModalFooter>
                <Button tag={Link} to={linkTo} color="danger" size="1x">
                    {t('button.continue')}
                </Button>

                <Button onClick={handleModal} color="secondary" size="1x">
                    {t('button.cancel')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default AlertCreatePricingFromClient
