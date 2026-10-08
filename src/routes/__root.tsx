import { TanStackDevtools } from "@tanstack/react-devtools";
import {
    createRootRouteWithContext,
    HeadContent,
    Scripts,
    redirect,
    useNavigate,
    useLocation,
    useMatches,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import manropeFontUrl from "@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2?url";
import newsreaderFontUrl from "@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2?url";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import { Footer } from "@/features/app-shell/components/Footer.tsx";
import { Header } from "@/features/app-shell/components/Header.tsx";
import { NavigationProgress } from "@/features/app-shell/components/NavigationProgress.tsx";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useRef } from "react";
import { Hub } from "aws-amplify/utils";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";
import { Toaster, toast } from "sonner";
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
import {
    getLanguageFromPathname,
    isLocalizedAppPath,
    isSupportedLanguage,
    localizeHref,
} from "@/i18n/routing.ts";
import { DEFAULT_LANGUAGE } from "@/i18n/languages.ts";
import { syncAmplifyTranslations } from "@/features/authentication/lib/amplifyI18nBridge.ts";
import { clearViewerScopedQueries } from "@/features/authentication/lib/clearViewerScopedQueries.ts";
import { createFederatedAuthCompletionCoordinator } from "@/features/authentication/lib/federatedAuthCompletion.ts";
import { storePendingEmail } from "@/features/authentication/components/pendingSignUpEmail.ts";

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
    const { i18n, t } = useTranslation();
    const { initialPreferences } = Route.useRouteContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate({ from: "/$lng" });
    const navigateRef = useRef(navigate);
    const translationRef = useRef(t);
    const localeRef = useRef(DEFAULT_LANGUAGE);
    const authQueryRefreshRef = useRef<Promise<void> | null>(null);

    navigateRef.current = navigate;
    translationRef.current = t;
    const routeLocale = getLanguageFromPathname(location.pathname);
    const currentLocale = isSupportedLanguage(routeLocale)
        ? routeLocale
        : isSupportedLanguage(i18n.resolvedLanguage ?? i18n.language)
          ? (i18n.resolvedLanguage ?? i18n.language)
          : DEFAULT_LANGUAGE;
    localeRef.current = currentLocale;

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
        const completionCoordinator = createFederatedAuthCompletionCoordinator(async (state) => {
            const locale = state?.locale ?? localeRef.current;
            const navigateToDestination = async () => {
                await navigateRef.current({
                    href: state?.redirectPath
                        ? localizeHref(state.redirectPath, locale)
                        : `/${locale}`,
                    viewTransition: true,
                });
            };

            try {
                // The redirect listener caches Cognito tokens before dispatching
                // this event. Refresh user state and auth-dependent data before navigation.
                await getCurrentUser();

                const queryRefresh = authQueryRefreshRef.current;
                if (queryRefresh) {
                    await queryRefresh;
                } else {
                    await queryClient.refetchQueries();
                }

                if (state?.intent === "sign-up") {
                    let email = "";
                    try {
                        email = (await fetchUserAttributes()).email?.trim() ?? "";
                    } catch {
                        // Do not surface Cognito response details or attributes.
                    }

                    if (email) {
                        storePendingEmail(email);
                        const search = new URLSearchParams({ mode: "user-details" });
                        if (state.redirectPath) {
                            search.set("redirect", state.redirectPath);
                        }

                        await navigateRef.current({
                            href: `/${locale}/login?${search.toString()}`,
                            viewTransition: true,
                        });
                        return;
                    }

                    toast.error(translationRef.current("auth.federated.emailUnavailable"));
                }

                await navigateToDestination();
            } catch {
                toast.error(translationRef.current("auth.federated.completionError"));
                await navigateRef.current({ href: `/${locale}`, viewTransition: true });
            }
        });

        const hubListenerCancelToken = Hub.listen("auth", ({ payload }) => {
            if (payload.event === "signedIn" || payload.event === "signedOut") {
                clearViewerScopedQueries(queryClient);
                authQueryRefreshRef.current = queryClient.refetchQueries();
                if (payload.event === "signedOut") {
                    authQueryRefreshRef.current = null;
                    completionCoordinator.reset();
                }
            }

            if (payload.event === "customOAuthState") {
                completionCoordinator.receiveCustomState(payload.data);
            }

            if (payload.event === "signInWithRedirect") {
                completionCoordinator.markRedirectCompleted();
            }

            if (payload.event === "signInWithRedirect_failure") {
                completionCoordinator.reset();
                toast.error(translationRef.current("auth.federated.completionError"));
            }
        });

        return () => {
            completionCoordinator.reset();
            hubListenerCancelToken();
        };
    }, [queryClient]);

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
