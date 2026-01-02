import {defineConfig} from 'vite'
import {tanstackStart} from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import {cloudflare} from '@cloudflare/vite-plugin'
import {devtools} from '@tanstack/devtools-vite'


export default defineConfig({
    resolve: {
        alias: {
            '@': '/src',
        }
    },
    plugins: [
        // this is the plugin that enables path aliases
        viteTsConfigPaths({
            projects: ['./tsconfig.json'],
        }),
        tailwindcss(),
        devtools({
            removeDevtoolsOnBuild: true,
        }),
        tanstackStart(),
        viteReact(),
        cloudflare({viteEnvironment: {name: 'ssr'}}),
    ],
})

