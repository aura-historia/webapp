import {
    Outlet,
    RouterProvider,
    createMemoryHistory,
    createRootRouteWithContext,
    createRoute,
    createRouter,
} from "@tanstack/react-router";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SearchQueryProvider } from "@/features/search/common/hooks/useSearchQueryContext.tsx";
import { UserPreferencesProvider } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { getLanguageFromPathname, localizeHref } from "@/i18n/routing.ts";

const rootRoute = createRootRouteWithContext()({
    component: () => <Outlet />, // entry point to render children
});

const languageRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "$lng",
    component: () => <Outlet />,
});

const indexRoute = createRoute({
    getParentRoute: () => languageRoute,
    path: "/",
    component: () => <>{injectedChildren}</>,
});

let injectedChildren: ReactNode = null;

const testRoute = createRoute({
    getParentRoute: () => languageRoute,
    path: "test",
    component: () => <>{injectedChildren}</>,
});

const searchRoute = createRoute({
    getParentRoute: () => languageRoute,
    path: "search",
    component: () => <>{injectedChildren}</>,
});

const searchShopsRoute = createRoute({
    getParentRoute: () => languageRoute,
    path: "search/shops",
    component: () => <>{injectedChildren}</>,
});

const partnerProgramRoute = createRoute({
    getParentRoute: () => languageRoute,
    path: "partner-program",
    component: () => <>{injectedChildren}</>,
});

const watchlistRoute = createRoute({
    getParentRoute: () => languageRoute,
    path: "me/watchlist",
    component: () => <>{injectedChildren}</>,
});

const searchFiltersRoute = createRoute({
    getParentRoute: () => languageRoute,
    path: "me/search-filters",
    component: () => <>{injectedChildren}</>,
});

const partnerApplicationsRoute = createRoute({
    getParentRoute: () => languageRoute,
    path: "partners/applications",
    component: () => <>{injectedChildren}</>,
});

const adminOverviewRoute = createRoute({
    getParentRoute: () => languageRoute,
    path: "admin/overview",
    component: () => <>{injectedChildren}</>,
});

const routeTree = rootRoute.addChildren([
    languageRoute.addChildren([
        indexRoute,
        testRoute,
        searchRoute,
        searchShopsRoute,
        partnerProgramRoute,
        watchlistRoute,
        searchFiltersRoute,
        partnerApplicationsRoute,
        adminOverviewRoute,
    ]),
]);

interface TestRouterWrapperProps {
    readonly children: ReactNode;
    readonly initialEntries?: string[];
}

export function TestRouterWrapper({
    children,
    initialEntries = ["/de/test"],
}: TestRouterWrapperProps) {
    injectedChildren = children;
    const localizedInitialEntries = initialEntries.map((entry) =>
        getLanguageFromPathname(new URL(entry, "https://aura-historia.invalid").pathname)
            ? entry
            : localizeHref(entry, "de"),
    );

    const router = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: localizedInitialEntries }),
        context: {},
    });

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    });

    return (
        <SearchQueryProvider>
            <UserPreferencesProvider locale={"de-DE"}>
                <QueryClientProvider client={queryClient}>
                    <RouterProvider router={router} />
                </QueryClientProvider>
            </UserPreferencesProvider>
        </SearchQueryProvider>
    );
}

export function renderWithRouter(
    ui: React.ReactElement,
    options: Omit<TestRouterWrapperProps, "children"> = {},
) {
    return render(<TestRouterWrapper {...options}>{ui}</TestRouterWrapper>);
}

export function renderWithQueryClient(ui: React.ReactElement) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    });
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

export function expandFilterCard(title: string) {
    fireEvent.click(screen.getByText(title));
}
