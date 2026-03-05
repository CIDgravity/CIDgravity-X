import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let version = 'unknown'
try {
    version = execSync('bash ../../shared/get-git-tag-or-hash.sh').toString().trim()
} catch (e) {
    console.warn('Could not determine version from git:', e.message)
}

// Custom plugin to treat .js files in src/ as JSX
// This is needed because the codebase uses .js extension for JSX files (CRA convention)
function jsxInJs() {
    return {
        name: 'jsx-in-js',
        enforce: 'pre',
        async transform(code, id) {
            if (/src\/.*\.js$/.test(id)) {
                return transformWithEsbuild(code, id + '?ext=.jsx', {
                    loader: 'jsx',
                    jsx: 'automatic',
                })
            }
        },
    }
}

export default defineConfig({
    plugins: [jsxInJs(), react()],
    resolve: {
        alias: {
            views: path.resolve(__dirname, 'src/views'),
            shared: path.resolve(__dirname, 'src/shared'),
            scss: path.resolve(__dirname, 'src/scss'),
            config: path.resolve(__dirname, 'src/config'),
            auth: path.resolve(__dirname, 'src/auth'),
            buffer: 'buffer/',
        },
    },
    define: {
        'process.env.REACT_APP_VERSION': JSON.stringify(version),
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: { '.js': 'jsx' },
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: [
                    'import',
                    'global-builtin',
                    'color-functions',
                    'if-function',
                ],
                quietDeps: true,
            },
        },
    },
    server: {
        port: 4040,
        open: false,
    },
    build: {
        outDir: 'build',
        chunkSizeWarningLimit: 5000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return
                    // React core (depended on by everything, rarely changes)
                    if (/node_modules\/(react-dom|react-router|react\/|scheduler\/)/.test(id)) return 'vendor-react'
                    // All other vendor dependencies
                    return 'vendor-libs'
                },
            },
        },
    },
})
