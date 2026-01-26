import { TanStackDevtools } from "@tanstack/react-devtools";
import {
    createRootRouteWithContext,
    HeadContent,
    Scripts,
    useMatches,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import geistFontUrl from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import { Footer } from "@/components/common/Footer.tsx";
import { Header } from "@/components/common/Header.tsx";
import { NavigationProgress } from "@/components/common/NavigationProgress.tsx";
import type { QueryClient } from "@tanstack/react-query";
import type React from "react";
import { Toaster } from "sonner";
import "@/lib/polyfills/url";
import "@/amplify-config.ts";
import "@/api-config.ts";
import { useTranslation } from "react-i18next";
import { getLocale } from "@/lib/server/i18n.server.ts";
import i18n from "@/i18n/i18n.ts";
import { SUPPORTED_LANGUAGES } from "@/i18n/languages.ts";
import { NotFoundComponent } from "@/components/common/NotFoundComponent.tsx";
import { ErrorComponent } from "@/components/common/ErrorComponent.tsx";

interface MyRouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    head: () => {
        const locale = i18n.language || "en";
        const ogLocale =
            SUPPORTED_LANGUAGES.find((supportedLng) => supportedLng.code === locale)
                ?.region_locale || "en_US";

        return {
            meta: [
                {
                    charSet: "utf-8",
                },
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1",
                },
                {
                    title: i18n.t("common.auraHistoria"),
                },
                {
                    name: "description",
                    content: i18n.t("meta.defaultDescription"),
                },
                // Open Graph defaults
                {
                    property: "og:site_name",
                    content: i18n.t("meta.siteName"),
                },
                {
                    property: "og:locale",
                    content: ogLocale,
                },
                // Twitter Card defaults
                {
                    name: "twitter:card",
                    content: "summary",
                },
            ],
            links: [
                {
                    rel: "stylesheet",
                    href: appCss,
                },
                {
                    rel: "preload",
                    href: geistFontUrl,
                    as: "font",
                    type: "font/woff2",
                    crossOrigin: "anonymous",
                },
            ],
        };
    },
    beforeLoad: async () => {
        // Set locale for initial server side rendering based on browsers pref
        const locale = await getLocale();
        if (i18n.language !== locale) {
            await i18n.changeLanguage(locale);
        }
    },
    shellComponent: RootDocument,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
});

function RootDocument({ children }: { readonly children: React.ReactNode }) {
    const matches = useMatches();
    const isLandingPage = matches.some((match) => match.routeId === "/");
    const { i18n } = useTranslation();

    return (
        <html lang={i18n.language || "en"}>
            <head>
                <HeadContent />
            </head>
            <body
                className={
                    isLandingPage
                        ? "[background:var(--linear-gradient-main)]"
                        : "bg-[repeating-linear-gradient(45deg,var(--border)_0,var(--border)_1px,transparent_1px,transparent_40px)] bg-fixed"
                }
            >
                <NavigationProgress />
                <div className={"min-h-screen flex flex-col"}>
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                </div>
                <Toaster position="top-center" richColors />
                <TanStackDevtools
                    config={{
                        position: "bottom-left",
                    }}
                    plugins={[
                        {
                            name: "Tanstack Router",
                            render: <TanStackRouterDevtoolsPanel />,
                        },
                        TanStackQueryDevtools,
                    ]}
                />
                <Scripts />
            </body>
        </html>
    );
}
