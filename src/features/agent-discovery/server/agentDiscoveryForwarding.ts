import { env } from "@/env.ts";
import { getApiBaseUrl, getMcpBaseUrl } from "@/lib/apiBaseUrl.ts";
import {
    type AgentDiscoveryDocument,
    resolveAgentDiscoveryRoute,
} from "@/features/agent-discovery/server/agentDiscoveryRoutes.ts";

/**
 * How long the edge keeps a document. One value for every cached document, so the skills index
 * and each `SKILL.md` agree on their digests again shortly after a backend release; never longer
 * than the backend's own 300-second shared TTL.
 */
export const AGENT_DISCOVERY_EDGE_CACHE_TTL_SECONDS = 300;
/** Clients revalidate every time; only the edge holds a copy. */
export const AGENT_DISCOVERY_CLIENT_CACHE_CONTROL = "public, max-age=0";
export const AGENT_DISCOVERY_BACKEND_TIMEOUT_MS = 10_000;

const ALLOWED_METHODS = "GET, HEAD";
/** Passed through for every document, unchanged and with all parameters. */
const COMMON_PASS_THROUGH_HEADERS = ["Content-Type", "Access-Control-Allow-Origin"] as const;
const BACKEND_REDIRECT_MODE = "manual" satisfies RequestRedirect;
/** Directives that forbid a shared cache from storing a response. */
const UNCACHEABLE_DIRECTIVES = new Set(["private", "no-store", "no-cache"]);

/** The Workers Cache API's default cache; absent outside workerd, such as in unit tests. */
function getEdgeCache(): Cache | undefined {
    const cacheStorage = (globalThis as { caches?: { default?: Cache } }).caches;
    return cacheStorage?.default;
}

function backendUrl(document: AgentDiscoveryDocument): URL {
    const apiBaseUrl = getApiBaseUrl(env.VITE_API_URL);
    const origin =
        document.backend === "mcp" ? getMcpBaseUrl(env.VITE_MCP_URL, apiBaseUrl) : apiBaseUrl;
    return new URL(document.backendPath, origin);
}

function errorResponse(
    status: number,
    error: string,
    title: string,
    detail: string,
    init?: HeadersInit,
): Response {
    const headers = new Headers(init);
    headers.set("Content-Type", "application/json; charset=utf-8");
    headers.set("Cache-Control", "no-store");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("X-Content-Type-Options", "nosniff");
    return new Response(JSON.stringify({ status, title, error, detail }), { status, headers });
}

function backendFailure(backendStatus?: number): Response {
    return backendStatus === 503
        ? errorResponse(
              503,
              "SERVICE_UNAVAILABLE",
              "Service Unavailable",
              "The discovery document is temporarily unavailable.",
          )
        : errorResponse(
              502,
              "BAD_GATEWAY",
              "Bad Gateway",
              "The discovery document could not be loaded.",
          );
}

function passThroughHeaders(source: Headers, document: AgentDiscoveryDocument): Headers {
    const headers = new Headers();
    for (const name of [...COMMON_PASS_THROUGH_HEADERS, ...document.passThroughHeaders]) {
        const value = source.get(name);
        if (value !== null) {
            headers.set(name, value);
        }
    }
    headers.set("X-Content-Type-Options", "nosniff");
    return headers;
}

function allowsSharedCaching(cacheControl: string | null): boolean {
    return !(cacheControl ?? "")
        .split(",")
        .some((directive) =>
            UNCACHEABLE_DIRECTIVES.has(directive.split("=")[0].trim().toLowerCase()),
        );
}

/** `HEAD` gets the same status and headers as `GET`, without the body. */
function withoutBody(response: Response): Response {
    void response.body?.cancel();
    return new Response(null, { status: response.status, headers: response.headers });
}

