import {defineConfig} from 'vite'
import {tanstackStart} from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import {cloudflare} from '@cloudflare/vite-plugin'


export default defineConfig({
    plugins: [
        // this is the plugin that enables path aliases
        viteTsConfigPaths({
            projects: ['./tsconfig.json'],
        }),
        tailwindcss(),

        cloudflare({viteEnvironment: {name: 'ssr'}}),
        tanstackStart(),
        viteReact(),
    ],
})

