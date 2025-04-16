import React from 'react'
import { withTranslation } from 'react-i18next'

const LoaderRequirements = () => (
    <div className="card-loader">
        <i className="fas fa-stroopwafel fa-spin fa-2x"></i>
        <h5 className="me-4 mb-2">{this.props.t('loadingRequirements')}</h5>
    </div>
)

export default withTranslation('LoaderRequirements')(LoaderRequirements)
