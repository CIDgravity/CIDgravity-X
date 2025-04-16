import React, { PureComponent } from 'react'

import { Alert, Container, Row, Col } from 'reactstrap'
import { withAuth0 } from '@auth0/auth0-react'
import { Loader } from 'shared/components'
import { withTranslation, Trans } from 'react-i18next'

import { GetProviderDetailsForClient } from 'shared/services/cidg-services/client-backend/provider_details'
import { fromBytesToReadableFormat, toReadableDurationFormat } from 'shared/utils/file_size'
import { GetLatestMessariTicker } from 'shared/services/integration'
import { computePriceEquivalence, convertToFIL, convertToFilecoinRate } from 'shared/utils/fil'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSlack } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faShield, faCircleExclamation } from '@fortawesome/free-solid-svg-icons'

import { GetCountryNameFromCode } from 'shared/components/CountrySelector'

import ReactTooltip from 'react-tooltip'
import getUnicodeFlagIcon from 'country-flag-icons/unicode'

import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';

class ProviderDetailsContainer extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            isError: false,
            providerAddressDetails: null,
            pricingRulesApplied: []
        }
    }

    async componentDidMount() {
        const fetchLatestMessariTicker = GetLatestMessariTicker()
        const fetchProviderDetails = GetProviderDetailsForClient(this.props.match.params.providerAddress)

        Promise.allSettled([ fetchLatestMessariTicker, fetchProviderDetails ]).then((responses) => {
            const [messariTickerResult, providerDetailsResult] = responses;
            const hasError = messariTickerResult.status === "rejected" || providerDetailsResult.status === "rejected";

            if (hasError) {
                this.setState({
                    isLoading: false,
                    isError: true,
                });

            } else {
                this.setState({
                    isLoading: false,
                    providerAddressDetails: providerDetailsResult.value.data.result,
                    pricingRulesApplied: providerDetailsResult.value.data.result.pricingRulesApplied?.map((rule) => ({
                        ...rule,
                        price: rule.price,
                        price_for_30days_fil: rule.currency === 'attofil_gib_epoch' ? computePriceEquivalence(rule.price, "FIL") : -1,
                        price_for_30days_usd: rule.currency === 'attofil_gib_epoch' ? computePriceEquivalence(rule.price, "USD", messariTickerResult.value.data.data.market_data.price_usd) : -1,
                        price_fil_per_gib_per_epoch: rule.currency === 'usd_tib_month' ? convertToFilecoinRate(rule.price, messariTickerResult.value.data.data.market_data.price_usd) : -1,
                    })),
                })
            }
        })
    }

    getPricingRuleDealSize = (value, sign) => {
        const [val, valUnit] = fromBytesToReadableFormat(value)
        return sign + " " + val + " " + valUnit
    }

    getPricingRuleDealDuration = (value, sign) => {
        const [val, valUnit] = toReadableDurationFormat(value)
        return sign + " " + val + " " + valUnit
    }

    convertSizeToReadableFormat = value => {
        const [val, valUnit] = fromBytesToReadableFormat(value)
        return val + " " + valUnit
    }

    // display the transfer type
    // if any, we display all transfer type separated by a comma
    computeRuleTransferType = transferType => {
        const { t } = this.props

        if (transferType === "any") {
            const transferTypes = [
                t(`pricing.columns.transferType.values.graphsync`),
                t(`pricing.columns.transferType.values.libp2p`),
                t(`pricing.columns.transferType.values.http`),
                t(`pricing.columns.transferType.values.manual`)
            ];
        
            return transferTypes.join(", ");
        }

        return t(`pricing.columns.transferType.values.${transferType}`)
    }

    computeAvailabilityStats = (value) => {
        const { t } = this.props

        // define the color
        let color = "green";
    
        if (value < 0.6) {
            color = "red";
        } else if (value < 0.8) {
            color = "orange";
        }
    
        // define the value
        let formattedValue = t('status.availability.notAvailable')

        if (value !== -1) {
            formattedValue = (value * 100).toFixed(2) + " %";
        }

        return (
            <span style={{ color }}>
                {formattedValue}
            </span>
        );
    }

    getCountryNameOrCode = countryCode => {
        const { i18n } = this.props;
        const countryName = GetCountryNameFromCode(i18n, countryCode)

        if (countryName !== undefined) {
            return countryName
        } else {
            return countryCode
        }
    }

    render() {
        const { isLoading, isError, providerAddressDetails, pricingRulesApplied } = this.state
        const { t } = this.props
        const mdParser = new MarkdownIt();

        return (
            <Container className="settings-container">
                <Row className="mt-4 mb-4">
                    <Col xs={12} md={6}>
                        <h1>{t('title', { providerAddress: this.props.match.params.providerAddress })}</h1>
                    </Col>

                    {!isError && (
                        <Col xs={12} md={6}>
                            <div className="text-end ms-2">
                                <a
                                    href={`https://filscan.io/en/miner/${this.props.match.params.providerAddress}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="btn btn-primary"
                                >
                                    {t('button.viewOnFilscan')}
                                </a>
                            </div>
                        </Col>
                    )}
                </Row>

                {isLoading ? (
                    <Loader />

                ) : providerAddressDetails && providerAddressDetails.isClaimed ? (
                    <>
                        {/* Provider intro (custom message that can be set in provider settings) */}
                        {providerAddressDetails.information && providerAddressDetails.information.providerBio && (
                            <Row>
                                <Col xs='12' md='12'>
                                    <section className="card-form">
                                        <MdEditor 
                                            style={{
                                                border: 'none',
                                                borderRight: 'none'
                                            }}
                                            readOnly
                                            view={{
                                                menu: false,
                                                md: false,
                                                html: true
                                            }}
                                        
                                            renderHTML={text => mdParser.render(text)}  
                                            value={providerAddressDetails.information.providerBio}
                                        />
                                    </section>
                                </Col>
                            </Row>
                        )}

                        {/* Provider KYS and availability stats */}
                        <Row>
                            <Col xs='6' md='6'>
                                <section className="card-form">
                                    {providerAddressDetails.information ? (
                                        <>
                                            <strong>
                                                <span style={{ marginRight: 5 + 'px'}}>
                                                    {getUnicodeFlagIcon(providerAddressDetails.information.entityCountry)}
                                                </span>

                                                {providerAddressDetails.information.entityName}{' '}
                                                ({t(`information.entityType.values.${providerAddressDetails.information.entityType}`)})
                                            </strong>
                                                
                                            {providerAddressDetails.information.isVerified ? (
                                                <>
                                                    <span style={{ color: "green" }} data-for="untrustedKYS" data-tip={t(`information.isVerified.tooltip`)}>
                                                        <FontAwesomeIcon style={{ marginRight: 5 + "px", marginLeft: 20 + "px" }}  icon={faShield} />
                                                        {t(`information.isVerified.title`)}
                                                    </span>

                                                    <ReactTooltip place="bottom" id="untrustedKYS" />
                                                </>
                                            ) : (
                                                <>
                                                    <span style={{ color: "red" }} data-for="untrustedKYS" data-tip={t(`information.isNotVerified.tooltip`)}>
                                                        <FontAwesomeIcon style={{ marginRight: 5 + "px", marginLeft: 20 + "px" }}  icon={faCircleExclamation} />
                                                        {t(`information.isNotVerified.title`)}
                                                    </span>

                                                    <ReactTooltip place="bottom" id="untrustedKYS" />
                                                </>
                                            )}

                                            <p>
                                                {this.getCountryNameOrCode(providerAddressDetails.information.entityCountry)}
                                            </p>
                                            <p>
                                                <a rel="noreferrer" target="_blank" href={providerAddressDetails.information.entityWebsite}>
                                                    {providerAddressDetails.information.entityWebsite}
                                                </a>
                                            </p>

                                            <div className="spacer" />

                                            <p>{providerAddressDetails.information.contactFullName}</p>
                                            <p>
                                                <FontAwesomeIcon size="lg" style={{ marginRight: 5 + "px"}} icon={faEnvelope} />
                                                <a rel="noreferrer" target="_blank" href={`mailto:${providerAddressDetails.information.contactEmail}`}>
                                                    {providerAddressDetails.information.contactEmail}
                                                </a>
                                            </p>
                                            <p>
                                                <FontAwesomeIcon size="lg" style={{ marginRight: 5 + "px"}} icon={faSlack} />
                                                @{providerAddressDetails.information.contactSlack}
                                            </p>
                                        </>
                                    ) : (
                                        <Alert color="warning">
                                            {t('information.notAvailable')}
                                        </Alert>
                                    )}
                                </section>
                            </Col>

                            {/* Provider availability */}
                            <Col xs='6' md='6'>
                                <section className="card-form">
                                    <strong>{t('status.isProviderReadyToAcceptedDeals.title')}</strong>
                                    <p className="mb-3">
                                        {providerAddressDetails.isReadyToAcceptDealsFromClient ? (
                                            <span style={{ color: "green" }}>{t('status.isProviderReadyToAcceptedDeals.yes')}</span>
                                        ) : (
                                            <span style={{ color: "red" }}>{t('status.isProviderReadyToAcceptedDeals.no')}</span>
                                        )}
                                    </p>

                                    <strong>{t('status.availability.storage.title')}</strong>
                                    <p className="mb-3">{this.computeAvailabilityStats(providerAddressDetails.availabilityStats.storageAvailabilityLast7Days)}</p> 

                                    <strong>{t('status.availability.retrieval.title')}</strong>
                                    <p>{this.computeAvailabilityStats(providerAddressDetails.availabilityStats.retrievalAvailabilityLast7Days)}</p>     
                                </section>
                            </Col>
                        </Row>

                        {/* Pricing rules applied to the current client */}
                        <section className="card-form">
                            <Row className="card-form-header mb-4">
                                <Col xs="12" md="12">
                                    <h3 className="title is-4 is-styled">
                                        {t('pricing.title')}
                                    </h3>
                                    <h5>
                                        <Trans t={t} i18nKey="pricing.subtitle" />
                                    </h5>
                                </Col>
                            </Row>

                            {pricingRulesApplied.length <= 0 ? (
                                <Alert color="warning">
                                    {t('pricing.noRulesApplied')}
                                </Alert>

                            ) : (
                                <>
                                    <Row className="d-md-flex mb-2 p-3">
                                        <Col className="u-pointer-cursor text-secondary" xs="2" md="2">
                                            {t('pricing.columns.transferType.title')}
                                        </Col>

                                        <Col className="u-pointer-cursor text-secondary" xs="2" md="2">
                                            {t('pricing.columns.verified.title')}
                                        </Col>

                                        <Col className="u-pointer-cursor text-secondary" xs="2" md="2">
                                            {t('pricing.columns.dealSize.title')}
                                        </Col>

                                        <Col className="u-pointer-cursor text-secondary" xs="3" md="3">
                                            {t('pricing.columns.dealDuration.title')}
                                        </Col>

                                        <Col className="u-pointer-cursor text-secondary" xs="3" md="3">
                                            {t('pricing.columns.dealPrice.title')}
                                        </Col>
                                    </Row>

                                    {pricingRulesApplied.map((rule, index) => (
                                        <div id={'modelCard' + index} key={rule.id} className='p-3 card-form'>
                                            <Row key={rule.id} className="align-items-center align-items-stretch">
                                                <Col xs='2' md='2'>
                                                    <div className="flex-fill d-flex align-items-center">
                                                        {this.computeRuleTransferType(rule.transferType)}
                                                    </div>
                                                </Col>

                                                <Col xs='2' md='2'>
                                                    <div className="flex-fill d-flex align-items-center">
                                                        {t(`pricing.columns.verified.values.${rule.verified}`)}
                                                    </div>
                                                </Col>

                                                <Col xs='2' md='2'>
                                                    <div className="flex-fill d-flex align-items-center">
                                                        {this.getPricingRuleDealSize(rule.minSize, ">=")}
                                                        <br />
                                                        {this.getPricingRuleDealSize(rule.maxSize, "<=")}
                                                    </div>
                                                </Col>
                                    
                                                <Col xs='3' md='3'>
                                                    <div className="flex-fill d-flex align-items-center">
                                                        {this.getPricingRuleDealDuration(rule.minDuration, ">=")}
                                                        <br />
                                                        {this.getPricingRuleDealDuration(rule.maxDuration, "<=")}
                                                    </div>
                                                </Col>
                                            
                                                <Col xs='3' md='3'>
                                                    {rule.currency === 'attofil_gib_epoch' ? (
                                                        <>
                                                            <div className="flex-fill d-flex align-items-center">
                                                                <p>
                                                                    {convertToFIL(rule.price)}{' '}
                                                                    {t('pricing.columns.dealPrice.unit.filGibEpoch')}
                                                                </p>
                                                            </div>

                                                            {rule.price != null && rule.price > 0 && (
                                                                <Alert color="info" className="mt-2">
                                                                    ≈ {rule.price_for_30days_fil}{' '} 
                                                                    {t('pricing.columns.dealPrice.equivalenceUnit.filTibMonth')}
                                                                    {' '}(${rule.price_for_30days_usd})
                                                                </Alert>
                                                            )}
                                                        </>

                                                    ) : rule.currency === 'usd_tib_month' ? (
                                                        <>
                                                            <div className="flex-fill d-flex align-items-center">
                                                                <p>
                                                                    {(rule.price)}{' '}
                                                                    {t('pricing.columns.dealPrice.unit.usdTib30d')}
                                                                </p>
                                                            </div>

                                                            {rule.price != null && rule.price > 0 && (
                                                                <Alert color="info" className="mt-2">
                                                                    ≈ {rule.price_fil_per_gib_per_epoch}{' '} 
                                                                    {t('pricing.columns.dealPrice.equivalenceUnit.attofilGiBEpoch')}
                                                                </Alert>
                                                            )}
                                                        </>

                                                    ) : null }
                                                </Col>
                                            </Row>
                                        </div>
                                    ))}
                                </>
                            )}
                        </section>
                    </>

                ) : providerAddressDetails && !providerAddressDetails.isClaimed ? (
                    <div className="alert alert-warning" role="alert" style={{ marginTop: '50px' }}>
                        {t('error.notClaimed')}
                    </div>

                ) : isError ? (
                    <div className="alert alert-danger" role="alert" style={{ marginTop: '50px' }}>
                        {t('error.generic')}
                    </div>

                ) : null}
            </Container>
        )
    }
}

export default withAuth0(
    withTranslation('ProviderDetailsContainer')(ProviderDetailsContainer)
)
