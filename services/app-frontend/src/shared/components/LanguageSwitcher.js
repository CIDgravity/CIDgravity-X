import { useTranslation } from 'react-i18next'
import {
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap'

import { availableLanguages } from '../../config/constants'

const LanguageSwitcher = () => {
    const { i18n } = useTranslation() // first param ignored i18n

    return (
        <div>
            {availableLanguages.length > 1 && (
                <UncontrolledDropdown nav>
                    <DropdownToggle nav caret>
                        <span>
                            {
                                availableLanguages[
                                    availableLanguages.findIndex(
                                        (lng) =>
                                            lng.countryCode === i18n.language
                                    )
                                ]?.nativeName
                            }
                        </span>
                    </DropdownToggle>
                    <DropdownMenu end>
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
                </UncontrolledDropdown>
            )}
        </div>
    )
}

export default LanguageSwitcher
