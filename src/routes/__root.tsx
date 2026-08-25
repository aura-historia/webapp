import { TanStackDevtools } from "@tanstack/react-devtools";
import {
    createRootRouteWithContext,
    HeadContent,
    Scripts,
    redirect,
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
import { useEffect, useRef } from "react";
import { Hub } from "aws-amplify/utils";
import { Toaster } from "sonner";
import "@/lib/polyfills/url";
import "@/amplify-config.ts";
import "@/api-config.ts";
import { googleAnalytics } from "@/lib/tracking/googleAnalytics.ts";
import { UserPreferencesProvider } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { getServerPreferences } from "@/features/preferences/server/preferences.ts";
import { getServerTimezone } from "@/lib/server/timezone.ts";
import type { UserPreferences } from "@/features/preferences/types/UserPreferences.ts";
import { useTranslation } from "react-i18next";
import { getPreferredLocale } from "@/lib/server/i18n.ts";
import i18n from "@/i18n/i18n.ts";
import { SUPPORTED_LANGUAGES } from "@/i18n/languages.ts";
import { BANNER_IMAGE_URL, ICON_IMAGE_URL } from "@/lib/seo/seoConstants.ts";
import { ConsentBanner } from "@/features/consent-management/components/ConsentBanner.tsx";
import { SONNER_TOASTER_PROPS } from "@/lib/ui/sonnerToasterConfig";
import { getServerUser } from "@/lib/server/amplify.ts";
import { getLanguageFromPathname, isLocalizedAppPath, localizeHref } from "@/i18n/routing.ts";
import { syncAmplifyTranslations } from "@/features/authentication/lib/amplifyI18nBridge.ts";

interface MyRouterContext {
    queryClient: QueryClient;
    initialPreferences: Partial<UserPreferences>;
    timeZone: string;
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
    beforeLoad: async ({ location }) => {
        let locale = getLanguageFromPathname(location.pathname);

        if (!locale && isLocalizedAppPath(location.pathname)) {
            locale = await getPreferredLocale();
            throw redirect({
                href: localizeHref(location.href, locale),
                replace: true,
                statusCode: 302,
            });
        }

        locale ??= i18n.resolvedLanguage ?? i18n.language;
        if (i18n.language !== locale) {
            await i18n.changeLanguage(locale);
        }
        const serverPreferences = await getServerPreferences();
        const initialPreferences: Partial<UserPreferences> = {
            ...serverPreferences,
        };
        const timeZone = await getServerTimezone();
        const auth = await getServerUser();
        return { initialPreferences, timeZone, serverAuth: auth };
    },
    shellComponent: RootDocument,
});

function RootDocument({ children }: { readonly children: React.ReactNode }) {
    const matches = useMatches();
    const location = useLocation();
    const isLandingPage = matches.some((match) => match.routeId === "/$lng/");
    const { i18n } = useTranslation();
    const { initialPreferences } = Route.useRouteContext();
    const queryClient = useQueryClient();

    // Capture the consent value at first render so init runs only once.
    const initialConsentRef = useRef(initialPreferences?.trackingConsent);
    useEffect(() => {
        googleAnalytics.init(initialConsentRef.current);
    }, []);

    useEffect(() => {
        syncAmplifyTranslations();
    }, []);

    useEffect(() => {
        const searchParams = location.search as Record<string, unknown>;

        googleAnalytics.sendPageView(location.pathname, i18n.language, searchParams);
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
        <UserPreferencesProvider initialPreferences={initialPreferences} locale={i18n.language}>
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
                    <Toaster {...SONNER_TOASTER_PROPS} />
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
