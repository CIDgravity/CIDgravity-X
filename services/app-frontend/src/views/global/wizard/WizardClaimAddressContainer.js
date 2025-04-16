import { useCallback } from 'react'
import { toast } from 'react-toastify'
import { WizardFormContainer } from './WizardFormContainer'
import { CompleteMinerFromScratch } from 'shared/services/wizard'
import { toReadableSize } from 'shared/utils/file_size'
import { useTranslation } from 'react-i18next'

export function WizardClaimAddressContainer({
    address,
    signedMessage,
    actorType,
    steps,
    currentForm,
    setCurrentForm,
    setToken,
    setShortAddressId,
}) {
    const { t } = useTranslation('WizardClaimAddressContainer') // second param ignored i18n

    const handleSubmit = useCallback((formValues) => {

        // Fill object with KYS/KYC information depending on actortype (account or storageminer)
        let addressInformation = {}

        if (actorType === "storageminer") {
            addressInformation =  {
                entityName: formValues.provider_information?.entityName,
                entityType: formValues.provider_information?.entityType,
                entityCountry: formValues.provider_information?.entityCountry,
                entityWebsite: formValues.provider_information?.entityWebsite,
                contactFullName: formValues.provider_information?.contactFullName,
                contactEmail: formValues.provider_information?.contactEmail,
                contactSlack: formValues.provider_information?.contactSlack,
            }
        } else if (actorType === "account") {
            addressInformation =  {
                entityName: formValues.client_informations?.entityName,
                entityType: formValues.client_informations?.entityType,
                entityCountry: formValues.client_informations?.entityCountry,
                entityWebsite: formValues.client_informations?.entityWebsite,
                contactFullName: formValues.client_informations?.contactFullName,
                contactEmail: formValues.client_informations?.contactEmail,
                contactSlack: formValues.client_informations?.contactSlack,
                datacapRequestLink: formValues.client_informations?.datacapRequestLink,
            }
        }

        // Call the API to create the address
        CompleteMinerFromScratch({
            signature: {
                address: address,
                signedMessage: signedMessage,
                friendlyName: formValues.friendly_name.name,
            },
            import: {
                shouldImport: formValues.clients_pricing?.import === 'true',
                importFrom: formValues.clients_pricing?.pricingModel ?? '',
            },
            addressInformation: addressInformation,
            settings: {
                workMode: false,
                customMessage: formValues.settings?.customMessage,
                acceptDealsFromUnknownClients:
                    formValues.settings?.acceptDealsFromUnknownClients,
                storageGlobalHourlyDealLimit:
                    formValues.settings?.storageDealsPerHour,
                storageGlobalHourlyDealSizeLimit: toReadableSize(
                    'GiB',
                    'B',
                    parseInt(formValues.settings?.dealSize, 10)
                ),
                retrievalGlobalHourlyDealLimit:
                    formValues.settings?.retrievalDealsPerHour,
            },
        })
            .then((res) => {
                setShortAddressId(res.data.addressId)
                setToken(res.data.token)
                setCurrentForm(currentForm + 1)
            })
            .catch((e) => {
                console.error(
                    'Error while submitting the form (CompleteMinerFromScratch)',
                    e
                )
                let errorMessage = t('error.isUnableToSubmitForm')
                if (e.response) {
                    if (e.response?.status === 409) {
                        switch (e.response?.data?.error) {
                            case 'address claim limit reached':
                                errorMessage = t(
                                    'validation.isAddressLimitReached'
                                )
                                break
                            case 'address already claimed':
                                errorMessage = t(
                                    'validation.isAddressAlreadyClaimed'
                                )
                                break
                            default:
                                break
                        }
                    }
                }
                toast.error(errorMessage)
            })
        },
        [t, address, actorType, signedMessage, currentForm, setCurrentForm, setToken, setShortAddressId]
    )

    return <WizardFormContainer steps={steps} onSubmit={handleSubmit} />
}
