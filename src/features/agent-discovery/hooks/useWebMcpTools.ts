import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { env } from "@/env.ts";
import { getApiBaseUrl, getMcpBaseUrl } from "@/lib/apiBaseUrl.ts";
import { getModelContext } from "@/features/agent-discovery/webmcp/modelContext.ts";

/**
 * Offers this site's tools to browser agents through WebMCP. Without a model context it does
 * nothing; otherwise it loads the tool list lazily and registers it once for the document, until
 * unmount. Use it in the root layout only.
 */
export function useWebMcpTools(): void {
    const router = useRouter();

    useEffect(() => {
        const modelContext = getModelContext();
        if (modelContext === undefined) {
            return;
        }

        const controller = new AbortController();
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

        return () => controller.abort();
    }, [router]);
}
