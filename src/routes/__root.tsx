import { TanStackDevtools } from "@tanstack/react-devtools";
import {
    createRootRouteWithContext,
    HeadContent,
    Scripts,
    useLocation,
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
import { useEffect, useRef } from "react";
import { Toaster } from "sonner";
import "@/lib/polyfills/url";
import "@/amplify-config.ts";
import "@/api-config.ts";
import { googleAnalytics } from "@/lib/tracking/googleAnalytics.ts";
import { useUserPreferences } from "@/hooks/useUserPreferences.tsx";
import { useTranslation } from "react-i18next";
import { getLocale } from "@/lib/server/i18n.ts";
import i18n from "@/i18n/i18n.ts";
import { SUPPORTED_LANGUAGES } from "@/i18n/languages.ts";
import { NotFoundComponent } from "@/components/common/NotFoundComponent.tsx";
import { ErrorComponent } from "@/components/common/ErrorComponent.tsx";
import { BANNER_IMAGE_URL, ICON_IMAGE_URL } from "@/lib/seoConstants.ts";

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
                    content: "summary_large_image",
                },
                {
                    name: "twitter:site",
                    content: "@aurahistoria",
                },
                {
                    name: "twitter:image",
                    content: BANNER_IMAGE_URL,
                },
                {
                    name: "twitter:image:alt",
                    content: i18n.t("meta.siteName"),
                },
                // Additional Open Graph defaults
                {
                    property: "og:type",
                    content: "website",
                },
                {
                    property: "og:image",
                    content: BANNER_IMAGE_URL,
                },
                {
                    property: "og:image:alt",
                    content: i18n.t("meta.siteName"),
                },
            ],
            links: [
                {
                    rel: "icon",
                    href: "/favicon.png",
                    type: "image/png",
                },
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
                {
                    rel: "icon",
                    href: ICON_IMAGE_URL,
                    type: "image/png",
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
    const location = useLocation();
    const isLandingPage = matches.some((match) => match.routeId === "/");
    const { i18n } = useTranslation();
    const { preferences } = useUserPreferences();

    // Capture the consent value at first render so init runs only once.
    const initialConsentRef = useRef(preferences.trackingConsent);
    useEffect(() => {
        googleAnalytics.init(initialConsentRef.current);
    }, []);

    useEffect(() => {
        const currentPath = location.pathname;
        const searchParams = location.search as Record<string, unknown>;

        googleAnalytics.sendPageView(currentPath, i18n.language, searchParams);
    }, [location, i18n.language]);

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
                    <main className={isLandingPage ? "flex-1 -mt-20" : "flex-1"}>{children}</main>
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
