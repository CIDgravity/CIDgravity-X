import React, { createContext, useContext, useEffect, useMemo } from 'react'
import { useState } from 'react'
import { WizardGenericStep } from './steps/WizardGenericStep'
import { Loading } from 'shared/components'
import { Steps } from 'antd'
import { useTranslation } from 'react-i18next'

function getInitialValues(steps) {
    return steps.reduce((curr, next) => {
        curr[next.id] = next.initialValues
        return curr
    }, {})
}

const WizardFormContainerContext = createContext(null)
export function WizardFormContainer({ steps, onSubmit }) {
    const { t } = useTranslation('WizardFormContainer') // second param ignored i18n

    const [currentStep, setCurrentStep] = useState(0)
    const [values, setValues] = useState(() => getInitialValues(steps))
    const [status, setStatus] = useState(undefined)

    useEffect(() => {
        setValues(getInitialValues(steps))
        setStatus(undefined)
    }, [steps])

    const stepIds = useMemo(() => steps.map((step) => step.id), [steps])

    if (steps.length === 0) {
        return <Loading />
    }

    return (
        <div>
            <WizardFormContainerContext.Provider
                value={{
                    status,
                    setStatus,
                    values,
                    setValues,
                }}
            >
                <Steps current={currentStep + 2} items={[
                    { title: t('claimAddressStepTitle') },
                    { title: t('signMessageStepTitle') },
                    ...steps.map((step) => ({ title: step.label })),
                ]} />

                <WizardGenericStep
                    steps={stepIds}
                    step={steps[currentStep]}
                    values={values}
                    setValues={setValues}
                    setStatus={setStatus}
                    isLastStep={currentStep === steps.length - 1}
                    onSubmit={onSubmit}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                />
            </WizardFormContainerContext.Provider>
        </div>
    )
}

export function useFormWizard() {
    return useContext(WizardFormContainerContext)
}
