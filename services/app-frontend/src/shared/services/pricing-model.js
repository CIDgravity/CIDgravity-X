import axios from 'axios'

import { SERVER_API_URL } from '../../config/constants'

const apiURL = `${SERVER_API_URL}/pricing-model`

export const CreatePricingModel = async (pricingModel) =>
    await axios.post(apiURL, pricingModel)

export const UpdatePricingModel = async (pricingModel) =>
    await axios.patch(`${apiURL}`, pricingModel)

export const UpdatePricingModelWithRules = async (pricingModel) =>
    await axios.patch(`${apiURL}/with-rules`, pricingModel)

export const GetAllPricingModelsWithRulesForCurrentUser = async () =>
    await axios.get(`${apiURL}/with-rules`)

export const GetAllPricingModelsWithRulesForCurrentUserPaginated = async (
    currentPage,
    pageSize
) => await axios.get(`${apiURL}/paginated/${currentPage}/${pageSize}`)

export const GetPricingModelWithRulesById = async (pricingModelId) =>
    await axios.get(`${apiURL}/${pricingModelId}`)

export const GetAllPricingModelsForCurrentUser = async () =>
    await axios.get(apiURL)

export const RemovePricingModel = async (pricingModel) =>
    await axios.delete(`${apiURL}/${pricingModel.id}`)

export const CheckIfDefaultModelExist = async () =>
    await axios.get(`${apiURL}/default-model-exist`)

export const checkAlreadyUsedName = async (name) =>
    await axios.post(`${apiURL}/check-used-name`, name)
