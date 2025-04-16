import { PureComponent } from 'react'

import { withAuth0 } from '@auth0/auth0-react'
import { withTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button, Col, Container, Row } from 'reactstrap'

import {
    checkAlreadyUsedName,
    CheckIfDefaultModelExist,
    CreatePricingModel,
    GetPricingModelWithRulesById,
    UpdatePricingModelWithRules,
} from 'shared/services/pricing-model'

import { GetLatestMessariTicker } from 'shared/services/integration'
import { Loader } from 'shared/components'
import {
    fromBytesToReadableFormat,
    toReadableDurationFormat,
    toReadableDurationFormatNew,
    toReadableSize,
} from 'shared/utils/file_size'
import {
    checkIfRulesAreFilled,
    checkIfRulesAreValid,
    convertRulesValuesToCorrectFormat,
} from 'shared/utils/rules-models'
import { generateRandomString } from 'shared/utils/string'

import { computePriceEquivalence, convertToFilecoinRate } from 'shared/utils/fil'

import CreatePricingModelForm from './CreatePricingModelForm'

class CreatePricingModelContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            isNew: false,
            isNewDefault: false,
            isLoading: true,
            isError: false,
            selectedFallOnDefaultValue: true,
            selectedPricingModelCurrency: 'usd_tib_month', 
            selectedPricePlaceholder: '',
            ruleList: [
                {
                    uniqueId: generateRandomString(10),
                    transferType: 'any',
                    verified: 'any',
                    price: '',
                    minSize: '256',
                    minSizeUnit: 'B',
                    maxSize: '32',
                    maxSizeUnit: 'GiB',
                    minDuration: '180',
                    minDurationUnit: 'Days',
                    maxDuration: '1278',
                    maxDurationUnit: 'Days',
                    position: 1,
                    archived: false,
                },
            ],
            messariTicker: {
                data: {
                    market_data: {
                        price_usd: null,
                        price_btc: null,
                        price_eth: null
                    }
                },
                status: {
                    timestamp: null
                }
            },
            pricingModel: {
                uniqueId: '',
                id: '',
                name: '',
                createdBy: '',
                default: false,
                rules: [],
                archived: false,
                fallOnDefault: true,
                currency: '',
            },
        }
    }

    async componentDidMount() {
        await this.loadMessariTickerData()

        if (this.props.match.params.pricingModelId === 'new') {
            try {
                const defaultModelExist = await CheckIfDefaultModelExist()

                if (!defaultModelExist.data) {
                    this.setState({ isNewDefault: true, isLoading: false })
                }
            } catch (error) {
                console.log(error)
            }

            this.setState({ isNew: true, isLoading: false })
        } else {
            try {
                const response = await GetPricingModelWithRulesById(
                    this.props.match.params.pricingModelId
                )

                if (response.data) {
                    const { messariTicker } = this.state;
                    
                    this.setState({
                        pricingModel: {
                            ...response.data,
                        },
                        ruleList: response.data.rules.map((rule) => ({
                            ...rule,
                            price: rule.price,
                            price_for_30days_fil: response.data.currency === 'attofil_gib_epoch' ? computePriceEquivalence(rule.price, "FIL") : -1,
                            price_for_30days_usd: response.data.currency === 'attofil_gib_epoch' ? computePriceEquivalence(rule.price, "USD", messariTicker.data.market_data.price_usd) : -1,
                            price_fil_per_gib_per_epoch: response.data.currency === 'usd_tib_month' ? convertToFilecoinRate(rule.price, messariTicker.data.market_data.price_usd) : -1,
                            minDuration: toReadableDurationFormat(rule.minDuration)[0],
                            minDurationUnit: toReadableDurationFormat(rule.minDuration)[1],
                            maxDuration: toReadableDurationFormat(rule.maxDuration)[0],
                            maxDurationUnit: toReadableDurationFormat(rule.maxDuration)[1],
                            minSize: fromBytesToReadableFormat(rule.minSize)[0],
                            maxSize: fromBytesToReadableFormat(rule.maxSize)[0],
                            minSizeUnit: fromBytesToReadableFormat(rule.minSize)[1],
                            maxSizeUnit: fromBytesToReadableFormat(rule.maxSize)[1],
                        })),

                        selectedPricingModelCurrency: response.data.currency,
                        selectedFallOnDefaultValue: response.data.fallOnDefault,
                        isLoading: false,
                        isEditingDefault: response.data.default,
                    })
                } else {
                    this.setState({ isError: true, isLoading: false })
                }
            } catch (error) {
                console.log(error)
                this.setState({ isError: true, isLoading: false })
            }
        }
    }

    loadMessariTickerData = async () => {
        try {
            const response = await GetLatestMessariTicker()
            this.setState({ messariTicker: response.data })
        } catch (error) {
            this.setState({ error: true })
        }
    }

    handleValidSubmit = async (values) => {
        const {
            ruleList,
            isNewDefault,
            isNew,
            pricingModel,
            selectedFallOnDefaultValue,
            selectedPricingModelCurrency,
        } = this.state
        const { t } = this.props

        // First (in edit and creation case) check if client name is available
        const nameToCheck = { value: values.name }
        const modelNameAlreadyUsed = await checkAlreadyUsedName(nameToCheck)

        // Prepare the rules to the good values (easier to compare and check everythings)
        const rulesConverted = convertRulesValuesToCorrectFormat(ruleList)

        if (ruleList.length > 0) {
            if (checkIfRulesAreFilled(ruleList)) {
                // Check rule one by one to verify that values are valid
                // e.g min size, max size
                try {
                    checkIfRulesAreValid(selectedPricingModelCurrency, rulesConverted)
                } catch (error) {
                    return { status: false, message: error.toString() }
                }

                if (isNew || isNewDefault) {
                    // Check if pricing model name isn't already used
                    if (!modelNameAlreadyUsed.data) {
                        const pricingModelToCreate = {
                            name: values.name,
                            default: isNewDefault,
                            rules: rulesConverted,
                            fallOnDefault: selectedFallOnDefaultValue,
                            currency: selectedPricingModelCurrency,
                        }

                        try {
                            const response = await CreatePricingModel(
                                pricingModelToCreate
                            )

                            if (response) {
                                return { status: true, message: '' }
                            } else {
                                return {
                                    status: false,
                                    message: t(
                                        'validation.onCreatePricingModel'
                                    ),
                                }
                            }
                        } catch (error) {
                            console.log(error)
                            return {
                                status: false,
                                message: t('validation.onCreatePricingModel'),
                            }
                        }
                    } else {
                        return {
                            status: false,
                            message: t('validation.isNameAlreadyUsed'),
                        }
                    }
                } else {
                    // It's an update, so check duplicate name only if name has been changed
                    if (values.name !== pricingModel.name) {
                        if (modelNameAlreadyUsed.data) {
                            return {
                                status: false,
                                message: t('validation.isNameAlreadyUsed'),
                            }
                        }
                    }

                    const pricingModelToUpdate = {
                        ...pricingModel,
                        name: values.name,
                        default: isNewDefault,
                        fallOnDefault: selectedFallOnDefaultValue,
                        currency: selectedPricingModelCurrency,
                        rules: convertRulesValuesToCorrectFormat(ruleList),
                    }

                    try {
                        const response = await UpdatePricingModelWithRules(
                            pricingModelToUpdate
                        )

                        if (response) {
                            return { status: true, message: '' }
                        } else {
                            return {
                                status: false,
                                message: t('validation.onUpdatePricingModel'),
                            }
                        }
                    } catch (error) {
                        console.log(error)
                        return {
                            status: false,
                            message: t('validation.onUpdatePricingModel'),
                        }
                    }
                }
            } else {
                return {
                    status: false,
                    message: t('validation.hasNotAllRulesBeenFilled'),
                }
            }
        } else {
            return {
                status: false,
                message: t('validation.hasNoRule'),
            }
        }
    }

    handleRulesReordered = (rulesReordered) => {
        const items = Array.from(this.state.ruleList)
        const [reorderedItem] = items.splice(rulesReordered.source.index, 1)
        items.splice(rulesReordered.destination.index, 0, reorderedItem)
        this.setState({ ruleList: items })
    }

    handleRuleInputChange = (e, index) => {
        const { messariTicker, selectedPricingModelCurrency } = this.state;
        const { name, value } = e.target
        const list = [...this.state.ruleList]

        list[index][name] = value

        // if trying to update the price, update the conversion in TiB / 30j value
        if (name === "price") {
            if (selectedPricingModelCurrency === 'attofil_gib_epoch') {
                list[index]["price_for_30days_fil"] = computePriceEquivalence(value, "FIL")
                list[index]["price_for_30days_usd"] = computePriceEquivalence(value, "USD", messariTicker.data.market_data.price_usd)

            } else if (selectedPricingModelCurrency === 'usd_tib_month') {
                list[index]["price_fil_per_gib_per_epoch"] = convertToFilecoinRate(value, messariTicker.data.market_data.price_usd)
            }
        }

        this.setState({ ruleList: list })
    }

    handleVerifiedStatusChange = (e, index) => {
        const list = [...this.state.ruleList]
        list[index]['verified'] = e.target.value
        this.setState({ ruleList: list })
    }

    handleRuleSizeUnitChange = (type, e, index) => {
        const { value } = e.target
        const list = [...this.state.ruleList]

        // Handle the edit model where unit will be undefined
        if (!list[index]['minSizeUnit']) {
            list[index]['minSizeUnit'] = 'B'
        }

        if (!list[index]['maxSizeUnit']) {
            list[index]['maxSizeUnit'] = 'B'
        }

        if (type === 'min' && list[index]['minSizeUnit'] !== value) {
            list[index]['minSize'] = parseInt(
                toReadableSize(
                    list[index]['minSizeUnit'],
                    value,
                    list[index]['minSize']
                ).toFixed(4)
            )
            list[index]['minSizeUnit'] = value
        } else if (type === 'max' && list[index]['maxSizeUnit'] !== value) {
            list[index]['maxSize'] = parseInt(
                toReadableSize(
                    list[index]['maxSizeUnit'],
                    value,
                    list[index]['maxSize']
                ).toFixed(4)
            )
            list[index]['maxSizeUnit'] = value
        }

        this.setState({ ruleList: list })
    }

    handleRuleDurationUnitChange = (type, e, index) => {
        const { value } = e.target
        const list = [...this.state.ruleList]

        // Handle the edit model where unit will be undefined
        if (!list[index]['minDurationUnit']) {
            list[index]['minDurationUnit'] = 'Days'
        }

        if (!list[index]['maxDurationUnit']) {
            list[index]['maxDurationUnit'] = 'Days'
        }

        if (type === 'min' && list[index]['minDurationUnit'] !== value) {
            list[index]['minDuration'] = toReadableDurationFormatNew(
                list[index]['minDurationUnit'],
                value,
                list[index]['minDuration']
            )
            list[index]['minDurationUnit'] = value
        } else if (type === 'max' && list[index]['maxDurationUnit'] !== value) {
            list[index]['maxDuration'] = toReadableDurationFormatNew(
                list[index]['maxDurationUnit'],
                value,
                list[index]['maxDuration']
            )
            list[index]['maxDurationUnit'] = value
        }

        this.setState({ ruleList: list })
    }

    handleAddRule = () => {
        this.setState({
            ruleList: [
                ...this.state.ruleList,
                {
                    uniqueId: generateRandomString(10),
                    verified: 'any',
                    transferType: 'any',
                    price: '',
                    minSize: '256',
                    minSizeUnit: 'B',
                    maxSize: '32',
                    maxSizeUnit: 'GiB',
                    minDuration: '180',
                    minDurationUnit: 'Days',
                    maxDuration: '1278',
                    maxDurationUnit: 'Days',
                    position: this.state.ruleList.length + 1,
                    archived: false,
                },
            ],
        })
    }

    handleRemoveRule = (index) => {
        const ruleList = [...this.state.ruleList]
        ruleList.splice(index, 1)
        this.setState({ ruleList })
    }

    handleFallOnDefaultChange = (checked) => {
        this.setState({ selectedFallOnDefaultValue: checked })
    }

    handlePricingModelCurrencyChange = (selected) => {
        this.setState({
            selectedPricingModelCurrency:
                selected !== null ? selected.value : null,
        })
    }

    render() {
        const { t } = this.props
        const {
            ruleList,
            isNewDefault,
            isNew,
            pricingModel,
            isLoading,
            isError,
            selectedFallOnDefaultValue,
            selectedPricingModelCurrency,
        } = this.state

        return (
            <Container>
                {!isLoading && !isError ? (
                    <>
                        <Row className="mt-4 ms-2">
                            <Col xs={12} md={12}>
                                {isNewDefault ? (
                                    <h1>{t('title.newDefault')}</h1>
                                ) : isNew ? (
                                    <h1>{t('title.new')}</h1>
                                ) : (
                                    <h1>{t('title.edit')}</h1>
                                )}
                            </Col>
                        </Row>

                        <Row className="mt-4">
                            <Col xs={12} md={12}>
                                <CreatePricingModelForm
                                    onSubmit={this.handleValidSubmit}
                                    ruleList={ruleList}
                                    onAddRule={this.handleAddRule}
                                    onRemoveRule={this.handleRemoveRule}
                                    onRuleInputChange={
                                        this.handleRuleInputChange
                                    }
                                    onVerifiedStatusChange={
                                        this.handleVerifiedStatusChange
                                    }
                                    onRulesReordered={this.handleRulesReordered}
                                    onSizeUnitChange={
                                        this.handleRuleSizeUnitChange
                                    }
                                    onDurationUnitChange={
                                        this.handleRuleDurationUnitChange
                                    }
                                    isNew={isNew}
                                    isNewDefault={isNewDefault}
                                    pricingModel={pricingModel}
                                    handleFallOnDefaultChange={
                                        this.handleFallOnDefaultChange
                                    }
                                    selectedFallOnDefaultValue={
                                        selectedFallOnDefaultValue
                                    }
                                    handlePricingModelCurrencyChange={
                                        this.handlePricingModelCurrencyChange
                                    }
                                    selectedPricingModelCurrency={
                                        selectedPricingModelCurrency
                                    }
                                />
                            </Col>
                        </Row>
                    </>
                ) : !isLoading && isError ? (
                    <Row className="mt-4">
                        <Col xs={12} md={12}>
                            {isNewDefault ? (
                                <h1>{t('title.newDefault')}</h1>
                            ) : isNew ? (
                                <h1>{t('title.new')}</h1>
                            ) : (
                                <h1>{t('title.edit')}</h1>
                            )}
                        </Col>

                        <Col xs={12} md={12}>
                            <section className="card-form mt-4">
                                {t(
                                    'error.isPricingModelNotExistingOrNotAllowed'
                                )}
                                <br />
                                <br />
                                <Button
                                    tag={Link}
                                    to="../pricing-model"
                                    type="submit"
                                    color="danger"
                                    size="1x"
                                    className="me-4"
                                >
                                    <span className="as--light">
                                        {t('button.backToClientList')}
                                    </span>
                                </Button>
                            </section>
                        </Col>
                    </Row>
                ) : (
                    <Loader />
                )}
            </Container>
        )
    }
}

export default withAuth0(
    withTranslation('CreatePricingModelContainer')(CreatePricingModelContainer)
)
