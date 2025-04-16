import { getCurrentFilecoinEpoch } from '../../shared/utils/filecoinUtil'
import { convertBytesToGiB } from '../../shared/utils/file_size'
import { convertToFilecoinRate } from '../../shared/utils/fil'

import {
    StorageAcceptanceLogicCurioPipelineStatesFields,
    StorageAcceptanceLogicCurioDealStagingStatesFields,
    StorageAcceptanceLogicSealingPipelineSectorStatesFields,
    StorageAcceptanceLogicAdditionalFields
} from '../../shared/utils/storage-acceptance-logic-query-fields'

const dayjs = require('dayjs')

export const convertToDealProposal = (
    values,
    tickerPriceUsd,
    startEpochSealingBufferSettings,
    shouldConvertFromNanoFil
) => {
    // First convert a json array to a string array
    const storageAcceptanceLogicAdditionalFields =
        StorageAcceptanceLogicAdditionalFields().map(
            (element) => element['label']
        )

    const storageAcceptanceLogicCurioSectorStates =
        StorageAcceptanceLogicCurioPipelineStatesFields().map(
            (element) => element
        )

    const storageAcceptanceLogicCurioDealStagingStates =
        StorageAcceptanceLogicCurioDealStagingStatesFields().map(
            (element) => element
        )

    const sealingPipelineCurioDealStagingStates = values.sealingPipelineValuesToSimulate
    .filter(
        (item) =>
            !storageAcceptanceLogicAdditionalFields.includes(item.state) &&
            storageAcceptanceLogicCurioDealStagingStates.includes(item.state) && item.category === 'curioDealStagingStates'
    )
    .reduce(
        (obj, item) =>
            Object.assign(obj, { [item.state]: parseInt(item.value) }),
        {}
    )

    const sealingPipelineCurioRunningSectorStates = values.sealingPipelineValuesToSimulate
    .filter(
        (item) =>
            !storageAcceptanceLogicAdditionalFields.includes(item.state) &&
            storageAcceptanceLogicCurioSectorStates.includes(item.state) && item.category === 'curioRunning'
    )
    .reduce(
        (obj, item) =>
            Object.assign(obj, { [item.state]: parseInt(item.value) }),
        {}
    )

    const sealingPipelineCurioPendingSectorStates = values.sealingPipelineValuesToSimulate
    .filter(
        (item) =>
            !storageAcceptanceLogicAdditionalFields.includes(item.state) &&
            storageAcceptanceLogicCurioSectorStates.includes(item.state) && item.category === 'curioPending'
    )
    .reduce(
        (obj, item) =>
            Object.assign(obj, { [item.state]: parseInt(item.value) }),
        {}
    )

    const sealingPipelineCurioFailedSectorStates = values.sealingPipelineValuesToSimulate
    .filter(
        (item) =>
            !storageAcceptanceLogicAdditionalFields.includes(item.state) &&
            storageAcceptanceLogicCurioSectorStates.includes(item.state) && item.category === 'curioFailed'
    )
    .reduce(
        (obj, item) =>
            Object.assign(obj, { [item.state]: parseInt(item.value) }),
        {}
    )

    const additionalFieldsProposalData = values.sealingPipelineValuesToSimulate
        .filter(
            (item) =>
                !StorageAcceptanceLogicSealingPipelineSectorStatesFields().includes(
                    item.state
                )
        )
        .reduce((obj, item) => {
            return item.state === 'ReceivedOnDatetime'
                ? Object.assign(obj, {
                      [item.state]: dayjs(item.value * 1000).unix(),
                  })
                : Object.assign(obj, { [item.state]: parseInt(item.value) })
        }, {})

    // We will send directly a CIDgravity standardized proposal to deal filter
    const pieceCID = { '/': 'cidgravity_playground' }
    const proposalCID = { '/': 'cidgravity_playground' }
    const clientSignature = { Type: 2, Data: 'cidgravity_playground' }
    const currentFilecoinEpoch = getCurrentFilecoinEpoch()

    // Convert the price depending on selectedCurrency
    // attofil_gib_epoch: price is already in attoFil but we need to multiplicate by size in GiB (in real deal proposal the price is for size / epoch)
    // usd_tib_month: use the specific function to convert to attoFil / GiB / Epoch and apply same conversion than other unit
    let dealPrice = values.dealPrice

    if (values.dealPriceCurrency === 'usd_tib_month') {
        dealPrice = convertToFilecoinRate(values.dealPrice, tickerPriceUsd)
    }

    const priceAsAttoFil = Math.ceil(dealPrice * convertBytesToGiB(values.dealSize))

    // For the start epoch, we need to add few epochs to avoid rejecting due to start epoch sealing bufer checks
    // For now 2880 epochs should be enough (2880 epochs = 24 hours)
    const epochsAddedToAvoidSealingBufferChecks = 2880

    // We need to add "fake" values at the moment due to field checker in deal filter
    const proposal = {
        PieceCID: pieceCID,
        PieceSize: values.dealSize,
        VerifiedDeal: values.dealVerified,
        Client: values.fromAddress,
        Provider: 'cidgravity_playground',
        Label: 'cidgravity_playground',
        StartEpoch:
            currentFilecoinEpoch +
            startEpochSealingBufferSettings +
            epochsAddedToAvoidSealingBufferChecks,
        EndEpoch:
            currentFilecoinEpoch +
            epochsAddedToAvoidSealingBufferChecks +
            startEpochSealingBufferSettings +
            values.dealDuration,
        StoragePricePerEpoch: priceAsAttoFil,
        ProviderCollateral: '0',
        ClientCollateral: '0',
    }

    return {
        Proposal: proposal,
        ClientSignature: clientSignature,
        ProposalCID: proposalCID,
        FastRetrieval: false,
        DealType: 'storage',
        FormatVersion: '2.2.0',
        Agent: 'playground-curio',
        Transfer: {
            Size: values.dealSize,
            Type: values.dealTransferType
        },
        Additional: additionalFieldsProposalData,
        CurioSealingPipelineState: {
            DealStagingStates: sealingPipelineCurioDealStagingStates,
            Pipeline: {
                IsSnap: false,
                UnderBackPressure: false,
                States: {
                    Running: sealingPipelineCurioRunningSectorStates,
                    Pending: sealingPipelineCurioPendingSectorStates,
                    Failed: sealingPipelineCurioFailedSectorStates
                }
            }
        }
    }
}

