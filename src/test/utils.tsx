import {
    Outlet,
    RouterProvider,
    createMemoryHistory,
    createRootRouteWithContext,
    createRoute,
    createRouter,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SearchQueryProvider } from "@/hooks/useSearchQueryContext.tsx";

const rootRoute = createRootRouteWithContext()({
    component: () => <Outlet />, // entry point to render children
});

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <>{injectedChildren}</>,
});

let injectedChildren: ReactNode = null;

const testRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/test",
    component: () => <>{injectedChildren}</>,
});

const searchRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/search",
    component: () => <>{injectedChildren}</>,
});

const routeTree = rootRoute.addChildren([indexRoute, testRoute, searchRoute]);

interface TestRouterWrapperProps {
    readonly children: ReactNode;
    readonly initialEntries?: string[];
}

export function TestRouterWrapper({
    children,
    initialEntries = ["/test"],
}: TestRouterWrapperProps) {
    injectedChildren = children;

    const router = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries }),
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
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
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
