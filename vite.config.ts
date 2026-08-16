import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { devtools } from "@tanstack/devtools-vite";
import { SUPPORTED_LANGUAGES } from "./src/i18n/languages.ts";

const STATIC_PAGE_PATHS = [
    "/",
    "/about-us",
    "/compare/barnebys",
    "/imprint",
    "/partner-program",
    "/partner-program/custom-integration",
    "/privacy",
    "/terms-and-conditions",
] as const;

const PRERENDER_PAGES = SUPPORTED_LANGUAGES.flatMap(({ code }) =>
    STATIC_PAGE_PATHS.map((path) => ({ path: `/${code}${path}` })),
);

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
    legacy: {
        // TODO: Wait for lottie to be updated
        // https://github.com/Gamote/lottie-react/pull/131
        inconsistentCjsInterop: true,
    },
});