export const ParseStandardizedProposalToAcceptanceLogicValues = (deal, standardizedProposal) => {
    const results = []

    // First, add one field called ReceivedOnDatetime based on receivedOn proposal field */
    results.push({ label: 'ReceivedOnDatetime', state: 'ReceivedOnDatetime', value: dayjs(deal.receivedOn).unix() })

    // get curio pipeline states
    const curioDealStagingStates = standardizedProposal.CurioSealingPipelineState.DealStagingStates
    const curioPipelineRunningStates = standardizedProposal.CurioSealingPipelineState.Pipeline.States.Running
    const curioPipelinePendingStates = standardizedProposal.CurioSealingPipelineState.Pipeline.States.Pending
    const curioPipelineFailedStates = standardizedProposal.CurioSealingPipelineState.Pipeline.States.Failed

    for (let i in curioDealStagingStates) {
        if (curioDealStagingStates[i] !== 0) {
            results.push({ label: 'curioStagingStates.' + i, state:  i, value: curioDealStagingStates[i], category: 'curioDealStagingStates' })
        }
    }

    for (let i in curioPipelineRunningStates) {
        if (curioPipelineRunningStates[i] !== 0) {
            results.push({ label: 'curioRunning.' + i, state: i, value: curioPipelineRunningStates[i], category: 'curioRunning' })
        }
    }

    for (let i in curioPipelinePendingStates) {
        if (curioPipelinePendingStates[i] !== 0) {
            results.push({ label: 'curioPending.' + i, state: i, value: curioPipelinePendingStates[i], category: 'curioPending' })
        }
    }   

    for (let i in curioPipelineFailedStates) {
        if (curioPipelineFailedStates[i] !== 0) {
            results.push({ label: 'curioFailed.' + i, state: i, value: curioPipelineFailedStates[i], category: 'curioFailed' })
        }
    }

    // get additionnal fields (fil price, base fee ...)
    // remove fields that no need to appear on frontend
    const additionalFields = standardizedProposal.Additional

    // because of query builder configuration, we need to convert the array firsts
    const storageAcceptanceLogicAdditionalFields = StorageAcceptanceLogicAdditionalFields().map((element) => element['label'])

    // For Additional fields in Playground, we will ignore ReceivedOnTimeOfDayUTC and ReceivedOnDayOfWeek */
    for (let i in additionalFields) {
        if (storageAcceptanceLogicAdditionalFields.includes(i) && i !== 'ReceivedOnTimeOfDayUTC' && i !== 'ReceivedOnDayOfWeek') {
            results.push({ label: i, state: i, value: additionalFields[i] })
        }
    }

    return results
}

export const getPaddingForDealSize = (value) => {
    return Math.pow(2, Math.ceil(Math.log2(value)))
}
