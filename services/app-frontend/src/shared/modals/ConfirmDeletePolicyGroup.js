import React from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/ModalHeader'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import { useTranslation } from 'react-i18next'

export const ConfirmDeletePolicyGroup = ({ isModalOpened, handleDeletePolicyGroup, handleModal, policyGroup }) => {
    const { t } = useTranslation('ConfirmDeletePolicyGroup') // second param ignored i18n

    return (
        <Modal show={isModalOpened} animation={false} onHide={handleModal} size="lg">
            <ModalHeader closeButton>
                {t('removeConfirmation.header', { policyGroupName: policyGroup.name })}
            </ModalHeader>

            <ModalBody>
                {t('removeConfirmation.body.willRemoveThisPolicyGroup')}
            </ModalBody>

            <ModalFooter>
                <Button onClick={handleDeletePolicyGroup} variant="danger">
                    {t('button.confirm')}
                </Button>

                <Button onClick={handleModal} variant="secondary">
                    {t('button.cancel')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ConfirmDeletePolicyGroup
