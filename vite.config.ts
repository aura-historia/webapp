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
                autoStaticPathsDiscovery: false,
                concurrency: 14,
                crawlLinks: true,
                retryCount: 2,
                retryDelay: 1000,
                maxRedirects: 5,
                failOnError: true,
            },
            pages: [
                {
                    path: '/',
                    prerender: { enabled: true },
                },
                {
                    path: '/imprint',
                    prerender: { enabled: true },
                },
                {
                    path: '/privacy',
                    prerender: { enabled: true },
                },
            ],
        }),
        viteReact(),
        cloudflare({viteEnvironment: {name: 'ssr'}}),
    ],
})

