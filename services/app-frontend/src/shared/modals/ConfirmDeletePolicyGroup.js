import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { useTranslation } from 'react-i18next'

export const ConfirmDeletePolicyGroup = ({ isModalOpened, handleDeletePolicyGroup, handleModal, policyGroup }) => {
    const { t } = useTranslation('ConfirmDeletePolicyGroup') // second param ignored i18n

    return (
        <Modal isOpen={isModalOpened} fade={false} toggle={handleModal} size="lg">
            <ModalHeader toggle={handleModal}>
                {t('removeConfirmation.header', { policyGroupName: policyGroup.name })}
            </ModalHeader>

            <ModalBody>
                {t('removeConfirmation.body.willRemoveThisPolicyGroup')}
            </ModalBody>

            <ModalFooter>
                <Button onClick={handleDeletePolicyGroup} color="danger">
                    {t('button.confirm')}
                </Button>

                <Button onClick={handleModal} color="secondary">
                    {t('button.cancel')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ConfirmDeletePolicyGroup
