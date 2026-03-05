import { useTranslation } from 'react-i18next'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownToggle from 'react-bootstrap/DropdownToggle'
import DropdownMenu from 'react-bootstrap/DropdownMenu'
import DropdownItem from 'react-bootstrap/DropdownItem'

import { availableLanguages } from '../../config/constants'

const LanguageSwitcher = () => {
    const { i18n } = useTranslation() // first param ignored i18n

    return (
        <div>
            {availableLanguages.length > 1 && (
                <Dropdown>
                    <DropdownToggle>
                        <span className="me-1">
                            {
                                availableLanguages[
                                    availableLanguages.findIndex(
                                        (lng) =>
                                            lng.countryCode === i18n.language
                                    )
                                ]?.nativeName
                            }
                        </span>
                        <i className="fas fa-caret-down" />
                    </DropdownToggle>
                    <DropdownMenu align="end">
                        {availableLanguages.map((lng) => (
                            <DropdownItem
                                className="dropdown-item"
                                key={lng.countryCode}
                                disabled={i18n.language === lng.countryCode} // disable button if already selected
                                onClick={() => {
                                    i18n.changeLanguage(lng.countryCode)
                                }}
                            >
                                <div className="d-flex justify-content-center">
                                    <span>
                                        {
                                            availableLanguages[
                                                availableLanguages.findIndex(
                                                    (item) => item === lng
                                                )
                                            ]?.nativeName
                                        }
                                    </span>
                                </div>
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
            )}
        </div>
    )
}

export default LanguageSwitcher