async function readCachedDocument(
    cache: Cache,
    cacheKey: Request,
    document: AgentDiscoveryDocument,
): Promise<Response | undefined> {
    let cached: Response | undefined;
    try {
        cached = await cache.match(cacheKey);
    } catch {
        return undefined;
    }
    if (!cached) {
        return undefined;
    }

    const headers = passThroughHeaders(cached.headers, document);
    headers.set("Cache-Control", AGENT_DISCOVERY_CLIENT_CACHE_CONTROL);
    return new Response(cached.body, { status: cached.status, headers });
}

async function storeDocument(
    cache: Cache,
    cacheKey: Request,
    body: ArrayBuffer,
    headers: Headers,
): Promise<void> {
    const storedHeaders = new Headers(headers);
    storedHeaders.set("Cache-Control", `public, max-age=${AGENT_DISCOVERY_EDGE_CACHE_TTL_SECONDS}`);
    try {
        // A copy, so the client's body never depends on what the cache does with the buffer.
        await cache.put(
            cacheKey,
            new Response(body.slice(0), { status: 200, headers: storedHeaders }),
        );
    } catch {
        // The edge copy is an optimisation; the client still gets the document.
    }
}

async function forwardDocument(
    document: AgentDiscoveryDocument,
    requestUrl: URL,
): Promise<Response> {
    const cache = document.caching === "edge" ? getEdgeCache() : undefined;
    // One key per website path: no query string, no request headers, always `GET`.
    const cacheKey = new Request(new URL(requestUrl.pathname, requestUrl.origin));
    if (cache) {
        const cached = await readCachedDocument(cache, cacheKey, document);
        if (cached) {
            return cached;
        }
    }

    let backendResponse: Response;
    let body: ArrayBuffer;
    try {
        // A fresh request: no cookie, `Authorization`, origin or other client header is forwarded.
        backendResponse = await fetch(backendUrl(document), {
            method: "GET",
            headers: { Accept: "*/*" },
            redirect: BACKEND_REDIRECT_MODE,
            signal: AbortSignal.timeout(AGENT_DISCOVERY_BACKEND_TIMEOUT_MS),
        });
        const { status } = backendResponse;
        if (status < 200 || (status >= 300 && status < 400) || status >= 500) {
            void backendResponse.body?.cancel();
            return backendFailure(status);
        }
        // Raw bytes: the skills index pins each `SKILL.md` by digest, so nothing is re-encoded.
        body = await backendResponse.arrayBuffer();
    } catch {
        return backendFailure();
    }

    const headers = passThroughHeaders(backendResponse.headers, document);
    const backendCacheControl = backendResponse.headers.get("Cache-Control");
    if (document.caching === "none") {
        headers.set("Cache-Control", backendCacheControl ?? "no-store");
    } else if (backendResponse.status === 200 && allowsSharedCaching(backendCacheControl)) {
        if (cache) {
            await storeDocument(cache, cacheKey, body, headers);
        }
        headers.set("Cache-Control", AGENT_DISCOVERY_CLIENT_CACHE_CONTROL);
    } else {
        headers.set("Cache-Control", "no-store");
    }

    return new Response(body, { status: backendResponse.status, headers });
}

/**
 * Answers a website request for an agent discovery document from the backend that writes it, or
 * returns `undefined` for any other path. Runs before TanStack Start, so these paths are never
 * locale-redirected or rendered as HTML.
 */
export async function forwardAgentDiscoveryRequest(
    request: Request,
): Promise<Response | undefined> {
    const requestUrl = new URL(request.url);
    const route = resolveAgentDiscoveryRoute(requestUrl.pathname);
    if (!route) {
        return undefined;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
        return errorResponse(
            405,
            "METHOD_NOT_ALLOWED",
            "Method Not Allowed",
            "Discovery documents support only GET and HEAD.",
            { Allow: ALLOWED_METHODS },
        );
    }

    const response =
        route.kind === "document"
            ? await forwardDocument(route.document, requestUrl)
            : errorResponse(
                  404,
                  "NOT_FOUND",
                  "Not Found",
                  "No discovery document exists at this path.",
              );
    return request.method === "HEAD" ? withoutBody(response) : response;
}
