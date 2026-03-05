import React from 'react'
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/ModalHeader'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import Button from 'react-bootstrap/Button'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

export const ClientHasAcl = ({ show, setIsOpen, toRoute, client }) => {
    const { t } = useTranslation('ClientHasAcl') // second param ignored i18n

    return (
        <Modal
            show={show}
            animation={false}
            onHide={() => setIsOpen(false)}
            size="lg"
        >
            <ModalHeader closeButton>
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
                            as={Link}
                            className="custom-cidg-button"
                            to={toRoute}
                            relative="path"
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
