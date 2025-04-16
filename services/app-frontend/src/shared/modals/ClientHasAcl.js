import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export const ClientHasAcl = ({ isOpen, setIsOpen, toRoute, client }) => {
    const { t } = useTranslation('ClientHasAcl') // second param ignored i18n

    return (
        <Modal
            isOpen={isOpen}
            fade={false}
            toggle={() => setIsOpen(false)}
            size="lg"
        >
            <ModalHeader toggle={() => setIsOpen(false)}>
                {t('header', { clientName: client.name })}
            </ModalHeader>

            <ModalBody>{t('body.clientHasLinkedAcl', { clientName: client.name })}</ModalBody>

            <ModalFooter>
                <div className="d-flex flex-row justify-content-center align-items-center">
                    <div className="p-1">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setIsOpen(false)}
                        >
                            {t('button.cancel')}
                        </button>
                    </div>
                    <div className="p-1">
                        <Button
                            tag={Link}
                            className="custom-cidg-button"
                            to={toRoute}
                        >
                            {t('button.goToRetrievalAclPage')}
                        </Button>
                    </div>
                </div>
            </ModalFooter>
        </Modal>
    )
}

export default ClientHasAcl
