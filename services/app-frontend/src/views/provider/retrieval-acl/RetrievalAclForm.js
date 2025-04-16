import CreatableSelect from 'react-select/creatable'
import {
    Button,
    Col,
    FormGroup,
    Input,
    InputGroup,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
} from 'reactstrap'
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
    isOpen,
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
            isOpen={isOpen}
            fade={false}
            toggle={() => setIsOpen(false)}
            size="lg"
        >
            <ModalHeader toggle={() => setIsOpen(false)}>
                {t(`${type}.title`)}
            </ModalHeader>

            <ModalBody>
                <Row className="my-3">
                    <Col xs="12" md="12">
                        <FormGroup>
                            <Label className="form-label">
                                {t(`${type}.elementToSelect.label`)}
                            </Label>

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
                        <Label className="form-label">
                            {t(`${type}.comment.label`)}
                        </Label>
                        <InputGroup>
                            <Input
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
                            color="primary"
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
