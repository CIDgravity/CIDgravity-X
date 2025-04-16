import React from 'react'
import ReactTooltip from 'react-tooltip'
import { useTranslation } from 'react-i18next'

import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Row,
    Col,
} from 'reactstrap'

export const ViewAddressAccessRights = ({
    isModalOpened,
    handleModal,
    removeAccessOnAddress,
    address,
    users,
    currentUser,
}) => {
    const { t } = useTranslation('ViewAddressAccessRights') // second param ignored i18n
    return (
        <Modal
            isOpen={isModalOpened}
            fade={false}
            toggle={handleModal}
            size="lg"
        >
            <ModalHeader toggle={handleModal}>
                {t('header', { addressId: address.addressId })}
            </ModalHeader>

            <ModalBody>
                <Row className="d-md-flex mb-2">
                    <Col
                        className="u-pointer-cursor text-secondary"
                        xs="3"
                        md="3"
                    >
                        {t('body.table.profile')}
                    </Col>
                    <Col
                        className="u-pointer-cursor text-secondary"
                        xs="3"
                        md="3"
                    >
                        {t('body.table.nickname')}
                    </Col>
                    <Col
                        className="u-pointer-cursor text-secondary"
                        xs="4"
                        md="4"
                    >
                        {t('body.table.email')}
                    </Col>
                    <Col
                        className="u-pointer-cursor text-secondary"
                        xs="1"
                        md="1"
                    >
                        {t('body.table.action')}
                    </Col>
                </Row>

                {users.map((user) => (
                    <div key={user.id} className={`p-1 card-form`}>
                        <Row className="align-items-center align-items-stretch mt-4 mb-4">
                            <Col xs="3" md="3">
                                <img
                                    className="small-user-profile-picture ms-4"
                                    src={user.picture}
                                    alt="UserPicture"
                                />
                            </Col>

                            <Col xs="3" md="3">
                                {user.nickname}
                            </Col>

                            <Col xs="4" md="4">
                                {user.email}
                            </Col>

                            {user.user_id !== currentUser.user_id && (
                                <Col xs="1" md="1">
                                    <span
                                        onClick={() =>
                                            removeAccessOnAddress(user, address)
                                        }
                                        className="btn-pointer card-rounded-btn ms-4"
                                    >
                                        <i
                                            style={{ color: '#222b2a' }}
                                            className="fas fa-trash-alt"
                                            data-for="delete"
                                            data-tip="Remove access"
                                        />

                                        <ReactTooltip
                                            place="bottom"
                                            id="delete"
                                        />
                                    </span>
                                </Col>
                            )}
                        </Row>
                    </div>
                ))}
            </ModalBody>

            <ModalFooter>
                <Button onClick={handleModal} className="custom-cidg-button">
                    {t('button.close')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ViewAddressAccessRights
