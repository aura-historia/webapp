import type { AnyRouter } from "@tanstack/react-router";
import { env } from "@/env.ts";
import { getApiBaseUrl, getMcpBaseUrl } from "@/lib/apiBaseUrl.ts";
import { getModelContext } from "@/features/agent-discovery/webmcp/modelContext.ts";

let activeRegistration: AbortController | undefined;

/**
 * Offers this site's tools to browser agents through WebMCP, once per document. Without a model
 * context (and on the server) it does nothing; otherwise it loads the tool list lazily and
 * registers it. `getRouter` calls it when the client creates the router, before hydration, so the
 * tools are registered by the time the page has loaded. Aborting the returned controller
 * unregisters them.
 */
export function startWebMcp(router: AnyRouter): AbortController | undefined {
    const modelContext = getModelContext();
    if (modelContext === undefined || activeRegistration?.signal.aborted === false) {
        return undefined;
    }

    const controller = new AbortController();
    activeRegistration = controller;
    import("@/features/agent-discovery/webmcp/registerWebMcpTools.ts")
        .then(({ registerWebMcpTools }) =>
            registerWebMcpTools({
                modelContext,
                router,
                signal: controller.signal,
                pageOrigin: window.location.origin,
                mcpOrigin: getMcpBaseUrl(env.VITE_MCP_URL, getApiBaseUrl(env.VITE_API_URL)),
            }),
        )
        // Without the chunk, agents simply see no tools.
        .catch(() => undefined);

    return controller;
}
