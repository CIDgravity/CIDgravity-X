import React from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/ModalHeader'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { useTranslation, Trans } from 'react-i18next'

export const BlockClientDeals = ({
    isModalOpened,
    handleModal,
    customMessage,
    customMessageChange,
    handleBlockClient,
    client,
}) => {
    const { t } = useTranslation('BlockClientDeals') // second param ignored i18n

    return (
        <Modal
            show={isModalOpened}
            animation={false}
            onHide={handleModal}
            size="lg"
        >
            <ModalHeader closeButton>
                {t('header', { clientName: client.name })}
            </ModalHeader>

            <ModalBody>
                <Row>
                    <Col>
                        <Trans t={t} i18nKey="body.dealsWillBeRejected" />
                    </Col>
                </Row>

                <Row className="mt-4 mb-4">
                    <Col>
                        <textarea
                            style={{ overflow: 'auto', resize: 'none' }}
                            maxLength="380"
                            className="form-control p-2"
                            placeholder={t('body.blockReason.placeholder')}
                            onChange={customMessageChange}
                            value={customMessage}
                        />
                    </Col>
                </Row>
            </ModalBody>

            <ModalFooter>
                <Button
                    onClick={() => handleBlockClient(null, -1)}
                    className="custom-cidg-button"
                    disabled={!customMessage}
                >
                    {t('button.proceed')}
                </Button>

                <Button onClick={handleModal} variant="secondary">
                    {t('button.close')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default BlockClientDeals
