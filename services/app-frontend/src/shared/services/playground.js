import {
    StorageAcceptanceLogicCurioDealStagingStatesFields,
    StorageAcceptanceLogicCurioPipelineStatesFields,
    StorageAcceptanceLogicAdditionalFields,
} from '../utils/storage-acceptance-logic-query-fields'

// Curio
export const PlaygroundCurioPipelineRunningStatesValues = (t) => {
    return StorageAcceptanceLogicCurioPipelineStatesFields().filter(state => state !== "Any").map(
        function (value) {
            return {
                label: t('sealingpipeline.fields.curioRunning.' + value),
                value: value,
                category: 'curioRunning'
            }
        }
    )
}

export const PlaygroundCurioPipelinePendingStatesValues = (t) => {
    return StorageAcceptanceLogicCurioPipelineStatesFields().filter(state => state !== "Any").map(
        function (value) {
            return {
                label: t('sealingpipeline.fields.curioPending.' + value),
                value: value,
                category: 'curioPending'
            }
        }
    )
}

export const PlaygroundCurioPipelineFailedStatesValues = (t) => {
    return StorageAcceptanceLogicCurioPipelineStatesFields().filter(state => state !== "Any").map(
        function (value) {
            return {
                label: t('sealingpipeline.fields.curioFailed.' + value),
                value: value,
                category: 'curioFailed'
            }
        }
    )
}

export const PlaygroundCurioDealStagingStatesValues = (t) => {
    return StorageAcceptanceLogicCurioDealStagingStatesFields().map(
        function (value) {
            return {
                label: t('sealingpipeline.fields.curioStagingStates.' + value),
                value: value,
                category: 'curioDealStagingStates'
            }
        }
    )
}

/* 
    For Additional fields in Playground, we will not create ReceivedOnTimeOfDayUTC and ReceivedOnDayOfWeek
    but only one field, with type datetime to select the datetime at which the proposal was received/processed.
*/
export const PlaygroundOtherAcceptanceLogicValues = (t) => {
    return StorageAcceptanceLogicAdditionalFields()
        .filter(
            (value) =>
                value.label !== 'ReceivedOnTimeOfDayUTC' &&
                value.label !== 'ReceivedOnDayOfWeek'
        )
        .map(function (value) {
            return {
                label: t('sealingpipeline.fields.' + value.label),
                value: value.label,
            }
        })
}

export const GetPlaygroundAccepanceLogicFields = (selectedValues, t) => {
    const valuesToFilter = selectedValues.map((element) => element.state)

    const options = [
        {
            label: t('sealingpipeline.fields.curioDealStatingStatesTitle'),
            options: PlaygroundCurioDealStagingStatesValues(t).filter(
                (element) => valuesToFilter.indexOf(element.label) <= -1
            ),
        },
        {
            label: t('sealingpipeline.fields.curioPipelineStatesRunningTitle'),
            options: PlaygroundCurioPipelineRunningStatesValues(t).filter(
                (element) => valuesToFilter.indexOf(element.label) <= -1
            ),
        },
        {
            label: t('sealingpipeline.fields.curioPipelineStatesPendingTitle'),
            options: PlaygroundCurioPipelinePendingStatesValues(t).filter(
                (element) => valuesToFilter.indexOf(element.label) <= -1
            ),
        },
        {
            label: t('sealingpipeline.fields.curioPipelineStatesFailedTitle'),
            options: PlaygroundCurioPipelineFailedStatesValues(t).filter(
                (element) => valuesToFilter.indexOf(element.label) <= -1
            ),
        },
        {
            label: t('sealingpipeline.fields.additionalFieldsTitle'),
            options: [
                ...PlaygroundOtherAcceptanceLogicValues(t).filter(
                    (element) => valuesToFilter.indexOf(element.label) <= -1
                ),
            ],
        },
    ]

    // Here, we will create a new field for timestamp in additional fields section
    // this will combine day of wek, and time of the day fields into single field.
    if (valuesToFilter.indexOf('ReceivedOnDatetime') <= -1) {
        options[1].options.push({
            label: t('sealingpipeline.fields.ReceivedOnDatetime'),
            value: 'ReceivedOnDatetime',
        })
    }

    return options
}
