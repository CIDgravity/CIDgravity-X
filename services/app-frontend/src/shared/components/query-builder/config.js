import {
    BootstrapConfig,
    BootstrapWidgets,
} from '@react-awesome-query-builder/bootstrap'
import {
    StorageAcceptanceLogicCurioPipelineStatesFields,
    StorageAcceptanceLogicCurioDealStagingStatesFields,
    StorageAcceptanceLogicSealingPipelineSectorStatesFields,
    StorageAcceptanceLogicSealingPipelineSectorStatesErrorsFields,
    StorageAcceptanceLogicAdditionalFields,
} from '../../utils/storage-acceptance-logic-query-fields'

import merge from 'lodash/merge'

export default function createConfig(t) {
    return {
        ctx: BootstrapConfig.ctx,

        conjunctions: {
            ...BootstrapConfig.conjunctions,
        },

        operators: {
            ...BootstrapConfig.operators,
            between: {
                ...BootstrapConfig.operators.between,
                label: t('queryBuilder.operators.between.label'),
                valueLabels: [
                    t('queryBuilder.operators.between.from'),
                    t('queryBuilder.operators.between.to'),
                ],
                textSeparators: [
                    t('queryBuilder.operators.between.from'),
                    t('queryBuilder.operators.between.to'),
                ],
            },
        },

        widgets: {
            ...BootstrapConfig.widgets,
            time: {
                ...BootstrapConfig.widgets.time,
                timeFormat: 'HH:mm',
                valueFormat: 'HH:mm:ss',
                defaultOperator: 'between',
            },
        },

        types: {
            ...BootstrapConfig.types,
            boolean: merge(BootstrapConfig.types.boolean, {
                widgets: {
                    boolean: {
                        widgetProps: {
                            hideOperator: true,
                            operatorInlineLabel: t(
                                'queryBuilder.types.boolean.is'
                            ),
                        },
                    },
                },
            }),
        },

        settings: {
            ...BootstrapConfig.settings,
            setOpOnChangeField: ['first'],
            removeIncompleteRulesOnLoad: false,
            removeEmptyGroupsOnLoad: false,
            canLeaveEmptyGroup: true,
            showErrorMessage: true,
            locale: {
                short: 'en',
                full: 'en-US',
            },
            valueLabel: t('queryBuilder.valueLabel'),
            valuePlaceholder: t('queryBuilder.valuePlaceholder'),
            fieldLabel: t('queryBuilder.fieldLabel'),
            operatorLabel: t('queryBuilder.operatorLabel'),
            funcLabel: t('queryBuilder.funcLabel'),
            fieldPlaceholder: t('queryBuilder.fieldPlaceholder'),
            funcPlaceholder: t('queryBuilder.funcPlaceholder'),
            operatorPlaceholder: t('queryBuilder.operatorPlaceholder'),
            lockLabel: undefined, // set undefined to remove text,
            lockedLabel: undefined, // set undefined to remove text,
            deleteLabel: undefined, // set undefined to remove text,
            delGroupLabel: undefined, // set undefined to remove text
            addGroupLabel: t('queryBuilder.addGroupLabel'),
            addRuleLabel: t('queryBuilder.addRuleLabel'),
            addSubRuleLabel: t('queryBuilder.addSubRuleLabel'),
            notLabel: t('queryBuilder.notLabel'),
            fieldSourcesPopupTitle: t('queryBuilder.fieldSourcesPopupTitle'),
            valueSourcesPopupTitle: t('queryBuilder.valueSourcesPopupTitle'),
            valueSourcesInfo: {
                value: {
                    label: t('queryBuilder.valueLabel'),
                },
                field: {
                    label: t('queryBuilder.fieldLabel'),
                    widget: 'field',
                },
                func: {
                    label: t('queryBuilder.funcLabel'),
                    widget: 'func',
                },
            },
            maxNesting: 5,
            canReorder: true,
            canRegroup: false,
            fieldSources: ['field', 'func'],
            renderField: (props) => (
                <BootstrapWidgets.BootstrapFieldSelect {...props} />
            ),
            renderValueSources: (props) => (
                <BootstrapWidgets.BootstrapValueSources {...props} />
            ),
        },

        funcs: {
            ...BootstrapConfig.funcs,
            SUM: {
                label: t('queryBuilder.functions.sum.label'),
                returnType: 'number',
                allowSelfNesting: true,
                jsonLogic: ({ firstArg, secondArg }) => ({
                    '+': [firstArg, secondArg],
                }),
                jsonLogicImport: (v) => {
                    const args = v['+']
                    return [...args]
                },
                renderSeps: [''],
                args: {
                    firstArg: {
                        label: t('queryBuilder.fieldPlaceholder'),
                        type: 'number',
                        valueSources: ['field'],
                    },
                    secondArg: {
                        label: t(
                            'queryBuilder.advancedOperationSecondArgLabel'
                        ),
                        type: 'number',
                        valueSources: ['field', 'func', 'value'],
                    },
                },
            },
            MINUS: {
                label: t('queryBuilder.functions.minus.label'),
                returnType: 'number',
                allowSelfNesting: true,
                jsonLogic: ({ firstArg, secondArg }) => ({
                    '-': [firstArg, secondArg],
                }),
                jsonLogicImport: (v) => {
                    const args = v['-']
                    return [...args]
                },
                renderSeps: [''],
                args: {
                    firstArg: {
                        label: t('queryBuilder.fieldPlaceholder'),
                        type: 'number',
                        valueSources: ['field'],
                    },
                    secondArg: {
                        label: t(
                            'queryBuilder.advancedOperationSecondArgLabel'
                        ),
                        type: 'number',
                        valueSources: ['field', 'func', 'value'],
                    },
                },
            },
            MULTIPLY: {
                label: t('queryBuilder.functions.multiply.label'),
                returnType: 'number',
                allowSelfNesting: true,
                jsonLogic: ({ firstArg, secondArg }) => ({
                    '*': [firstArg, secondArg],
                }),
                jsonLogicImport: (v) => {
                    const args = v['*']
                    return [...args]
                },
                renderSeps: [''],
                args: {
                    firstArg: {
                        label: t('queryBuilder.fieldPlaceholder'),
                        type: 'number',
                        valueSources: ['field'],
                    },
                    secondArg: {
                        label: t(
                            'queryBuilder.advancedOperationSecondArgLabel'
                        ),
                        type: 'number',
                        valueSources: ['field', 'func', 'value'],
                    },
                },
            },
            DIVIDE: {
                label: t('queryBuilder.functions.divide.label'),
                returnType: 'number',
                allowSelfNesting: true,
                jsonLogic: ({ firstArg, secondArg }) => ({
                    '/': [firstArg, secondArg],
                }),
                jsonLogicImport: (v) => {
                    const args = v['/']
                    return [...args]
                },
                renderSeps: [''],
                args: {
                    firstArg: {
                        label: t('queryBuilder.fieldPlaceholder'),
                        type: 'number',
                        valueSources: ['field'],
                    },
                    secondArg: {
                        label: t(
                            'queryBuilder.advancedOperationSecondArgLabel'
                        ),
                        type: 'number',
                        valueSources: ['field', 'func', 'value'],
                    },
                },
            },
        },

        fields: {
            'CurioSealingPipelineState.DealStagingStates': {
                label: t(`queryBuilder.fields.curioDealStatingStates.title`),
                tooltip: t(`queryBuilder.fields.curioDealStatingStates.tooltip`),
                defaultOperator: 'between',
                type: '!struct',
                subfields:
                    StorageAcceptanceLogicCurioDealStagingStatesFields().reduce(
                        (obj, item) =>
                            Object.assign(obj, {
                                [item]: {
                                    label: t(
                                        `queryBuilder.fields.curioDealStatingStates.values.${item}`
                                    ),
                                    defaultOperator: 'equal',
                                    type: 'number',
                                    operators: [
                                        'less_or_equal',
                                        'greater_or_equal',
                                        'less',
                                        'greater',
                                        'equal',
                                        'not_equal',
                                        'between',
                                        'not_between',
                                    ],
                                    excludeOperators: [
                                        'is_null',
                                        'is_not_null',
                                    ],
                                    defaultValue: 0,
                                    fieldSettings: {
                                        validateValue: (val) => {
                                            if (val < 0) {
                                                return t(
                                                    `validation.builder.positiveNumberOnly`
                                                )
                                            }

                                            if (parseInt(val) !== val) {
                                                return t(
                                                    `validation.builder.integerOnly`
                                                )
                                            }
                                        },
                                    },
                                    preferWidgets: ['number'],
                                },
                            }),
                        {}
                    ),
            },
            'CurioSealingPipelineState.Pipeline.States.Running': {
                label: t(`queryBuilder.fields.curioPipelineStatesRunning.title`),
                tooltip: t(`queryBuilder.fields.curioPipelineStatesRunning.tooltip`),
                defaultOperator: 'between',
                type: '!struct',
                subfields:
                    StorageAcceptanceLogicCurioPipelineStatesFields().reduce(
                        (obj, item) =>
                            Object.assign(obj, {
                                [item]: {
                                    label: t(
                                        `queryBuilder.fields.curioPipelineStatesRunning.values.${item}`
                                    ),
                                    value: 'toto',
                                    defaultOperator: 'equal',
                                    type: 'number',
                                    operators: [
                                        'less_or_equal',
                                        'greater_or_equal',
                                        'less',
                                        'greater',
                                        'equal',
                                        'not_equal',
                                        'between',
                                        'not_between',
                                    ],
                                    excludeOperators: [
                                        'is_null',
                                        'is_not_null',
                                    ],
                                    defaultValue: 0,
                                    fieldSettings: {
                                        validateValue: (val) => {
                                            if (val < 0) {
                                                return t(
                                                    `validation.builder.positiveNumberOnly`
                                                )
                                            }

                                            if (parseInt(val) !== val) {
                                                return t(
                                                    `validation.builder.integerOnly`
                                                )
                                            }
                                        },
                                    },
                                    preferWidgets: ['number'],
                                },
                            }),
                        {}
                    ),
            },
            'CurioSealingPipelineState.Pipeline.States.Pending': {
                label: t(`queryBuilder.fields.curioPipelineStatesPending.title`),
                tooltip: t(`queryBuilder.fields.curioPipelineStatesPending.tooltip`),
                defaultOperator: 'between',
                type: '!struct',
                subfields:
                    StorageAcceptanceLogicCurioPipelineStatesFields().reduce(
                        (obj, item) =>
                            Object.assign(obj, {
                                [item]: {
                                    label: t(
                                        `queryBuilder.fields.curioPipelineStatesPending.values.${item}`
                                    ),
                                    value: 'toto',
                                    defaultOperator: 'equal',
                                    type: 'number',
                                    operators: [
                                        'less_or_equal',
                                        'greater_or_equal',
                                        'less',
                                        'greater',
                                        'equal',
                                        'not_equal',
                                        'between',
                                        'not_between',
                                    ],
                                    excludeOperators: [
                                        'is_null',
                                        'is_not_null',
                                    ],
                                    defaultValue: 0,
                                    fieldSettings: {
                                        validateValue: (val) => {
                                            if (val < 0) {
                                                return t(
                                                    `validation.builder.positiveNumberOnly`
                                                )
                                            }

                                            if (parseInt(val) !== val) {
                                                return t(
                                                    `validation.builder.integerOnly`
                                                )
                                            }
                                        },
                                    },
                                    preferWidgets: ['number'],
                                },
                            }),
                        {}
                    ),
            },
            'CurioSealingPipelineState.Pipeline.States.Failed': {
                label: t(`queryBuilder.fields.curioPipelineStatesFailed.title`),
                tooltip: t(`queryBuilder.fields.curioPipelineStatesFailed.tooltip`),
                defaultOperator: 'between',
                type: '!struct',
                subfields:
                    StorageAcceptanceLogicCurioPipelineStatesFields().reduce(
                        (obj, item) =>
                            Object.assign(obj, {
                                [item]: {
                                    label: t(
                                        `queryBuilder.fields.curioPipelineStatesFailed.values.${item}`
                                    ),
                                    value: 'toto',
                                    defaultOperator: 'equal',
                                    type: 'number',
                                    operators: [
                                        'less_or_equal',
                                        'greater_or_equal',
                                        'less',
                                        'greater',
                                        'equal',
                                        'not_equal',
                                        'between',
                                        'not_between',
                                    ],
                                    excludeOperators: [
                                        'is_null',
                                        'is_not_null',
                                    ],
                                    defaultValue: 0,
                                    fieldSettings: {
                                        validateValue: (val) => {
                                            if (val < 0) {
                                                return t(
                                                    `validation.builder.positiveNumberOnly`
                                                )
                                            }

                                            if (parseInt(val) !== val) {
                                                return t(
                                                    `validation.builder.integerOnly`
                                                )
                                            }
                                        },
                                    },
                                    preferWidgets: ['number'],
                                },
                            }),
                        {}
                    ),
            },
            'SealingPipelineState.SectorStates': {
                label: t(`queryBuilder.fields.sectorStates.title`),
                tooltip: t(`queryBuilder.fields.sectorStates.tooltip`),
                defaultOperator: 'between',
                type: '!struct',
                subfields:
                    StorageAcceptanceLogicSealingPipelineSectorStatesFields().reduce(
                        (obj, item) =>
                            Object.assign(obj, {
                                [item]: {
                                    label: t(
                                        `queryBuilder.fields.sectorStates.values.${item}`
                                    ),
                                    defaultOperator: 'equal',
                                    type: 'number',
                                    operators: [
                                        'less_or_equal',
                                        'greater_or_equal',
                                        'less',
                                        'greater',
                                        'equal',
                                        'not_equal',
                                        'between',
                                        'not_between',
                                    ],
                                    excludeOperators: [
                                        'is_null',
                                        'is_not_null',
                                    ],
                                    defaultValue: 0,
                                    fieldSettings: {
                                        validateValue: (val) => {
                                            if (val < 0) {
                                                return t(
                                                    `validation.builder.positiveNumberOnly`
                                                )
                                            }

                                            if (parseInt(val) !== val) {
                                                return t(
                                                    `validation.builder.integerOnly`
                                                )
                                            }
                                        },
                                    },
                                    preferWidgets: ['number'],
                                },
                            }),
                        {}
                    ),
            },
            'SealingPipelineState.SectorStatesErrors': {
                label: t(`queryBuilder.fields.sectorStatesErrors.title`),
                tooltip: t(`queryBuilder.fields.sectorStatesErrors.tooltip`),
                defaultOperator: 'between',
                type: '!struct',
                subfields:
                    StorageAcceptanceLogicSealingPipelineSectorStatesErrorsFields().reduce(
                        (obj, item) =>
                            Object.assign(obj, {
                                [item]: {
                                    label: t(
                                        `queryBuilder.fields.sectorStatesErrors.values.${item}`
                                    ),
                                    defaultOperator: 'equal',
                                    type: 'number',
                                    operators: [
                                        'less_or_equal',
                                        'greater_or_equal',
                                        'less',
                                        'greater',
                                        'equal',
                                        'not_equal',
                                        'between',
                                        'not_between',
                                    ],
                                    excludeOperators: [
                                        'is_null',
                                        'is_not_null',
                                    ],
                                    defaultValue: 0,
                                    fieldSettings: {
                                        validateValue: (val) => {
                                            if (val < 0) {
                                                return t(
                                                    `validation.builder.positiveNumberOnly`
                                                )
                                            }

                                            if (parseInt(val) !== val) {
                                                return t(
                                                    `validation.builder.integerOnly`
                                                )
                                            }
                                        },
                                    },
                                    preferWidgets: ['number'],
                                },
                            }),
                        {}
                    ),
            },
            Additional: {
                label: t(`queryBuilder.fields.additionalFields.title`),
                tooltip: t(`queryBuilder.fields.additionalFields.tooltip`),
                type: '!struct',
                subfields: StorageAcceptanceLogicAdditionalFields().reduce(
                    (obj, item) =>
                        Object.assign(obj, {
                            [item.label]: {
                                label: t(
                                    `queryBuilder.fields.additionalFields.values.${item.label}`
                                ),
                                type:
                                    item.type === 'day_of_week_multiselect'
                                        ? 'multiselect'
                                        : item.type,
                                excludeOperators: item.excludeOperators
                                    ? item.excludeOperators
                                    : ['equal'],
                                operators: item.operators,
                                defaultOperator: item.defaultOperator,
                                defaultValue:
                                    item.defaultValue !== null ||
                                    item.defaultValue !== undefined
                                        ? item.defaultValue
                                        : null,
                                fieldSettings:
                                    item.type === 'day_of_week_multiselect'
                                        ? {
                                              listValues: {
                                                  monday: t(
                                                      `queryBuilder.fields.additionalFields.dayOfWeek.monday`
                                                  ),
                                                  tuesday: t(
                                                      `queryBuilder.fields.additionalFields.dayOfWeek.tuesday`
                                                  ),
                                                  wednesday: t(
                                                      `queryBuilder.fields.additionalFields.dayOfWeek.wednesday`
                                                  ),
                                                  thursday: t(
                                                      `queryBuilder.fields.additionalFields.dayOfWeek.thursday`
                                                  ),
                                                  friday: t(
                                                      `queryBuilder.fields.additionalFields.dayOfWeek.friday`
                                                  ),
                                                  saturday: t(
                                                      `queryBuilder.fields.additionalFields.dayOfWeek.saturday`
                                                  ),
                                                  sunday: t(
                                                      `queryBuilder.fields.additionalFields.dayOfWeek.sunday`
                                                  ),
                                              },
                                              allowCustomValues: false,
                                          }
                                        : item.type === 'number'
                                        ? {
                                              validateValue: (val) => {
                                                  if (val < 0) {
                                                      return t(
                                                          `validation.builder.positiveNumberOnly`
                                                      )
                                                  }

                                                  if (parseInt(val) !== val) {
                                                      return t(
                                                          `validation.builder.integerOnly`
                                                      )
                                                  }
                                              },
                                          }
                                        : item.fieldSettings
                                        ? item.fieldSettings
                                        : {},
                                preferWidgets: [item.type],
                            },
                        }),
                    {}
                ),
            },
        },
    }
}
