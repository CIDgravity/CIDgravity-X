import React from 'react'
import { Alert } from 'reactstrap'
import { useTranslation } from 'react-i18next'

const DashboardLoader = () => {
    const { t } = useTranslation('DashboardLoader') // second param ignored i18n

    return (
        <Alert color="primary" className="d-flex align-items-center">
            <i className="fas fa-stroopwafel fa-spin fa-2x" />

            <div className="ms-4">
                <h5>{t('title')}</h5>
                {t('description')}
            </div>
        </Alert>
    )
}

export default DashboardLoader
