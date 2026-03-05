import { withAuth0 } from '@auth0/auth0-react'
import {
    faArrowDownUpAcrossLine,
    faScrewdriverWrench,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { createRef, PureComponent } from 'react'
import { withTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { withRouter } from 'shared/utils/withRouter'
import { toast } from 'react-toastify'
import { Tooltip } from 'react-tooltip'
import {
    SESSION_STORAGE_TENANT_KEY,
    TOKEN_REFRESHED_DISPATCH_EVENT,
    WEBSOCKET_ENDPOINT,
} from '../../config/constants'

import { UpdateMaintenanceModeState } from '../services/addresses_claim'
import { SetTenantValuesInSessionStorage, GetTenantValuesFromSessionStorage } from '../utils/auth'
import { loadAddressesFromJwt } from 'shared/utils/addresses'

import CustomBadgeOffer from 'shared/components/CustomBadgeOffer'
import Switch from 'react-switch'
import * as scssVariables from 'config/scss-variables'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import NavItem from 'react-bootstrap/NavItem'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownToggle from 'react-bootstrap/DropdownToggle'
import DropdownMenu from 'react-bootstrap/DropdownMenu'
import DropdownItem from 'react-bootstrap/DropdownItem'
import LanguageSwitcher from './LanguageSwitcher'

class TopNavBar extends PureComponent {
    constructor(props) {
        super(props)

        // For values updated by websocket, useRef instead of state to avoid re-rendering at each new value
        // This is better for performances (avoid reloading translations for example and flooding missing-key requests)
        this.baseFeeComponentRef = createRef();
        this.filPriceComponentRef = createRef();

        this.state = {
            websocketOpened: false,
            selectedAddress: null,
            addressesOwnedExceptSelected: [],
            currentUser: null,
            areUnderMaintenance: {},
            isClientMode: false,
            isProviderMode: false,
        }
    }

    async componentDidMount() {
        window.addEventListener(SESSION_STORAGE_TENANT_KEY, () => {
            const [addressId, actorType] = GetTenantValuesFromSessionStorage();

            this.setState({
                selectedAddress: addressId,
                isClientMode: actorType === 'account',
                isProviderMode: actorType === 'storageminer',
            })

            this.loadClaimedAddresses()
        })

        window.addEventListener(TOKEN_REFRESHED_DISPATCH_EVENT, () => {
            this.loadClaimedAddresses()
        })

        await this.connectToWebsocket()

        // Load all claimed addresses to populate the dropdown here
        // We will also load infos related to selected address
        await this.loadClaimedAddresses()

        setInterval(() => {
            this.autoReconnectWebsocket()
        }, 5000)
    }

    loadClaimedAddresses = async () => {

        // Get current JWT
        const { getAccessTokenSilently } = this.props.auth0
        const token = await getAccessTokenSilently()

        // Load addresses from JWT
        const [clientAddresses, providerAddresses] = await loadAddressesFromJwt(token)

        // Merge two arrays
        const ownedAddresses = [...clientAddresses, ...providerAddresses]

        // Here selectedAddress will return [addressId, actorType]
        const [selectedAddress, actorType] = GetTenantValuesFromSessionStorage();

        // Filter array to get only information about non-selected addresses
        // Allow to switch to client and storageminer addresses
        // Also filter to remove all addresses with actorType null or empty
        const addressesOwnedWithoutSelected = ownedAddresses.filter((item) => item.addressId !== selectedAddress)
        const selectedAddressInfos = ownedAddresses.filter((item) => item.addressId === selectedAddress)

        this.setState({
            addressesOwnedExceptSelected: addressesOwnedWithoutSelected,
            selectedAddress: selectedAddressInfos[0],
            isClientMode: actorType === 'account',
            isProviderMode: actorType === 'storageminer',
        })
    }

    connectToWebsocket = async () => {
        const { getAccessTokenSilently } = this.props.auth0
        const token = await getAccessTokenSilently()

        const websocket = new WebSocket(WEBSOCKET_ENDPOINT)

        websocket.onopen = () => {
            // Send the token as the first message
            // If the token is valid, connection kept open
            // Otherwise the connection will be closed
            websocket.send(token)
            this.openWebsocket()
        }

        websocket.onclose = () => {
            toast.error(
                this.props.t('notification.error.onCheckNetwork.lost'),
                {
                    autoClose: false,
                    closeButton: false,
                    closeOnClick: false,
                    toastId: 'networkCheckToast',
                }
            )

            this.closeWebsocket()
        }

        websocket.onmessage = (e) => {
            const websocketMessage = JSON.parse(e.data)

            if (websocketMessage.type === 'ticker') {
                this.ticker(websocketMessage.ticker)
            }

            if (websocketMessage.type === 'baseFee') {
                this.baseFee(websocketMessage.baseFee)
            }

            if (websocketMessage.type === 'maintenance') {
                // TODO remove that if and make sure the backend doesn't send this message at all if the content is empty
                if (websocketMessage.areUnderMaintenance !== undefined)
                    this.setAreUnderMaintenance(websocketMessage.areUnderMaintenance)
            }

            if (websocketMessage.type === 'all') {
                this.ticker(websocketMessage.ticker)
                this.baseFee(websocketMessage.baseFee)
                // TODO remove that if and make sure the backend sends an empty map instead
                if (websocketMessage.areUnderMaintenance !== undefined)
                    this.setAreUnderMaintenance(websocketMessage.areUnderMaintenance)
            }
        }
    }

    openWebsocket = () => {
        toast.dismiss('networkCheckToast')
        this.setState({ websocketOpened: true })
    }

    closeWebsocket = () => {
        this.setState({ websocketOpened: false })
    }

    autoReconnectWebsocket = async () => {
        const { websocketOpened } = this.state

        if (websocketOpened === false) {
            try {
                await this.connectToWebsocket()
            } catch (err) {
                console.log('Websocket error', new Error(err.message))
            }
        }
    }

    ticker = (tickerData) => {
        const { websocketOpened } = this.state

        if (this.filPriceComponentRef !== null && this.filPriceComponentRef.current !== null) {
            if (tickerData) {
                if (websocketOpened) {
                    this.filPriceComponentRef.current.innerHTML = '<span class="text-center">$ ' + Number(tickerData.weightedPrice.toFixed(2)) + '</span>'
                } else {
                    this.filPriceComponentRef.current.innerHTML = '$ ' + Number(tickerData.weightedPrice.toFixed(2))
                }
            } else {
                this.filPriceComponentRef.current.innerHTML =  '{t("ticker.retrievingPrice")}{"  "}<i className="fas fa-stroopwafel fa-spin" />'
            }
        }
    }

    baseFee = (baseFee) => {
        const { t } = this.props;

        if (this.baseFeeComponentRef !== null && this.baseFeeComponentRef.current !== null) {
            if (baseFee) {
                this.baseFeeComponentRef.current.innerHTML =  t("ticker.baseFee") + "  " + Number((baseFee.base_fee / 1e9).toFixed(3)) + "  nFIL"
            } else {
                this.baseFeeComponentRef.current.innerHTML =  t("ticker.baseFee") + '<small>{t("ticker.retrievingBaseFee")}{"  "}<i className="fas fa-stroopwafel fa-spin" /></small>'
            }
        }
    }

    setAreUnderMaintenance = (areUnderMaintenance) => {
        this.setState({ areUnderMaintenance: areUnderMaintenance })
    }

    handleMaintenanceChange = async () => {
        const { isProviderMode, selectedAddress, areUnderMaintenance } = this.state

        // This function apply only for provider, add a check here for security
        if (isProviderMode) {
            const { t } = this.props
            const newMaintenanceModeValue = !areUnderMaintenance[selectedAddress.addressId]
            const settings = { workMode: newMaintenanceModeValue }

            try {
                await UpdateMaintenanceModeState(settings)
                let newAreUnderMaintenance = { ...areUnderMaintenance }
                newAreUnderMaintenance[selectedAddress.addressId] = newMaintenanceModeValue
                this.setAreUnderMaintenance(newAreUnderMaintenance)

                // TODO: put this in a useEffect!
                if (newMaintenanceModeValue) {
                    toast.success(
                        t('notification.success.onEnableMaintenanceMode', { address: selectedAddress.addressId })
                    )
                } else {
                    toast.success(
                        t('notification.success.onDisableMaintenanceMode', { address: selectedAddress.addressId })
                    )
                }
            } catch (error) {
                toast.error(
                    t('notification.error.onErrorMaintenanceMode', { address: selectedAddress.addressId })
                )
                console.log(error)
            }
        }
    }

    handleSwitchTenant = (addressId, actorType) => {
        this.loadClaimedAddresses()
        toast.success(this.props.t('notification.success.onSwitchTenant', { address: addressId }))

        // Redirect to the correct URL
        const currentUrl = window.location.href
        const url = currentUrl.split('/')

        // If the currentUser change tenant on non context aware page
        // Redirect to dashboard
        // Set an object in session storage to store both addressId and actorType (UI will change depending on actorType selected)
        SetTenantValuesInSessionStorage(addressId, actorType)

        let basePath = ''
        let urlActorType = ''

        // Define path depending on actorType
        if (actorType === 'storageminer') {
            basePath = `/provider/${addressId}`
            urlActorType = 'provider'
        } else if (actorType === 'account') {
            basePath = `/client/${addressId}`
            urlActorType = 'client'
        }

        // If user was on a tenant aware path, just update the tenant and keep the same page
        // Otherwise, redirect to the dashboard page
        // If we change from provider to client, we need to redirect to dashboard, because same page can't exist
        if (url[5] === undefined || url[3] !== urlActorType) {
            this.props.history.replace({ pathname: `${basePath}` })
        } else {
            this.props.history.replace({
                pathname: `${basePath}/${url[5]}`,
            })
        }
    }

    getFriendlyNameAndAddrText = (addr) => {
        if (addr === undefined || addr === null) {
            return this.props.t('tenantSelector.noAddress')
        }

        if (
            addr.friendlyName !== undefined &&
            addr.friendlyName !== null &&
            addr.friendlyName !== ''
        ) {
            return `${addr.friendlyName} (${addr.addressId})`
        } else {
            return addr.addressId
        }
    }

    getNoAddressText = () => {
        return this.props.t('tenantSelector.noAddress')
    }

    render() {
        const { t } = this.props

        const {
            addressesOwnedExceptSelected,
            selectedAddress,
            websocketOpened,
            areUnderMaintenance,
            isProviderMode,
        } = this.state
        const { user, logout } = this.props.auth0

        return (
            <>
                {user && (
                    <div>
                        <Navbar expand={true} className="cidg-top-navbar">
                            <Nav className="me-auto align-items-center ps-3" navbar>
                                <NavItem className="navitem-filprice me-1">
                                    <Navbar.Text>
                                        <img
                                            src="/images/filecoin-logo.svg"
                                            className="filecoin-logo"
                                            alt="Filecoin"
                                        />
                                    </Navbar.Text>
                                </NavItem>

                                <NavItem className="navitem-filprice me-4">
                                    <div ref={this.filPriceComponentRef} />
                                </NavItem>

                                <NavItem className="navitem-basefee me-4">
                                    <div ref={this.baseFeeComponentRef} />
                                </NavItem>
                            </Nav>
                            <Nav className="align-items-center" navbar>
                                <NavItem className="me-4 navitem-language">
                                    <LanguageSwitcher />
                                </NavItem>

                                {/* Display maintenance mode only for provider mode, not applicable for clients */}
                                {isProviderMode && (
                                    <NavItem className="me-4 navitem-maintenance">
                                        {websocketOpened &&
                                        selectedAddress?.addressId in
                                            areUnderMaintenance ? (
                                            <>
                                                <div
                                                    data-tooltip-id="maintenanceModeToolip"
                                                    data-tooltip-content={
                                                        areUnderMaintenance[
                                                            selectedAddress
                                                                ?.addressId
                                                        ]
                                                            ? t(
                                                                  'maintenanceMode.switch.tooltipEnabled',
                                                                  {
                                                                      address:
                                                                          selectedAddress?.addressId,
                                                                  }
                                                              )
                                                            : t(
                                                                  'maintenanceMode.switch.tooltipAcceptingDeals'
                                                              )
                                                    }
                                                >
                                                    <Switch
                                                        offColor={
                                                            scssVariables.successColor
                                                        }
                                                        onColor={
                                                            scssVariables.warningColor
                                                        }
                                                        checked={
                                                            areUnderMaintenance[
                                                                selectedAddress
                                                                    ?.addressId
                                                            ]
                                                        }
                                                        onChange={
                                                            this
                                                                .handleMaintenanceChange
                                                        }
                                                        uncheckedIcon={
                                                            <div className="d-flex justify-content-center align-items-center">
                                                                <div className="p-1">
                                                                    <FontAwesomeIcon
                                                                        className="text-white"
                                                                        icon={
                                                                            faArrowDownUpAcrossLine
                                                                        }
                                                                        size="lg"
                                                                    />
                                                                </div>
                                                            </div>
                                                        }
                                                        checkedIcon={
                                                            <div className="d-flex justify-content-center align-items-center">
                                                                <div className="p-1">
                                                                    <FontAwesomeIcon
                                                                        className="text-white"
                                                                        icon={
                                                                            faScrewdriverWrench
                                                                        }
                                                                        size="lg"
                                                                    />
                                                                </div>
                                                            </div>
                                                        }
                                                    />
                                                </div>
                                                <Tooltip
                                                    event="mouseenter"
                                                    eventOff="mouseleave click"
                                                    place="bottom"
                                                    id="maintenanceModeToolip"
                                                />
                                            </>
                                        ) : null}
                                    </NavItem>
                                )}

                                <NavItem className="me-4 navitem-profile">
                                    {addressesOwnedExceptSelected.length >= 1 ? (
                                        <Dropdown>
                                            <DropdownToggle>
                                                {selectedAddress ? (
                                                    <>
                                                        <span className="navitem-profile-addressOnly">
                                                            {selectedAddress.addressId}
                                                        </span>

                                                        <span className="navitem-profile-friendlyAndAddress">
                                                            {this.getFriendlyNameAndAddrText(selectedAddress)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>
                                                            {t('tenantSelector.noAddressSelected')}
                                                        </span>
                                                    </>
                                                )}
                                                <i className="fas fa-caret-down ms-1" />
                                            </DropdownToggle>
                                            <DropdownMenu align="end">

                                                {addressesOwnedExceptSelected.filter((item) => item.actorType === 'storageminer').length > 0 && (
                                                    <>
                                                        <Dropdown.Header className="actorType storageminer">
                                                            {t('tenantSelector.providerCategory')}
                                                        </Dropdown.Header>
                                                
                                                        {addressesOwnedExceptSelected.filter((item) => item.actorType === 'storageminer').map(
                                                            (addr) => (
                                                                <DropdownItem
                                                                    key={addr.addressId}
                                                                    onClick={() =>
                                                                        this.handleSwitchTenant(
                                                                            addr.addressId,
                                                                            'storageminer'
                                                                        )
                                                                    }
                                                                    className="dropdown-item"
                                                                >
                                                                    <span className="navitem-profile-addressOnly">
                                                                        {addr
                                                                            ? addr.addressId
                                                                            : this.getNoAddressText()}
                                                                    </span>
                                                                    <span className="navitem-profile-friendlyAndAddress">
                                                                        {this.getFriendlyNameAndAddrText(
                                                                            addr
                                                                        )}
                                                                    </span>
                                                                </DropdownItem>
                                                            )
                                                        )}
                                                    </>
                                                )}

                                                {addressesOwnedExceptSelected.filter((item) => item.actorType === 'account').length > 0 && (
                                                    <>
                                                        <Dropdown.Divider />
                                                        <Dropdown.Header className="actorType account">
                                                            {t('tenantSelector.clientsCategory')}
                                                        </Dropdown.Header>

                                                        {addressesOwnedExceptSelected.filter((item) => item.actorType === 'account').map(
                                                            (addr) => (
                                                                <DropdownItem
                                                                    key={addr.addressId}
                                                                    onClick={() =>
                                                                        this.handleSwitchTenant(
                                                                            addr.addressId,
                                                                            'account'
                                                                        )
                                                                    }
                                                                    className="dropdown-item"
                                                                >
                                                                    <span className="navitem-profile-addressOnly">
                                                                        {addr
                                                                            ? addr.addressId
                                                                            : this.getNoAddressText()}
                                                                    </span>
                                                                    <span className="navitem-profile-friendlyAndAddress">
                                                                        {this.getFriendlyNameAndAddrText(
                                                                            addr
                                                                        )}
                                                                    </span>
                                                                </DropdownItem>
                                                            )
                                                        )}
                                                    </>
                                                )}
                                            </DropdownMenu>
                                        </Dropdown>
                                    ) : (
                                        <Navbar.Text>
                                            {selectedAddress ? (
                                                <>
                                                    <span className="navitem-profile-addressOnly">
                                                        {selectedAddress.addressId}
                                                    </span>

                                                    <span className="navitem-profile-friendlyAndAddress">
                                                        {this.getFriendlyNameAndAddrText(selectedAddress)}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>
                                                        {this.getNoAddressText()}
                                                    </span>
                                                </>
                                            )}
                                        </Navbar.Text>
                                    )}
                                </NavItem>

                                {/* Acl Offers for selected tenant */}
                                {selectedAddress && (
                                    <NavItem className="me-4 navitem-profile">
                                        <CustomBadgeOffer
                                            aclOffers={selectedAddress.aclOffers}
                                            i18nObject={t('tenantSelector.aclOffers', { returnObjects: true })}
                                            isLarge={true}
                                        />
                                    </NavItem>
                                )}

                                <NavItem className="navitem-profile">
                                    <Dropdown>
                                        <DropdownToggle>
                                            <div className="d-flex flex-row justify-content-center align-items-center">
                                                <div>
                                                    <img
                                                        className="profile"
                                                        src={user.picture}
                                                        alt={user.name}
                                                    />
                                                </div>
                                            </div>
                                        </DropdownToggle>
                                        <DropdownMenu align="end">
                                            <DropdownItem as={Link} to="/profile" className="dropdown-item">
                                                <span>
                                                    <i className="fas fa-users-cog fa-fw me-3" />
                                                    <span>
                                                        {t(
                                                            'userDropdownMenu.account'
                                                        )}
                                                    </span>
                                                </span>
                                            </DropdownItem>
                                            <DropdownItem as={Link} to="/my-addresses" className="dropdown-item">
                                                <span>
                                                    <i className="fas fa-server fa-fw me-3" />
                                                    <span>
                                                        {t(
                                                            'userDropdownMenu.addresses'
                                                        )}
                                                    </span>
                                                </span>
                                            </DropdownItem>
                                            <Dropdown.Divider />
                                            <DropdownItem
                                                className="dropdown-item-danger"
                                                onClick={() =>
                                                    logout({
                                                        logoutParams: {
                                                            returnTo: window.location.origin,
                                                        },
                                                    })
                                                }
                                            >
                                                <span>
                                                    <i className="fas fa-sign-out-alt fa-fw me-3" />
                                                    <span>
                                                        {t(
                                                            'userDropdownMenu.logout'
                                                        )}
                                                    </span>
                                                </span>
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </NavItem>
                            </Nav>
                        </Navbar>
                    </div>
                )}
            </>
        )
    }
}

export default withRouter(withAuth0(withTranslation('TopNavBar')(TopNavBar)))
