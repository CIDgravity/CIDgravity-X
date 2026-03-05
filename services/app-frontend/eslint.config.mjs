import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
    js.configs.recommended,
    prettier,
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                process: 'readonly',
            },
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
    },
    {
        ignores: ['build/**', 'node_modules/**', '**/vendor/*.js'],
    },
]
