import React, { PureComponent } from 'react'

import Button from 'react-bootstrap/Button'
import { isMobile } from 'react-device-detect'
import { Field, Form, withFormik } from 'formik'
import { withTranslation } from 'react-i18next'

import { withRouter } from 'shared/utils/withRouter'
import { toReadableDurationFormatNew } from 'shared/utils/file_size'

import * as yup from 'yup'
import { Tooltip } from 'react-tooltip'

class SettingsStartEpochSealingBuffer extends PureComponent {
    render() {
        const { errors, touched, isSubmitting, t } = this.props

        return (
            <Form>

                <div className="card p-4" style={!isMobile ? { height: 200 + 'px' } : {}}>
                    <h5 className="mb-4">
                        {t('title')}

                        <i
                            style={{ marginTop: '4px' }}
                            data-tooltip-id="startEpochSealingBuffer"
                            data-tooltip-html={t('tooltip')}
                            className="ms-4 fas fa-info-circle"
                        />

                        <Tooltip place="bottom" id="startEpochSealingBuffer" />
                    </h5>

                    <Field
                        id="start-epoch-sealing-buffer"
                        className="form-control"
                        name="startEpochSealingBuffer"
                    />

                    {touched.startEpochSealingBuffer && errors.startEpochSealingBuffer && (
                        <small className="text-danger">
                            {t(`${errors.startEpochSealingBuffer}`)}
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
    displayName: 'StartEpochSealingBuffer',
    enableReinitialize: true,

    mapPropsToValues: ({ currentAddress }) => ({
        startEpochSealingBuffer: toReadableDurationFormatNew('Epochs', 'Hours', currentAddress.settings.startEpochSealingBuffer)
    }),

    validationSchema: () =>
        yup.object().shape({
            startEpochSealingBuffer: yup
                .number()
                .typeError('validation.isInvalidValue')
                .min(0, 'validation.isNotPositiveValue')
                .required('validation.isRequiredValue')
        }),

    handleSubmit: (values, { props, setSubmitting }) => {
        props
            .onSubmit(values)
            .then(() => {
                setSubmitting(false)
            })
            .catch((e) => {
                console.error(e)
                setSubmitting(false)
            })
    },
}

export default withRouter(
    withFormik(formikConfig)(
        withTranslation('SettingsStartEpochSealingBuffer')(SettingsStartEpochSealingBuffer)
    )
)
