import CreatableSelect from 'react-select/creatable'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import FormGroup from 'react-bootstrap/FormGroup'
import FormControl from 'react-bootstrap/FormControl'
import InputGroup from 'react-bootstrap/InputGroup'
import FormLabel from 'react-bootstrap/FormLabel'
import Modal from 'react-bootstrap/Modal'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import ModalHeader from 'react-bootstrap/ModalHeader'
import Row from 'react-bootstrap/Row'
import { useTranslation } from 'react-i18next'

// type === 'blacklist' || type === 'whitelist'
export function RetrievalAclForm({
    handleChooseClientOrClientPeerId,
    handleValueNotInClientList,
    clientOrClientPeerIds,
    selectedPeerOrClientId,
    comment,
    handleOnChangeComment,
    handleOnAddToAcl,
    disabled,
    type,
    errorExplanationSelectedElem,
    show,
    setIsOpen,
}) {
    const handleEnter = (event) => {
        if (event.key === 'Enter' && !disabled) {
            handleOnAddToAcl()
        }
    }

    const { t } = useTranslation('RetrievalAclForm') // second param ignored i18n

    return (
        <Modal
            show={show}
            animation={false}
            onHide={() => setIsOpen(false)}
            size="lg"
        >
            <ModalHeader closeButton>
                {t(`${type}.title`)}
            </ModalHeader>

            <ModalBody>
                <Row className="my-3">
                    <Col xs="12" md="12">
                        <FormGroup>
                            <FormLabel className="form-label">
                                {t(`${type}.elementToSelect.label`)}
                            </FormLabel>

                            <CreatableSelect
                                placeholder={t(
                                    `${type}.elementToSelect.placeholder`
                                )}
                                autoFocus
                                isClearable
                                onChange={handleChooseClientOrClientPeerId}
                                onCreateOption={handleValueNotInClientList}
                                options={clientOrClientPeerIds}
                                value={selectedPeerOrClientId}
                                formatCreateLabel={() =>
                                    t(
                                        `${type}.elementToSelect.formatCreateLabel`
                                    )
                                }
                            />
                            {errorExplanationSelectedElem !== '' ? (
                                <p className="error-feedback">
                                    {errorExplanationSelectedElem}
                                </p>
                            ) : null}
                        </FormGroup>
                    </Col>
                </Row>

                <Row className="my-3">
                    <Col xs="12" md="12">
                        <FormLabel className="form-label">
                            {t(`${type}.comment.label`)}
                        </FormLabel>
                        <InputGroup>
                            <FormControl
                                value={comment}
                                onKeyDown={handleEnter}
                                onChange={(e) =>
                                    handleOnChangeComment(e.target.value)
                                }
                                className="form-control"
                            />
                        </InputGroup>
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter>
                <Row className="mt-3">
                    <Col className="text-end">
                        <Button
                            onClick={handleOnAddToAcl}
                            disabled={disabled}
                            variant="primary"
                            type="submit"
                        >
                            {t(`button.${type}.addToAcl`)}
                        </Button>
                    </Col>
                </Row>
            </ModalFooter>
        </Modal>
    )
}
