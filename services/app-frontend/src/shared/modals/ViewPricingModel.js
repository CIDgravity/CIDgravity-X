import { useTranslation, Trans } from 'react-i18next'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import ModalHeader from 'react-bootstrap/ModalHeader'
import Row from 'react-bootstrap/Row'
import {
    fromBytesToReadableFormat,
    toReadableDurationFormat,
} from '../utils/file_size'

import { formatRulePrice } from 'shared/utils/supported-currencies'

export const ViewPricingModel = ({
    isModalOpened,
    handleModal,
    pricingModel,
}) => {
    const { t } = useTranslation('ViewPricingModel') // second param ignored i18n
    return (
        <Modal
            show={isModalOpened}
            animation={false}
            onHide={handleModal}
            size="lg"
        >
            <ModalHeader closeButton>
                {t('header', { pricingModelName: pricingModel.name })}
            </ModalHeader>

            <ModalBody>
                <Row>
                    {pricingModel?.rules ? (
                        <div id="listRulesModel">
                            {pricingModel?.rules?.map((rule) => (
                                <div key={rule.id} className="card p-4 mt-4">
                                    <Row>
                                        <Col>
                                            {t('body.position', {
                                                position: rule.position,
                                            })}
                                        </Col>

                                        <Col>
                                            <strong>
                                                {t('body.type.label')}
                                            </strong>
                                            <br />
                                            {rule.verified === 'true' ? (
                                                <>
                                                    {t(
                                                        'body.type.verified.true'
                                                    )}
                                                </>
                                            ) : rule.verified === 'false' ? (
                                                <>
                                                    {t(
                                                        'body.type.verified.false'
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <>
                                                        {t(
                                                            'body.type.verified.any'
                                                        )}
                                                    </>
                                                </>
                                            )}
                                        </Col>

                                        <Col>
                                            <strong>
                                                {t('body.price.label')}
                                            </strong>
                                            <br />

                                            {
                                                formatRulePrice(
                                                    rule, 
                                                    pricingModel.currency, 
                                                    { format: true }
                                                )
                                            }
                                        </Col>
                                    </Row>

                                    <Row className="mt-4">
                                        <Col />

                                        <Col>
                                            <strong>
                                                {t('body.size.label')}
                                            </strong>
                                            <br />
                                            {fromBytesToReadableFormat(
                                                rule.minSize
                                            )}{' '}
                                            {' / '}{' '}
                                            {fromBytesToReadableFormat(
                                                rule.maxSize
                                            )}
                                        </Col>

                                        <Col>
                                            <strong>
                                                {t('body.duration.label')}
                                            </strong>
                                            <br />
                                            {toReadableDurationFormat(
                                                rule.minDuration,
                                                true
                                            )}{' '}
                                            {' / '}{' '}
                                            {toReadableDurationFormat(
                                                rule.maxDuration,
                                                true
                                            )}
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Alert>{t('error.hasNoRule')}</Alert>
                    )}
                </Row>

                <Row className="mt-4">
                    {!pricingModel?.default ? (
                        <Col>
                            {pricingModel?.fallOnDefault ? (
                                <Trans t={t} i18nKey="body.fallback.enabled">
                                    <span>Fallback</span>
                                    <strong style={{ color: 'green' }}>
                                        Enabled
                                    </strong>
                                </Trans>
                            ) : (
                                <Trans t={t} i18nKey="body.fallback.disabled">
                                    <span>
                                        Fallback to default pricing model
                                    </span>
                                    <strong style={{ color: 'red' }}>
                                        Disabled
                                    </strong>
                                </Trans>
                            )}
                        </Col>
                    ) : (
                        <Col>
                            <Trans t={t} i18nKey="body.fallback.na">
                                <span>Fallback to default pricing model</span>
                                <strong>Not applicable</strong>
                            </Trans>
                        </Col>
                    )}
                </Row>

                <hr />

                <Row className="mt-4 mb-4">
                    <Col>
                        <h5 className="mb-4">{t('body.client.title')}</h5>

                        {pricingModel?.clients?.length !== 0 ? (
                            <ul>
                                {pricingModel?.clients?.map((client) => (
                                    <li key={client.name}>{client.name}</li>
                                ))}
                            </ul>
                        ) : (
                            <Alert>{t('body.client.pricing.noClient')}</Alert>
                        )}

                        {pricingModel?.default && (
                            <div style={{ marginTop: 50 + 'px' }}>
                                <h5 className="mb-4">
                                    {t('body.client.titleClientsWithDefault')}
                                </h5>

                                {pricingModel?.clientsWithDefault?.length !==
                                    0 && (
                                    <ul>
                                        {pricingModel?.clientsWithDefault?.map(
                                            (client) => (
                                                <li key={client.name}>{client.name}</li>
                                            )
                                        )}
                                    </ul>
                                )}

                                <Alert variant="warning">
                                    {t(
                                        'body.client.pricing.alsoApplyToUnknownClients'
                                    )}
                                </Alert>
                            </div>
                        )}
                    </Col>
                </Row>
            </ModalBody>

            <ModalFooter>
                <Button onClick={handleModal} className="custom-cidg-button">
                    {t('button.close')}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ViewPricingModel
