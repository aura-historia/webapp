import {
    Outlet,
    RouterProvider,
    createMemoryHistory,
    createRootRouteWithContext,
    createRoute,
    createRouter,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n/i18nForTests.ts";

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

    return <RouterProvider router={router} />;
}

export function renderWithRouter(
    ui: React.ReactElement,
    options: Omit<TestRouterWrapperProps, "children"> = {},
) {
    return renderWithTranslations(<TestRouterWrapper {...options}>{ui}</TestRouterWrapper>);
}

export function renderWithTranslations(ui: React.ReactElement) {
    return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}
