import { SESSION_STORAGE_TENANT_KEY, SESSION_STORAGE_ACCOUNT_TYPE_KEY } from '../../config/constants'

// This function will put tenant values in browser session storage
// Values can be retrieved using function called GetTenantValuesFromSessionStorage
export const SetTenantValuesInSessionStorage = (addressId, actorType) => {
    sessionStorage.setItem(SESSION_STORAGE_TENANT_KEY, addressId)
    sessionStorage.setItem(SESSION_STORAGE_ACCOUNT_TYPE_KEY, actorType)
}

// To get values, this function can be called using destructuration
// const [addressId, actorType] = GetTenantValuesFromSessionStorage();
export const GetTenantValuesFromSessionStorage = () => {
    return [sessionStorage.getItem(SESSION_STORAGE_TENANT_KEY), sessionStorage.getItem(SESSION_STORAGE_ACCOUNT_TYPE_KEY)]
}

// Return current selected address (tenantId) from session storage
export const GetSelectedAddressIdFromSessionStorage = () => {
    return sessionStorage.getItem(SESSION_STORAGE_TENANT_KEY)
}

// Return current selected address (tenantId) from session storage
export const GetSelectedAddressActorTypeFromSessionStorage = () => {
    return sessionStorage.getItem(SESSION_STORAGE_ACCOUNT_TYPE_KEY)
}