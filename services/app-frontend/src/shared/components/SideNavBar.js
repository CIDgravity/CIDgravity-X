import React, { useEffect, useState } from 'react'

import {
    Menu,
    MenuItem,
    Sidebar,
    SubMenu,
} from 'react-pro-sidebar'

import {
    FaArrowDown,
    FaArrowUp,
    FaBan,
    FaBars,
    FaChartBar,
    FaCog,
    FaDollarSign,
    FaFlask,
    FaHistory,
    FaLifeRing,
    FaKey,
    FaUser,
    FaFilter,
    FaInfo,
    FaRuler
} from 'react-icons/fa'

import { isBrowser } from 'react-device-detect'
import { Link } from 'react-router'

import { Tooltip } from 'react-tooltip'

import { SESSION_STORAGE_TENANT_KEY } from '../../config/constants'
import { GetVersionInfos } from '../services/app'
import { useTranslation } from 'react-i18next'

import { GetTenantValuesFromSessionStorage, GetSelectedAddressIdFromSessionStorage, GetSelectedAddressActorTypeFromSessionStorage } from '../utils/auth'

const SideNavBar = () => {
    const { t } = useTranslation('SideNavBar') // second param ignored i18n
    const [isToggled, setIsToggled] = useState(false)
    const [isHidden, setIsHidden] = useState(true)
    const [isClientMode, setIsClientMode] = useState(false)
    const [isProviderMode, setIsProviderMode] = useState(false)
    const [backendVersion, setBackendVersion] = useState('')

    // represent current selected address id (short) and address actor type (storageminer or account)
    const [selectedAddress, setSelectedAddress] = useState(GetSelectedAddressIdFromSessionStorage())
    const [selectedAddressActorType, setSelectedAddressActorType] = useState(GetSelectedAddressActorTypeFromSessionStorage())

    window.addEventListener(SESSION_STORAGE_TENANT_KEY, () => {
        const [newAddressId, actorType] = GetTenantValuesFromSessionStorage();

        if (newAddressId === null || newAddressId === undefined) {
            setIsHidden(true)
        } else {
            setIsHidden(false)
        }

        // Define which mode to display (client or provider) depending on selected address actor type
        setIsClientMode(actorType === 'account')
        setIsProviderMode(actorType === 'storageminer')
        setSelectedAddress(newAddressId)
        setSelectedAddressActorType(actorType)
    })

    useEffect(() => {
        setIsHidden(selectedAddress === null)
        setIsClientMode(selectedAddressActorType === 'account')
        setIsProviderMode(selectedAddressActorType === 'storageminer')
    }, [selectedAddress, selectedAddressActorType])

    // TODO: get this info via websocket instead - now user need to refresh to get accurate information
    useEffect(() => {
        updateBackendVersion()
    }, [])

    const updateBackendVersion = () => {
        GetVersionInfos()
            .then((res) => {
                setBackendVersion(res.data.result.version)
            })
            .catch((e) => {
                console.log('Error while fetching infos versions', e)
            })
    }

    const handleToggleNavbar = () => {
        setIsToggled(!isToggled)
    }

    const handleCloseNavbar = () => {
        setIsToggled(false)
    }

    const getDetailedVersions = () => {
        const frontendVersion = process.env.REACT_APP_VERSION

        if (frontendVersion === backendVersion) {
            return `Frontend & Backend - ${frontendVersion}`
        } else {
            return `Frontend - ${frontendVersion} <br /> Backend - ${backendVersion}`
        }
    }

    const getVersionComponent = () => {
        return (
            <div
                className="sidebar-version m-2"
                data-tooltip-id="version"
                data-tooltip-html={getDetailedVersions()}
            >
                <small>{process.env.REACT_APP_VERSION}</small>
                <Tooltip id="version" place="top" />
            </div>
        )
    }

    return (
        <>
            {!isToggled ? (
                <div
                    className="btn-toggle mt-2 ms-2"
                    onClick={handleToggleNavbar}
                >
                    <div className="btn-toggle-inner">
                        <FaBars />
                    </div>
                </div>
            ) : null}

            <Sidebar
                breakPoint="md"
                toggled={isToggled}
                onBackdropClick={handleCloseNavbar}
                backgroundColor="#000b44"
                width="230px"
                collapsedWidth="80px"
            >
                <div className="sidebar-header mb-4">
                    <div
                        className="d-flex justify-content-center"
                        onClick={handleCloseNavbar}
                    >
                        <div>
                            <Link className="link-no-border" to="/">
                                <img
                                    className="logo-cidgravity"
                                    src="/images/CIDgravity-Logo-Transparent.png"
                                    alt="CIDgravity"
                                />
                            </Link>
                        </div>
                    </div>
                </div>

                {isClientMode && !isHidden && (
                    <>
                        <div className="sidebar-content">
                            <Menu>
                                <span onClick={handleCloseNavbar}>
                                    <MenuItem icon={<FaChartBar color="#222b2a" />} component={<Link to={`/client/${selectedAddress}`} />}>
                                        {t('menu.client.dashboard')}
                                    </MenuItem>

                                    <MenuItem icon={<FaInfo color="#222b2a" />} component={<Link to={`/client/${selectedAddress}/information`} />}>
                                        {t('menu.client.informations')}
                                    </MenuItem>

                                    <MenuItem icon={<FaRuler color="#222b2a" />} component={<Link to={`/client/${selectedAddress}/onboarding-policy`} />}>
                                        {t('menu.client.policyGroup')}
                                    </MenuItem>

                                    <MenuItem icon={<FaBan color="#222b2a" />} component={<Link to={`/client/${selectedAddress}/blacklist`} />}>
                                        {t('menu.client.blacklist')}
                                    </MenuItem>

                                    <MenuItem icon={<FaHistory color="#222b2a" />} component={<Link to={`/client/${selectedAddress}/storage-history`} />}>
                                        {t('menu.client.storageDealsHistory')}
                                    </MenuItem>
                                </span>
                            </Menu>
                        </div>

                        <div className="sidebar-footer">
                            <Menu>
                                <span onClick={handleCloseNavbar}>
                                    <MenuItem id="menuClientSettings" icon={<FaCog color="#222b2a" />} component={<Link to={`/client/${selectedAddress}/settings`} />}>
                                        {t('menu.client.settings')}
                                    </MenuItem>
                                </span>

                                <span onClick={handleCloseNavbar}>
                                    <MenuItem
                                        id="menuHelp"
                                        icon={<FaLifeRing color="#222b2a" />}
                                        component={<Link to={`/help`} />}
                                    >
                                        {t('menu.client.helpCenter')}
                                    </MenuItem>
                                </span>
                            </Menu>

                            {getVersionComponent()}
                        </div>
                    </>
                )}

                {isProviderMode && !isHidden && (
                    <>
                        <div className="sidebar-content">
                            <Menu>
                                <span onClick={handleCloseNavbar}>
                                    <MenuItem
                                        icon={<FaChartBar color="#222b2a" />}
                                        component={<Link to={`/provider/${selectedAddress}`} />}
                                    >
                                        {t('menu.provider.dashboard')}
                                    </MenuItem>
                                </span>

                                <span onClick={handleCloseNavbar}>
                                    <MenuItem
                                        id="menuClient"
                                        icon={<FaUser color="#222b2a" />}
                                        component={<Link to={`/provider/${selectedAddress}/client`} />}
                                    >
                                        {t('menu.provider.client')}
                                    </MenuItem>
                                </span>

                                <SubMenu
                                    label={t('menu.provider.storage.title')}
                                    icon={<FaArrowDown color="#222B2A" />}
                                    defaultOpen
                                >
                                    <span onClick={handleCloseNavbar}>
                                        <MenuItem
                                            id="menuStorageDashboard"
                                            icon={<FaChartBar color="#fff" />}
                                            component={<Link to={`/provider/${selectedAddress}/storage-dashboard`} />}
                                        >
                                            {t('menu.provider.storage.dashboard')}
                                        </MenuItem>
                                    </span>

                                    {isBrowser && (
                                        <span onClick={handleCloseNavbar}>
                                            <MenuItem
                                                id="menuPricingModel"
                                                icon={
                                                    <FaDollarSign color="#fff" />
                                                }
                                                component={<Link to={`/provider/${selectedAddress}/pricing-model`} />}
                                            >
                                                {t('menu.provider.storage.pricing')}
                                            </MenuItem>
                                        </span>
                                    )}

                                    {isBrowser && (
                                        <span onClick={handleCloseNavbar}>
                                            <MenuItem
                                                id="menuStorageAcceptanceLogic"
                                                icon={<FaFilter color="#fff" />}
                                                component={<Link to={`/provider/${selectedAddress}/storage-acceptance-logic`} />}
                                            >
                                                {t(
                                                    'menu.provider.storage.acceptanceLogic'
                                                )}
                                            </MenuItem>
                                        </span>
                                    )}

                                    <span onClick={handleCloseNavbar}>
                                        <MenuItem
                                            id="menuHistory"
                                            icon={<FaHistory color="#fff" />}
                                            component={<Link to={`/provider/${selectedAddress}/storage-history`} />}
                                        >
                                            {t('menu.provider.storage.history')}
                                        </MenuItem>
                                    </span>

                                    {isBrowser && (
                                        <span onClick={handleCloseNavbar}>
                                            <MenuItem
                                                id="menuPlayground"
                                                icon={<FaFlask color="#fff" />}
                                                component={<Link to={`/provider/${selectedAddress}/playground`} />}
                                            >
                                                {t('menu.provider.storage.playground')}
                                            </MenuItem>
                                        </span>
                                    )}

                                    <span onClick={handleCloseNavbar}>
                                        <MenuItem
                                            id="menuBlacklist"
                                            icon={<FaBan color="#fff" />}
                                            component={<Link to={`/provider/${selectedAddress}/blacklist`} />}
                                        >
                                            {t('menu.provider.storage.blacklist')}
                                        </MenuItem>
                                    </span>
                                </SubMenu>

                                <span className="mt-4">
                                    <SubMenu
                                        label={t('menu.provider.retrieval.title')}
                                        icon={<FaArrowUp color="#222b2a" />}
                                    >
                                        <span onClick={handleCloseNavbar}>
                                            <MenuItem
                                                id="menuRetrievalDashboard"
                                                icon={
                                                    <FaChartBar color="#fff" />
                                                }
                                                component={<Link to={`/provider/${selectedAddress}/retrieval-dashboard`} />}
                                            >
                                                {t('menu.provider.retrieval.dashboard')}
                                            </MenuItem>
                                        </span>

                                        <span onClick={handleCloseNavbar}>
                                            <MenuItem
                                                id="menuHistory"
                                                icon={
                                                    <FaHistory color="#fff" />
                                                }
                                                component={<Link to={`/provider/${selectedAddress}/retrieval-history`} />}
                                            >
                                                {t('menu.provider.retrieval.history')}
                                            </MenuItem>
                                        </span>

                                        {isBrowser && (
                                            <span onClick={handleCloseNavbar}>
                                                <MenuItem
                                                    id="menuACL"
                                                    icon={
                                                        <FaKey color="#fff" />
                                                    }
                                                    component={<Link to={`/provider/${selectedAddress}/retrieval-acl`} />}
                                                >
                                                    {t('menu.provider.retrieval.acl')}
                                                </MenuItem>
                                            </span>
                                        )}
                                    </SubMenu>
                                </span>
                            </Menu>
                        </div>

                        <div className="sidebar-footer">
                            <Menu>
                                {!isHidden && (
                                    <span onClick={handleCloseNavbar}>
                                        <MenuItem icon={<FaInfo color="#222b2a" />} component={<Link to={`/provider/${selectedAddress}/information`} />}>
                                            {t('menu.provider.informations')}
                                        </MenuItem>

                                        <MenuItem id="menuSettings" icon={<FaCog color="#222b2a" />} component={<Link to={`/provider/${selectedAddress}/settings`} />}>
                                            {t('menu.provider.settings')}
                                        </MenuItem>
                                    </span>
                                )}

                                <span onClick={handleCloseNavbar}>
                                    <MenuItem
                                        id="menuHelp"
                                        icon={<FaLifeRing color="#222b2a" />}
                                        component={<Link to={`/help`} />}
                                    >
                                        {t('menu.provider.helpCenter')}
                                    </MenuItem>
                                </span>
                            </Menu>

                            {getVersionComponent()}
                        </div>
                    </>
                )}
            </Sidebar>
        </>
    )
}
export default SideNavBar
