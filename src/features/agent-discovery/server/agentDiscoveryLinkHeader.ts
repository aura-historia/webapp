import { API_CATALOG_LINK_HEADER } from "@/features/agent-discovery/lib/agentDiscoveryPaths.ts";
import { isHtmlResponse } from "@/lib/server/htmlResponse.ts";

/**
 * Names the API catalog in a `Link` header on HTML pages (RFC 9727 §3, RFC 8288). Other responses,
 * such as JSON from API routes and redirects, are left alone.
 */
export function applyAgentDiscoveryLinkHeader(headers: Headers): Headers {
    if (!isHtmlResponse(headers) || headers.get("Link")?.includes(API_CATALOG_LINK_HEADER)) {
        return headers;
    }

    headers.append("Link", API_CATALOG_LINK_HEADER);
    return headers;
}
