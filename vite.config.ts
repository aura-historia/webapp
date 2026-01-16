import {defineConfig} from 'vite'
import {tanstackStart} from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import {cloudflare} from '@cloudflare/vite-plugin'
import {devtools} from '@tanstack/devtools-vite'


export default defineConfig({
    plugins: [
        // this is the plugin that enables path aliases
        viteTsConfigPaths({
            projects: ['./tsconfig.json'],
        }),
        tailwindcss(),
        devtools({
            removeDevtoolsOnBuild: true,
        }),
        tanstackStart({
            prerender: {
                enabled: true,
                crawlLinks: true,
                filter: ({path}) => {
                    // Exclude authenticated routes
                    if (path.startsWith('/account') || path.startsWith('/watchlist')) {
                        return false
                    }
                    // Exclude search routes (dynamic query params)
                    if (path.startsWith('/search')) {
                        return false
                    }
                    // Exclude API routes
                    return !path.startsWith('/api/');
                },
            },
            sitemap: {
                enabled: true,
                host: 'https://aura-historia.com',
            },
        }),
        viteReact(),
        cloudflare({viteEnvironment: {name: 'ssr'}}),
    ],
})

