import {
    Outlet,
    RouterProvider,
    createMemoryHistory,
    createRootRouteWithContext,
    createRoute,
    createRouter,
} from "@tanstack/react-router";
import { act, render } from "@testing-library/react";
import type { React, ReactNode } from "react";

const rootRoute = createRootRouteWithContext()({
    component: () => <Outlet />, // entry point to render children
});

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <div>{"Index"}</div>,
});

let injectedChildren: ReactNode = null;

const testRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/test",
    component: () => <>{injectedChildren}</>,
});

const routeTree = rootRoute.addChildren([indexRoute, testRoute]);

interface TestRouterWrapperProps {
    children: ReactNode;
    initialEntries?: string[];
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
    return render(<TestRouterWrapper {...options}>{ui}</TestRouterWrapper>);
}
