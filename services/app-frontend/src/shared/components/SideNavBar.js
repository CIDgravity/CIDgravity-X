import React, { useEffect, useState } from 'react'

import {
    Menu,
    MenuItem,
    ProSidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
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
import { Link } from 'react-router-dom'

import ReactTooltip from 'react-tooltip'

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
                data-for="version"
                data-tip={getDetailedVersions()}
            >
                <small>{process.env.REACT_APP_VERSION}</small>
                <ReactTooltip id="version" place="top" html={true} />
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

            <ProSidebar
                breakPoint="md"
                toggled={isToggled}
                onToggle={handleToggleNavbar}
            >
                <SidebarHeader className="mb-4">
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
                </SidebarHeader>

                {isClientMode && !isHidden && (
                    <>
                        <SidebarContent>
                            <Menu iconShape="circle">
                                <span onClick={handleCloseNavbar}>
                                    <MenuItem icon={<FaChartBar color="#222b2a" />}>
                                        {t('menu.client.dashboard')}
                                        <Link to={`/client/${selectedAddress}`} />
                                    </MenuItem>

                                    <MenuItem icon={<FaInfo color="#222b2a" />}>
                                        {t('menu.client.informations')}
                                        <Link to={`/client/${selectedAddress}/information`} />
                                    </MenuItem>

                                    <MenuItem icon={<FaRuler color="#222b2a" />}>
                                        {t('menu.client.policyGroup')}
                                        <Link to={`/client/${selectedAddress}/onboarding-policy`} />
                                    </MenuItem>

                                    <MenuItem icon={<FaBan color="#222b2a" />}>
                                        {t('menu.client.blacklist')}
                                        <Link to={`/client/${selectedAddress}/blacklist`}/>
                                    </MenuItem>

                                    <MenuItem icon={<FaHistory color="#222b2a" />}>
                                        {t('menu.client.storageDealsHistory')}
                                        <Link to={`/client/${selectedAddress}/storage-history`}/>
                                    </MenuItem>
                                </span>
                            </Menu>
                        </SidebarContent>

                        <SidebarFooter>
                            <Menu iconShape="circle">
                                <span onClick={handleCloseNavbar}>
                                    <MenuItem id="menuClientSettings" icon={<FaCog color="#222b2a" />}>
                                        {t('menu.client.settings')}
                                        <Link to={`/client/${selectedAddress}/settings`} />
                                    </MenuItem>
                                </span>

                                <span onClick={handleCloseNavbar}>
                                    <MenuItem
                                        id="menuHelp"
                                        icon={<FaLifeRing color="#222b2a" />}
                                    >
                                        {t('menu.client.helpCenter')}
                                        <Link to={`/help`} />
                                    </MenuItem>
                                </span>
                            </Menu>

                            {getVersionComponent()}
                        </SidebarFooter>
                    </>
                )}

                {isProviderMode && !isHidden && (
                    <>
                        <SidebarContent>
                            <Menu iconShape="circle">
                                <span onClick={handleCloseNavbar}>
                                    <MenuItem
                                        icon={<FaChartBar color="#222b2a" />}
                                    >
                                        {t('menu.provider.dashboard')}
                                        <Link
                                            to={`/provider/${selectedAddress}`}
                                        />
                                    </MenuItem>
                                </span>

                                <span onClick={handleCloseNavbar}>
                                    <MenuItem
                                        id="menuClient"
                                        icon={<FaUser color="#222b2a" />}
                                    >
                                        {t('menu.provider.client')}
                                        <Link
                                            to={`/provider/${selectedAddress}/client`}
                                        />
                                    </MenuItem>
                                </span>

                                <SubMenu
                                    title={t('menu.provider.storage.title')}
                                    icon={<FaArrowDown color="#222B2A" />}
                                    defaultOpen
                                >
                                    <span onClick={handleCloseNavbar}>
                                        <MenuItem
                                            id="menuStorageDashboard"
                                            icon={<FaChartBar color="#fff" />}
                                        >
                                            {t('menu.provider.storage.dashboard')}
                                            <Link
                                                to={`/provider/${selectedAddress}/storage-dashboard`}
                                            />
                                        </MenuItem>
                                    </span>

                                    {isBrowser && (
                                        <span onClick={handleCloseNavbar}>
                                            <MenuItem
                                                id="menuPricingModel"
                                                icon={
                                                    <FaDollarSign color="#fff" />
                                                }
                                            >
                                                {t('menu.provider.storage.pricing')}
                                                <Link
                                                    to={`/provider/${selectedAddress}/pricing-model`}
                                                />
                                            </MenuItem>
                                        </span>
                                    )}

                                    {isBrowser && (
                                        <span onClick={handleCloseNavbar}>
                                            <MenuItem
                                                id="menuStorageAcceptanceLogic"
                                                icon={<FaFilter color="#fff" />}
                                            >
                                                {t(
                                                    'menu.provider.storage.acceptanceLogic'
                                                )}
                                                <Link
                                                    to={`/provider/${selectedAddress}/storage-acceptance-logic`}
                                                />
                                            </MenuItem>
                                        </span>
                                    )}

                                    <span onClick={handleCloseNavbar}>
                                        <MenuItem
                                            id="menuHistory"
                                            icon={<FaHistory color="#fff" />}
                                        >
                                            {t('menu.provider.storage.history')}
                                            <Link
                                                to={`/provider/${selectedAddress}/storage-history`}
                                            />
                                        </MenuItem>
                                    </span>

                                    {isBrowser && (
                                        <span onClick={handleCloseNavbar}>
                                            <MenuItem
                                                id="menuPlayground"
                                                icon={<FaFlask color="#fff" />}
                                            >
                                                {t('menu.provider.storage.playground')}
                                                <Link
                                                    to={`/provider/${selectedAddress}/playground`}
                                                />
                                            </MenuItem>
                                        </span>
                                    )}

                                    <span onClick={handleCloseNavbar}>
                                        <MenuItem
                                            id="menuBlacklist"
                                            icon={<FaBan color="#fff" />}
                                        >
                                            {t('menu.provider.storage.blacklist')}
                                            <Link
                                                to={`/provider/${selectedAddress}/blacklist`}
                                            />
                                        </MenuItem>
                                    </span>
                                </SubMenu>

                                <span className="mt-4">
                                    <SubMenu
                                        title={t('menu.provider.retrieval.title')}
                                        icon={<FaArrowUp color="#222b2a" />}
                                    >
                                        <span onClick={handleCloseNavbar}>
                                            <MenuItem
                                                id="menuRetrievalDashboard"
                                                icon={
                                                    <FaChartBar color="#fff" />
                                                }
                                            >
                                                {t('menu.provider.retrieval.dashboard')}
                                                <Link
                                                    to={`/provider/${selectedAddress}/retrieval-dashboard`}
                                                />
                                            </MenuItem>
                                        </span>

                                        <span onClick={handleCloseNavbar}>
                                            <MenuItem
                                                id="menuHistory"
                                                icon={
                                                    <FaHistory color="#fff" />
                                                }
                                            >
                                                {t('menu.provider.retrieval.history')}
                                                <Link
                                                    to={`/provider/${selectedAddress}/retrieval-history`}
                                                />
                                            </MenuItem>
                                        </span>

                                        {isBrowser && (
                                            <span onClick={handleCloseNavbar}>
                                                <MenuItem
                                                    id="menuACL"
                                                    icon={
                                                        <FaKey color="#fff" />
                                                    }
                                                >
                                                    {t('menu.provider.retrieval.acl')}
                                                    <Link
                                                        to={`/provider/${selectedAddress}/retrieval-acl`}
                                                    />
                                                </MenuItem>
                                            </span>
                                        )}
                                    </SubMenu>
                                </span>
                            </Menu>
                        </SidebarContent>

                        <SidebarFooter>
                            <Menu iconShape="circle">
                                {!isHidden && (
                                    <span onClick={handleCloseNavbar}>
                                        <MenuItem icon={<FaInfo color="#222b2a" />}>
                                            {t('menu.provider.informations')}
                                            <Link to={`/provider/${selectedAddress}/information`} />
                                        </MenuItem>

                                        <MenuItem id="menuSettings" icon={<FaCog color="#222b2a" />}>
                                            {t('menu.provider.settings')}
                                            <Link to={`/provider/${selectedAddress}/settings`} />
                                        </MenuItem>
                                    </span>
                                )}

                                <span onClick={handleCloseNavbar}>
                                    <MenuItem
                                        id="menuHelp"
                                        icon={<FaLifeRing color="#222b2a" />}
                                    >
                                        {t('menu.provider.helpCenter')}
                                        <Link to={`/help`} />
                                    </MenuItem>
                                </span>
                            </Menu>

                            {getVersionComponent()}
                        </SidebarFooter>
                    </>
                )}
            </ProSidebar>
        </>
    )
}
export default SideNavBar
