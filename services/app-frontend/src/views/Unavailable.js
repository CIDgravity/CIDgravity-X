import { Row, Col } from 'reactstrap'
import { useTranslation, Trans } from 'react-i18next'
export const Unavailable = ({ errorMessage }) => {
    const { t } = useTranslation('Unavailable') // second param ignored i18n
    return (
        <div className="error">
            <img
                className="logo-cidgravity"
                src="/images/CIDgravity-Logo-Transparent.png"
                alt="CID Gravity"
            />

            <Row className="lead mt-4 mb-4">
                <h1>{t('title')}</h1>

                <p className="lead">
                    <Trans t={t} i18nKey="explanation">
                        Our operations team is working on bringing it back
                        online.
                        <br />
                    </Trans>
                    <Trans default="action" t={t} i18nKey="action">
                        Try to reload this page or contact our support team
                        <br />
                        <br />
                        {{ errorMessage }}
                    </Trans>
                </p>
            </Row>

            <Row className="lead-btn">
                <Col></Col>

                <Col className="mt-4">
                    <i className="fas fa-envelope-open fa-2x mb-2" />
                    <br />
                    <br />
                    <a
                        rel="noopener noreferrer"
                        href={`mailto:contact@cidgravity.com?subject=${t(
                            'button.email.subject'
                        )}`}
                        className="btn btn-secondary"
                        target="_blank"
                    >
                        {t('button.email.label')}
                    </a>
                </Col>

                <Col></Col>
            </Row>
        </div>
    )
}
