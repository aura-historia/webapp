import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { applySecurityHeaders } from "@/lib/server/securityHeaders.ts";
import { forwardAgentDiscoveryRequest } from "@/features/agent-discovery/server/agentDiscoveryForwarding.ts";
import { applyAgentDiscoveryLinkHeader } from "@/features/agent-discovery/server/agentDiscoveryLinkHeader.ts";
import { applyContentSignalHeader } from "@/lib/seo/contentSignals.ts";
import { serveProductSitemapRequest } from "@/features/product/catalog/server/productSitemap.ts";

function applySiteHeaders(headers: Headers): void {
    applySecurityHeaders(headers);
    applyAgentDiscoveryLinkHeader(headers);
    applyContentSignalHeader(headers);
}

/** Adds the site-wide headers; a response whose headers are immutable is copied first. */
function withSiteHeaders(response: Response): Response {
    try {
        applySiteHeaders(response.headers);
        return response;
    } catch {
        const copy = new Response(response.body, response);
        applySiteHeaders(copy.headers);
        return copy;
    }
}

/**
 * The Worker's request handler (re-exported by `src/worker.ts`, the Wrangler `main`) and
 * TanStack Start's server entry in development.
 */
export default createServerEntry({
    async fetch(request, opts) {
        // Agent discovery documents come from the backend and must never reach the app, whose
        // root route would locale-redirect them or answer with HTML.
        const discoveryResponse = await forwardAgentDiscoveryRequest(request);
        if (discoveryResponse) {
            return discoveryResponse;
        }

        // Likewise for the product sitemap, which is built from the public search.
        const sitemapResponse = await serveProductSitemapRequest(request);
        if (sitemapResponse) {
            return withSiteHeaders(sitemapResponse);
        }

        return withSiteHeaders(await handler.fetch(request, opts));
    },
});
