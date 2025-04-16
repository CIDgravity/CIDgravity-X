import { PureComponent } from 'react'

import { withRouter } from 'react-router-dom'
import { withAuth0 } from '@auth0/auth0-react'
import { withTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button, Col, Container, Row } from 'reactstrap'
import { toast } from 'react-toastify'

import { ManualEditAcceptanceLogicFromJson } from 'shared/modals'
import { Loader } from 'shared/components'
import { Utils } from '@react-awesome-query-builder/bootstrap'
import {
    CreateAcceptanceLogic,
    UpdateAcceptanceLogic,
    CheckAlreadyUsedName,
    CheckIfDefaultLogicExist,
    GetAcceptanceLogicById,
} from 'shared/services/storage-acceptance-logic'

import CreateStorageAcceptanceLogicForm from './CreateStorageAcceptanceLogicForm'
import throttle from 'lodash/throttle'

import createConfig from 'shared/components/query-builder/config'

class CreateStorageAcceptanceLogicContainer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            isNew: false,
            isNewDefault: false,
            isLoading: true,
            isError: false,
            selectedAcceptanceLogicName: null,
            manualEditJsonLogicModalOpened: false,
            manualEditCurrentJsonContent: null,
            builderImmutableTree: null,
            builderNumberOfRules: 0,
            builderLoadedConfig: null,
            acceptanceLogic: {
                id: '',
                name: '',
                createdBy: '',
                isDefault: false,
                jsonLogic: {},
                isArchived: false,
            },
        }
    }

    async componentDidMount() {
        // Initialize the query builder and config
        const config = createConfig(this.props.t)

        this.setState({
            builderImmutableTree: Utils.checkTree(
                Utils.loadTree({ id: Utils.uuid(), type: 'group' }),
                config
            ),
            builderLoadedConfig: config,
        })

        // Check if param contains id to edit storage acceptance logic or not
        if (this.props.match.params.acceptanceLogicId === 'new') {
            try {
                const defaultLogicExist = await CheckIfDefaultLogicExist()

                if (!defaultLogicExist.data) {
                    this.setState({ isNewDefault: true, isLoading: false })
                }
            } catch (error) {
                console.log(error)
            }

            this.setState({ isNew: true, isLoading: false })
        } else {
            try {
                const response = await GetAcceptanceLogicById(
                    this.props.match.params.acceptanceLogicId
                )

                if (response.data) {
                    this.setState({
                        acceptanceLogic: { ...response.data },
                        selectedAcceptanceLogicName: response.data.name,
                        isLoading: false,
                    })

                    // Call the method to load the jsonLogic into the builer
                    this.loadAcceptanceLogicLogicToBuilder()
                }
            } catch (error) {
                console.log(error)
                this.setState({ isError: true, isLoading: false })
            }
        }
    }

    loadAcceptanceLogicLogicToBuilder = () => {
        const { acceptanceLogic, builderLoadedConfig } = this.state

        if (
            acceptanceLogic.jsonLogic !== null ||
            acceptanceLogic.jsonLogic ||
            undefined
        ) {
            const builderTree = Utils.loadFromJsonLogic(
                acceptanceLogic.jsonLogic,
                builderLoadedConfig
            )

            this.setState({
                builderImmutableTree: builderTree,
                builderNumberOfRules:
                    Utils.TreeUtils.getTotalRulesCountInTree(builderTree),
            })
        }
    }

    // Use throttle for better performances
    handleUpdateBuilderResult = throttle((immutableTree, config) => {
        this.setState({
            builderImmutableTree: immutableTree,
            builderNumberOfRules:
                Utils.TreeUtils.getTotalRulesCountInTree(immutableTree),
            builderLoadedConfig: config,
        })
    }, 100)

    // Save the updated tree, will be save using state while submitting the model
    handleOnChangeJsonLogicBuilder = (immutableTree, config) => {
        this.handleUpdateBuilderResult(immutableTree, config)
    }

    handleSaveModelFromBuilder = async () => {
        const { t } = this.props
        const {
            acceptanceLogic,
            isNew,
            isNewDefault,
            builderImmutableTree,
            builderLoadedConfig,
            selectedAcceptanceLogicName,
        } = this.state

        // First check inputs format (we can't use formik here due to builder configuration)
        // Input name : not empty and valid regexp
        if (
            selectedAcceptanceLogicName === '' ||
            selectedAcceptanceLogicName === null
        ) {
            toast.error(t('validation.name.required'))
            return
        }

        // Convert the builder result to jsonLogic format
        const builderModelAsJsonLogic = Utils.jsonLogicFormat(
            builderImmutableTree,
            builderLoadedConfig
        ).logic

        // Builder: run validation
        // If error, display always the first error until there is no error
        // For complete list of errors available, check this link
        // https://github.com/ukrbublik/react-awesome-query-builder/blob/master/packages/core/modules/i18n/validation/constains.js
        const treeErrors = Utils.validateTree(builderImmutableTree, builderLoadedConfig)

        // If error is EMPTY_QUERY, means passthrought logic, so not fire an error in this case
        if (treeErrors.length > 0) {
            if (treeErrors[0].errors.length > 0) {
                if (treeErrors[0].errors[0].key !== "EMPTY_QUERY") {
                    toast.error(this.getTreeErrorMessageFormatted(treeErrors[0]))
                    return
                }
            }
        }

        // Check if acceptance logic name isn't already used
        const nameToCheck = { value: selectedAcceptanceLogicName }
        const logicNameAlreadyUsed = await CheckAlreadyUsedName(nameToCheck)

        // Finally, create/update the acceptance logic in backend side
        if (isNew || isNewDefault) {
            // New: check if name isn't already used
            if (logicNameAlreadyUsed.data) {
                toast.error(t('validation.name.alreadyUsed'))
                return
            }

            const acceptanceLogicToCreate = {
                name: selectedAcceptanceLogicName,
                isDefault: isNewDefault,
                jsonLogic: builderModelAsJsonLogic,
            }

            try {
                const response = await CreateAcceptanceLogic(
                    acceptanceLogicToCreate
                )

                if (response) {
                    this.props.history.push('../storage-acceptance-logic')

                    if (isNewDefault) {
                        toast.success(
                            t(
                                'notification.success.onCreateDefaultAcceptanceLogic'
                            )
                        )
                    } else {
                        toast.success(
                            t('notification.success.onCreateAcceptanceLogic')
                        )
                    }

                    return
                } else {
                    toast.error(t('notification.error.generic'))
                    return
                }
            } catch (error) {
                console.log(error)
                toast.error(t('notification.error.generic'))
                return
            }
        } else {
            // It's an update, so check duplicate name only if name has been changed
            if (selectedAcceptanceLogicName !== acceptanceLogic.name) {
                if (logicNameAlreadyUsed.data) {
                    toast.error(t('validation.name.alreadyUsed'))
                    return
                }
            }

            const acceptanceLogicToUpdate = {
                ...acceptanceLogic,
                name: selectedAcceptanceLogicName,
                jsonLogic: builderModelAsJsonLogic,
            }

            try {
                const response = await UpdateAcceptanceLogic(
                    acceptanceLogicToUpdate
                )

                if (response) {
                    this.props.history.push('../storage-acceptance-logic')

                    toast.success(
                        t('notification.success.onUpdateAcceptanceLogic')
                    )
                    return
                } else {
                    toast.error(t('notification.error.generic'))
                    return
                }
            } catch (error) {
                console.log(error)
                toast.error(t('notification.error.generic'))
                return
            }
        }
    }

    getTreeErrorMessageFormatted = (errorMessage) => {
        const { i18n, t } = this.props;

        if (errorMessage.errors.length > 0) {
            if (!Object.prototype.hasOwnProperty.call(errorMessage.errors[0], "side")) {
                return t(`notification.error.builder.${errorMessage.errors[0].key}`, {
                    rulePosition: errorMessage.itemPosition.index,
                })
            }

            const i18nKey = `notification.error.builder.${errorMessage.errors[0].side}.${errorMessage.errors[0].key}`

            if (i18n.exists(`CreateStorageAcceptanceLogicContainer:${i18nKey}`)) {
                return t(i18nKey, { rulePosition: errorMessage.itemPosition.index })
            } else {
                return t(`notification.error.builder.${errorMessage.errors[0].side}.customError`, {
                    rulePosition: errorMessage.itemPosition.index,
                    errorMessage: errorMessage.errors[0].key,
                })
            }
        }
    }

    handleAcceptanceLogicNameChange = (event) => {
        this.setState({ selectedAcceptanceLogicName: event.target.value })
    }

    handleManualEditJsonLogic = () => {
        const {
            builderLoadedConfig,
            builderImmutableTree,
            manualEditJsonLogicModalOpened,
        } = this.state

        if (!manualEditJsonLogicModalOpened) {
            const jsonLogic = Utils.jsonLogicFormat(
                builderImmutableTree,
                builderLoadedConfig
            ).logic

            this.setState({
                manualEditJsonLogicModalOpened:
                    !this.state.manualEditJsonLogicModalOpened,
                manualEditCurrentJsonContent: JSON.stringify(
                    jsonLogic,
                    null,
                    2
                ),
            })
        } else {
            this.setState({
                manualEditJsonLogicModalOpened:
                    !this.state.manualEditJsonLogicModalOpened,
                manualEditCurrentJsonContent: null,
            })
        }
    }

    handleImportModalJsonContentChange = (content) => {
        this.setState({ manualEditCurrentJsonContent: content })
    }

    handleCopyManualJsonLogicToClipboard = () => {
        const { manualEditCurrentJsonContent } = this.state
        let area = document.createElement('textarea')
        document.body.appendChild(area)
        area.value = manualEditCurrentJsonContent
        area.select()
        document.execCommand('copy')
        document.body.removeChild(area)
        toast.success('Copied to clipboard')
    }

    handleLoadJsonToImmutableTree = () => {
        const { t } = this.props
        const { manualEditCurrentJsonContent, builderLoadedConfig } = this.state

        // Load JSON content to builder
        if (
            (manualEditCurrentJsonContent !== null) |
                manualEditCurrentJsonContent ||
            undefined
        ) {
            try {
                const contentAsJson = JSON.parse(manualEditCurrentJsonContent)
                const isValidJsonLogic = Utils.isJsonLogic(contentAsJson)

                if (isValidJsonLogic) {
                    const builderTree = Utils.loadFromJsonLogic(
                        contentAsJson,
                        builderLoadedConfig
                    )

                    // Check if tree is empty after this
                    // It means, wrong variable name, so display error message
                    if (Utils.TreeUtils.isEmptyTree(builderTree)) {
                        toast.error(
                            t(
                                'notification.error.onImportInvalidVariablesNames'
                            )
                        )
                        return
                    } else {
                        this.setState({
                            builderImmutableTree: builderTree,
                            builderNumberOfRules:
                                Utils.TreeUtils.getTotalRulesCountInTree(
                                    builderTree
                                ),
                        })

                        this.handleManualEditJsonLogic()
                    }
                } else {
                    toast.error(
                        t('notification.error.onImportInvalidJsonLogic')
                    )
                    return
                }
            } catch (error) {
                toast.error(t('notification.error.onImportInvalidJsonLogic'))
                return
            }
        }
    }

    render() {
        const { t } = this.props
        const {
            isNewDefault,
            isNew,
            acceptanceLogic,
            isLoading,
            isError,
            builderImmutableTree,
            builderNumberOfRules,
            builderLoadedConfig,
            selectedAcceptanceLogicName,
            manualEditJsonLogicModalOpened,
            manualEditCurrentJsonContent,
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
                                <CreateStorageAcceptanceLogicForm
                                    onSubmit={this.handleSaveModelFromBuilder}
                                    onAcceptanceLogicNameChange={
                                        this.handleAcceptanceLogicNameChange
                                    }
                                    selectedAcceptanceLogicName={
                                        selectedAcceptanceLogicName
                                    }
                                    isNew={isNew}
                                    debugMode={false}
                                    isNewDefault={isNewDefault}
                                    acceptanceLogic={acceptanceLogic}
                                    builderImmutableTree={builderImmutableTree}
                                    builderNumberOfRules={builderNumberOfRules}
                                    builderLoadedConfig={builderLoadedConfig}
                                    onUpdateBuilderResult={
                                        this.handleUpdateBuilderResult
                                    }
                                    onChangeJsonLogicBuilder={
                                        this.handleOnChangeJsonLogicBuilder
                                    }
                                    onLoadJsonLogicToBuilder={
                                        this.loadJsonLogicToBuilder
                                    }
                                    onClickManualEditJsonLogic={
                                        this.handleManualEditJsonLogic
                                    }
                                />
                            </Col>
                        </Row>
                    </>
                ) : isError ? (
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
                                    'error.isAcceptanceLogicNotExistingOrNotAllowed'
                                )}
                                <br />
                                <br />
                                <Button
                                    tag={Link}
                                    to="../storage-acceptance-logic"
                                    type="submit"
                                    color="danger"
                                    size="1x"
                                    className="me-4"
                                >
                                    <span className="as--light">
                                        {t('button.backToAcceptanceLogicList')}
                                    </span>
                                </Button>
                            </section>
                        </Col>
                    </Row>
                ) : (
                    <Loader />
                )}

                {manualEditJsonLogicModalOpened && (
                    <ManualEditAcceptanceLogicFromJson
                        isModalOpened={manualEditJsonLogicModalOpened}
                        handleModal={this.handleManualEditJsonLogic}
                        handleLoadJsonToImmutableTree={
                            this.handleLoadJsonToImmutableTree
                        }
                        handleCopyJsonLogicToClipboard={
                            this.handleCopyManualJsonLogicToClipboard
                        }
                        currentJsonContent={manualEditCurrentJsonContent}
                        handleChangeJsonContent={
                            this.handleImportModalJsonContentChange
                        }
                    />
                )}
            </Container>
        )
    }
}

export default withRouter(
    withAuth0(
        withTranslation('CreateStorageAcceptanceLogicContainer')(
            CreateStorageAcceptanceLogicContainer
        )
    )
)
