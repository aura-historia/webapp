import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { devtools } from "@tanstack/devtools-vite";

const EXCLUDED_ROUTES = new Set(["/account", "/watchlist", "/search", "/api/", "/login"]);

export default defineConfig({
    plugins: [
        tailwindcss(),
        devtools({
            removeDevtoolsOnBuild: true,
        }),
        tanstackStart({
            prerender: {
                enabled: true,
                crawlLinks: true,
                filter: ({ path }) => {
                    const isExcludedRoute = [...EXCLUDED_ROUTES].some((route) =>
                        path.includes(route),
                    );

                    return !isExcludedRoute;
                },
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
        // TODO: Report to GA4
        // https://vite.dev/guide/migration#consistent-commonjs-interop
        inconsistentCjsInterop: true,
    },
});
