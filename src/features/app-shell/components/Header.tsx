import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { env } from "@/env.ts";
import { AppNavBar } from "@/features/app-shell/components/navigation/AppNavBar.tsx";
import { MobileHeader } from "@/features/app-shell/components/navigation/MobileHeader.tsx";
import { getActiveSiteSection } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import {
    SiteHeader,
    type SiteHeaderTone,
} from "@/features/app-shell/components/navigation/SiteHeader.tsx";
import { useNavigationViewer } from "@/features/app-shell/components/navigation/useNavigationViewer.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { clearViewerScopedQueries } from "@/features/authentication/lib/clearViewerScopedQueries.ts";
import { stripLanguageFromPathname } from "@/i18n/routing.ts";

const isLoginEnabled = env.VITE_FEATURE_LOGIN_ENABLED;
const isSearchEnabled = env.VITE_FEATURE_SEARCH_ENABLED;

/** The landing header lies transparently over the ink hero, as in the design. */
const LANDING_HEADER_TONE: SiteHeaderTone = "overlay";

/**
 * Site navigation. The landing page gets the marketing header (sections and calls to action);
 * every other page gets the app bar with the global search. Phones get the compact header with
 * the full-screen menu.
 */
export function Header() {
    const viewer = useNavigationViewer();
    const pathname = useLocation({
        select: (location) => location.pathname,
    });
    const routePathname = stripLanguageFromPathname(pathname);

    const isLandingPage = routePathname === "/";
    const isLoginRoute = routePathname === "/login";
    const showSearch = isSearchEnabled && !isLoginRoute;
    const showAccountActions = isLoginEnabled && !isLoginRoute;
    const activeSection = getActiveSiteSection(routePathname);

    useClearQueriesOnViewerChange();

    if (isLandingPage) {
        return (
            <header className="sticky top-0 z-50 lg:relative">
                <SiteHeader
                    tone={LANDING_HEADER_TONE}
                    activeSection={activeSection}
                    viewer={viewer}
                    showAccountActions={showAccountActions}
                    className="hidden lg:block"
                />
                <MobileHeader
                    tone="dark"
                    viewer={viewer}
                    activeSection={activeSection}
                    showSearch={showSearch}
                    showAccountActions={showAccountActions}
                    className="lg:hidden"
                />
            </header>
        );
    }

    return (
        <header className="sticky top-0 z-50">
            <AppNavBar
                viewer={viewer}
                showSearch={showSearch}
                showAccountActions={showAccountActions}
                className="hidden sm:block"
            />
            <MobileHeader
                tone="light"
                viewer={viewer}
                activeSection={activeSection}
                showSearch={showSearch}
                showAccountActions={showAccountActions}
                className="sm:hidden"
            />
        </header>
    );
}

/** Drops viewer-scoped cached data when the signed-in user changes. */
function useClearQueriesOnViewerChange() {
    const queryClient = useQueryClient();
    const { user, isResolved } = useResolvedAuth();
    const previousUserIdRef = useRef<string | null | undefined>(undefined);

    useEffect(() => {
        if (!isResolved) return;

        const currentUserId = user?.userId ?? null;
        const previousUserId = previousUserIdRef.current;
        previousUserIdRef.current = currentUserId;
        if (previousUserId === undefined || previousUserId === currentUserId) return;

        clearViewerScopedQueries(queryClient);
    }, [isResolved, queryClient, user?.userId]);
}
