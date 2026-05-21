import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { devtools } from "@tanstack/devtools-vite";

const EXCLUDED_ROUTES = new Set([
    "/me/",
    "/search",
    "/api/",
    "/login",
    // Partner program sub-routes are placeholders linked to from /partners
    // until their landing pages exist. Skip prerendering to avoid 404 crawls.
    "/partners/apply",
    "/partners/woocommerce",
    "/partners/shopify",
    "/partners/custom-api",
]);

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
        // TODO: Wait for lottie to be updated
        // https://github.com/Gamote/lottie-react/pull/131
        inconsistentCjsInterop: true,
    },
});
