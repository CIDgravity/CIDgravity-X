import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpApi from 'i18next-http-backend'

import { initReactI18next } from 'react-i18next'
import { MissingTranslation } from './shared/services/app'
import { availableLanguages } from './config/constants'

const httpBackendOptions = {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    addPath: '/locales/{{lng}}/{{ns}}.json',
}

i18next
    .use(initReactI18next) // passes i18n down to react-i18next
    .use(LanguageDetector)
    .use(HttpApi)
    .init({
        supportedLngs: availableLanguages.map(function (lng) {
            return lng['countryCode']
        }),
        /*preload: availableLanguages.map(function (lng) {
            return lng['countryCode']
        }),*/ // Maybe need to enable it if languages changes aren't working properly
        fallbackLng: {
            'zh-Hant': ['zh-Hans', 'en-US'], // traditional chinese fallbacks to simplified
            'zh-Hans': ['zh-Hant', 'en-US'], // simplified chinese fallbacks to traditional (why not?)
            default: [availableLanguages[0]['countryCode']], // all other lang simply fallbacks to first element of array
        },
        ns: 'common',
        defaultNS: 'common', // all files will load common and get keys from it by default
        fallbackNS: 'common', // necessary for keys trying to load from common.json if main namespace fails
        keySeparator: '.',
        debug: process.env.NODE_ENV === 'production' ? false : true, // log debugging info in development mode
        interpolation: {
            escapeValue: false, // react already safes from xss attacks
        },
        backend: httpBackendOptions,
        saveMissing: process.env.NODE_ENV === 'production' ? true : false,
        saveMissingTo: 'all',
        missingKeyHandler: (lng, ns, key) => {
            MissingTranslation(lng, ns, key)
        },
    })

export default i18next
