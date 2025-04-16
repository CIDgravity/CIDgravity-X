import React, { PureComponent } from 'react'

import { Button } from 'reactstrap'
import { isMobile } from 'react-device-detect'
import { Field, Form, withFormik } from 'formik'
import { withTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { withRouter } from 'react-router'
import { convertToFIL } from 'shared/utils/fil'

import * as yup from 'yup'
import ReactTooltip from 'react-tooltip'

class SettingsMaxPublishDealsFee extends PureComponent {
    render() {
        const { errors, touched, isSubmitting, t } = this.props

        return (
            <Form enableReinitialize>
                <div className="card p-4" style={!isMobile ? { height: 200 + 'px' } : {}}>
                    <h5 className="mb-4">
                        {t('title')}
                        <i
                            style={{ marginTop: '4px' }}
                            data-for="maxPublishDealsFee"
                            data-tip={t('tooltip')}
                            className="ms-4 fas fa-info-circle"
                        />

                        <ReactTooltip place="bottom" id="maxPublishDealsFee" html={true} />
                    </h5>

                    <Field
                        id="max-publish-deals-fee"
                        className="form-control"
                        name="maxPublishDealsFee"
                    />

                    {touched.maxPublishDealsFee && errors.maxPublishDealsFee && (
                        <small className="text-danger">
                            {t(`${errors.maxPublishDealsFee}`)}
                        </small>
                    )}

                    <div className="text-end mt-4">
                        <Button
                            disabled={ Array.isArray(errors) || Object.values(errors).toString() !== '' || isSubmitting}
                            type="submit"
                            className="custom-cidg-button"
                        >
                            {t('button.save')}
                        </Button>
                    </div>
                </div>
            </Form>
        )
    }
}

const formikConfig = {
    displayName: 'MaxPublishDealsFee',

    mapPropsToValues: ({ currentAddress }) => ({
        maxPublishDealsFee: convertToFIL(currentAddress.settings.maxPublishDealsFee)
    }),

    validationSchema: () =>
        yup.object().shape({
            maxPublishDealsFee: yup
                .number()
                .typeError('validation.isInvalidValue')
                .min(0, 'validation.isNotPositiveValue')
                .required('validation.isRequiredValue')
        }),

    handleSubmit: (values, { props, setSubmitting }) => {
        props
            .onSubmit(values)
            .then((returnValue) => {
                const { status, message } = returnValue

                if (status) {
                    setSubmitting(false)
                } else {
                    setSubmitting(false)
                    toast.error(message)
                }
            })
            .catch((e) => {
                console.log(e)
                setSubmitting(false)
                toast.error(e)
            })
    },
}

export default withRouter(
    withFormik(formikConfig)(
        withTranslation('SettingsMaxPublishDealsFee')(SettingsMaxPublishDealsFee)
    )
)
