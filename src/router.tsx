import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import * as TanstackQuery from "./integrations/tanstack-query/root-provider";
import type { UserPreferences } from "@/data/internal/preferences/UserPreferences.ts";
import { NotFoundComponent } from "@/components/common/NotFoundComponent.tsx";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { ErrorComponent } from "@/components/common/ErrorComponent.tsx";

// Create a new router instance
export const getRouter = () => {
    const rqContext = TanstackQuery.getContext();

    const router = createTanstackRouter({
        routeTree,
        context: {
            ...rqContext,
            initialPreferences: {} as UserPreferences,
            timeZone: "UTC",
            serverAuth: { user: null, authenticated: false as const },
        },
        defaultPreload: false,
        defaultPendingMs: 0,
        defaultPendingMinMs: 200,
        scrollRestoration: true,
        Wrap: (props: { children: React.ReactNode }) => {
            return <TanstackQuery.Provider {...rqContext}>{props.children}</TanstackQuery.Provider>;
        },
        defaultNotFoundComponent: NotFoundComponent,
        defaultErrorComponent: ErrorComponent,
    });

    setupRouterSsrQueryIntegration({
        router,
        queryClient: rqContext.queryClient,
    });

    return router;
};

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof getRouter>;
    }
}
