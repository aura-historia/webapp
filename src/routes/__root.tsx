import { TanStackDevtools } from "@tanstack/react-devtools";
import {
    createRootRouteWithContext,
    HeadContent,
    Scripts,
    useLocation,
    useMatches,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import manropeFontUrl from "@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2?url";
import newsreaderFontUrl from "@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2?url";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import { Footer } from "@/components/common/Footer.tsx";
import { Header } from "@/components/common/Header.tsx";
import { NavigationProgress } from "@/components/common/NavigationProgress.tsx";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { Hub } from "aws-amplify/utils";
import { useEffect, useRef } from "react";
import { Toaster } from "sonner";
import "@/lib/polyfills/url";
import "@/amplify-config.ts";
import "@/api-config.ts";
import { googleAnalytics } from "@/lib/tracking/googleAnalytics.ts";
import { UserPreferencesProvider } from "@/hooks/preferences/useUserPreferences.tsx";
import { getServerPreferences } from "@/lib/server/preferences.ts";
import type { UserPreferences } from "@/data/internal/preferences/UserPreferences.ts";
import { inferCurrencyFromLocale } from "@/data/internal/common/Currency.ts";
import { useTranslation } from "react-i18next";
import { getLocale } from "@/lib/server/i18n.ts";
import i18n from "@/i18n/i18n.ts";
import { SUPPORTED_LANGUAGES } from "@/i18n/languages.ts";
import { NotFoundComponent } from "@/components/common/NotFoundComponent.tsx";
import { ErrorComponent } from "@/components/common/ErrorComponent.tsx";
import { BANNER_IMAGE_URL, ICON_IMAGE_URL } from "@/lib/seo/seoConstants.ts";
import { ConsentBanner } from "@/components/common/ConsentBanner.tsx";

interface MyRouterContext {
    queryClient: QueryClient;
    initialPreferences: UserPreferences;
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
                    href: manropeFontUrl,
                    as: "font",
                    type: "font/woff2",
                    crossOrigin: "anonymous",
                },
                {
                    rel: "preload",
                    href: newsreaderFontUrl,
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
        // Set locale for initial server side rendering based on browsers preference
        const locale = await getLocale();
        if (i18n.language !== locale) {
            await i18n.changeLanguage(locale);
        }
        // Load persisted user preferences so SSR renders with correct initial state
        const serverPreferences = await getServerPreferences();
        const initialPreferences: UserPreferences = {
            ...serverPreferences,
            currency: serverPreferences.currency ?? inferCurrencyFromLocale(i18n.language),
        };
        return { initialPreferences };
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
    const { initialPreferences } = Route.useRouteContext();
    const queryClient = useQueryClient();

    // Capture the consent value at first render so init runs only once.
    const initialConsentRef = useRef(initialPreferences.trackingConsent);
    useEffect(() => {
        googleAnalytics.init(initialConsentRef.current);
    }, []);

    useEffect(() => {
        const currentPath = location.pathname;
        const searchParams = location.search as Record<string, unknown>;

        googleAnalytics.sendPageView(currentPath, i18n.language, searchParams);
    }, [location, i18n.language]);

    useEffect(() => {
        const hubListenerCancelToken = Hub.listen("auth", ({ payload }) => {
            if (payload.event === "signedIn" || payload.event === "signedOut") {
                queryClient.refetchQueries();
            }
        });

        return () => hubListenerCancelToken();
    }, [queryClient.refetchQueries]);

    return (
        <UserPreferencesProvider initialPreferences={initialPreferences}>
            <html lang={i18n.language || "en"}>
                <head>
                    <HeadContent />
                </head>
                <body className="bg-background">
                    <NavigationProgress />
                    <div className={"min-h-screen flex flex-col"}>
                        <Header />
                        <main className={isLandingPage ? "flex-1 -mt-20" : "flex-1"}>
                            {children}
                        </main>
                        <Footer />
                    </div>
                    <Toaster position="top-center" richColors />
                    <ConsentBanner />
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
        </UserPreferencesProvider>
    );
}
