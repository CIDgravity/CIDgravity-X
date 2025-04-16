import { PureComponent } from 'react'
import { withAuth0 } from '@auth0/auth0-react'

import { withTranslation, Trans } from 'react-i18next'
import {
    Alert,
    Col,
    Container,
    Row,
    Button,
    FormGroup,
    Label,
} from 'reactstrap'
import { CustomCodeHighlight } from 'shared/components/CustomCodeHighlight'

import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Rules engine imports
import '@react-awesome-query-builder/bootstrap/css/styles.css'

import { Query, Builder, Utils } from '@react-awesome-query-builder/bootstrap'

class CreateStorageAcceptanceLogicForm extends PureComponent {
    render() {
        const {
            t,
            builderImmutableTree,
            builderLoadedConfig,
            builderNumberOfRules,
            onChangeJsonLogicBuilder,
            debugMode,
            isNew,
            isNewDefault,
            isSubmitting,
            onClickManualEditJsonLogic,
        } = this.props

        return (
            <Container>
                <section className="card-form">
                    <Row className="card-form-header">
                        <div>
                            <h3 className="title is-4 is-styled">
                                {t('general.title')}
                            </h3>
                            <h5>{t('general.subtitle')}</h5>
                        </div>
                    </Row>

                    <Row className="mt-4" style={{ marginLeft: 2 + 'px' }}>
                        <Col xs="12" md="12">
                            <FormGroup>
                                <Label
                                    for="pricing-model-name"
                                    className="form-label"
                                >
                                    {t('general.name.label')}
                                </Label>

                                <input
                                    type="text"
                                    id="acceptance-logic-name"
                                    className="form-control"
                                    name="name"
                                    maxLength="255"
                                    value={
                                        this.props.selectedAcceptanceLogicName
                                    }
                                    disabled={isSubmitting}
                                    onChange={(e) =>
                                        this.props.onAcceptanceLogicNameChange(
                                            e
                                        )
                                    }
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                </section>

                <section className="card-form">
                    <Row className="card-form-header mb-4">
                        <Col xs={12} md={6}>
                            <h3 className="title is-4 is-styled">
                                {t('rule.title')}
                            </h3>
                            <h5>{t('rule.subtitle')}</h5>
                        </Col>

                        <Col xs={12} md={6}>
                            <div className="text-end ms-2">
                                <Button
                                    onClick={onClickManualEditJsonLogic}
                                    id="manualEditJsonLogic"
                                    color="secondary"
                                    size="sm"
                                >
                                    <span className="as--light">
                                        {t('button.manualEditJsonLogic')}
                                    </span>
                                </Button>
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        {builderNumberOfRules === 0 && (
                            <Col xs={4} md={4}>
                                <Alert
                                    color="warning"
                                    className="d-flex align-items-center"
                                >
                                    <div className="ms-4">
                                        <Trans
                                            t={t}
                                            i18nKey="rule.emptyLogicWarning"
                                        />
                                    </div>
                                </Alert>
                            </Col>
                        )}

                        <Col>
                            <Query
                                {...builderLoadedConfig}
                                value={builderImmutableTree}
                                onChange={onChangeJsonLogicBuilder}
                                renderBuilder={(props) => (
                                    <div className="query-builder">
                                        <Builder {...props} />
                                    </div>
                                )}
                            />
                        </Col>
                    </Row>

                    {debugMode && (
                        <Row>
                            <Col>
                                <div className="query-builder-result">
                                    <CustomCodeHighlight
                                        text={JSON.stringify(
                                            Utils.jsonLogicFormat(
                                                builderImmutableTree,
                                                builderLoadedConfig
                                            )
                                        )}
                                    />
                                </div>
                            </Col>
                        </Row>
                    )}
                </section>

                <Row className="mt-3 mb-4">
                    <Col className="text-end">
                        <Button
                            onClick={this.props.onSubmit}
                            disabled={isSubmitting}
                            id="createAcceptanceLogic"
                            className="mb-4 custom-cidg-button"
                        >
                            {isSubmitting ? (
                                <FontAwesomeIcon
                                    spin
                                    icon={faSpinner}
                                    size="2xs"
                                />
                            ) : isNew || isNewDefault ? (
                                <>{t('button.create')}</>
                            ) : (
                                <>{t('button.update')}</>
                            )}
                        </Button>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default withAuth0(
    withTranslation('CreateStorageAcceptanceLogicForm')(
        CreateStorageAcceptanceLogicForm
    )
)
