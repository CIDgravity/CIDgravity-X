import { useTranslation, Trans } from 'react-i18next'
import {
    Alert,
    Button,
    Col,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
} from 'reactstrap'
import {
    fromBytesToReadableFormat,
    toReadableDurationFormat,
} from '../utils/file_size'

export const ViewPricingModel = ({
    isModalOpened,
    handleModal,
    pricingModel,
}) => {
    const { t } = useTranslation('ViewPricingModel') // second param ignored i18n
    return (
        <Modal
            isOpen={isModalOpened}
            fade={false}
            toggle={handleModal}
            size="lg"
        >
            <ModalHeader toggle={handleModal}>
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

                                            {pricingModel.currency === 'attofil_gib_epoch' ? (
                                                <>
                                                    {rule.price_for_30days_fil} FIL
                                                </>

                                            ) : pricingModel.currency === 'usd_tib_month' ? (
                                                <>
                                                    {rule.price_for_30days_usd} USD
                                                </>

                                            ) : null }
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
                                    <li>{client.name}</li>
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
                                                <li>{client.name}</li>
                                            )
                                        )}
                                    </ul>
                                )}

                                <Alert color="warning">
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
