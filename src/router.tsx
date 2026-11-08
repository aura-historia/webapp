import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import * as TanstackQuery from "./integrations/tanstack-query/root-provider";
import type { UserPreferences } from "@/features/preferences/types/UserPreferences.ts";
import { NotFoundPage } from "@/features/app-shell/components/fallback/NotFoundPage.tsx";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { ErrorPage } from "@/features/app-shell/components/fallback/ErrorPage.tsx";
import { startWebMcp } from "@/features/agent-discovery/webmcp/startWebMcp.ts";

// Create a new router instance
export const getRouter = () => {
    const rqContext = TanstackQuery.getContext();

    const router = createTanstackRouter({
        routeTree,
        context: { ...rqContext, initialPreferences: {} as UserPreferences, timeZone: "UTC" },
        defaultPreload: false,
        defaultPendingMs: 0,
        defaultPendingMinMs: 200,
        scrollRestoration: true,
        Wrap: (props: { children: React.ReactNode }) => {
            return <TanstackQuery.Provider {...rqContext}>{props.children}</TanstackQuery.Provider>;
        },
        defaultNotFoundComponent: NotFoundPage,
        defaultErrorComponent: ErrorPage,
    });

    setupRouterSsrQueryIntegration({
        router,
        queryClient: rqContext.queryClient,
    });

    // Browser only, before hydration: agents look for WebMCP tools on page load.
    startWebMcp(router);

    return router;
};

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof getRouter>;
    }
}
