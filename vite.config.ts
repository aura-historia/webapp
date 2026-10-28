import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { devtools } from "@tanstack/devtools-vite";
import { PRERENDER_PAGES } from "./src/lib/seo/staticPages.ts";

export default defineConfig({
    plugins: [
        tailwindcss(),
        devtools({
            removeDevtoolsOnBuild: true,
        }),
        tanstackStart({
            pages: PRERENDER_PAGES,
            prerender: {
                enabled: true,
                autoStaticPathsDiscovery: false,
                concurrency: 1,
                crawlLinks: false,
            },
            sitemap: {
                enabled: true,
                host: "https://aura-historia.com",
            },
        }),
        viteReact(),
        cloudflare({ viteEnvironment: { name: "ssr" } }),
    ],
    resolve: {
        tsconfigPaths: true,
    },
});
