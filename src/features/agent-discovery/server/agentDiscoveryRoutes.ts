import {
    AGENT_SKILLS_INDEX_PATH,
    AGENT_SKILLS_PREFIX,
    AI_CATALOG_PATH,
    API_CATALOG_PATH,
    ARD_CATALOG_PATH,
    AUTH_MD_PATH,
    MCP_SERVER_CARD_PATH,
    OAUTH_AUTHORIZATION_SERVER_METADATA_PATH,
    POPPY_DECLARATION_PATH,
} from "@/features/agent-discovery/lib/agentDiscoveryPaths.ts";

/** The backend host that serves a document: the REST API or the MCP host. */
export type AgentDiscoveryBackend = "api" | "mcp";

export interface AgentDiscoveryDocument {
    readonly backend: AgentDiscoveryBackend;
    /** Absolute path on the backend host. */
    readonly backendPath: string;
    /**
     * `edge`: a `200` is kept in the Worker's Cache API for the shared TTL. `none`: never cached
     * here; the backend's `Cache-Control` is passed through.
     */
    readonly caching: "edge" | "none";
    /**
     * Response headers passed through unchanged besides `Content-Type` and
     * `Access-Control-Allow-Origin`, which every document passes through.
     */
    readonly passThroughHeaders: readonly string[];
}

export type AgentDiscoveryRoute =
    | { readonly kind: "document"; readonly document: AgentDiscoveryDocument }
    /** A path in a namespace the backend owns that names no document; answered without it. */
    | { readonly kind: "not-found" };

/** The API serves the website's own discovery documents below this path. */
export const SITE_DISCOVERY_BACKEND_PREFIX = "/v1/site-discovery/";

function siteDocument(backendPath: string): AgentDiscoveryDocument {
    return {
        backend: "api",
        backendPath: `${SITE_DISCOVERY_BACKEND_PREFIX}${backendPath}`,
        caching: "edge",
        passThroughHeaders: [],
    };
}

/**
 * Website paths that publish a backend document. The backend owns every body and media type.
 * `/.well-known/openid-configuration` (Aura is no OpenID provider), the website's
 * `/.well-known/oauth-protected-resource*` (website pages are no protected resources) and
 * `/.well-known/acp.json` are deliberately absent.
 */
export const AGENT_DISCOVERY_DOCUMENTS: Readonly<Record<string, AgentDiscoveryDocument>> = {
    [MCP_SERVER_CARD_PATH]: {
        backend: "mcp",
        backendPath: MCP_SERVER_CARD_PATH,
        caching: "edge",
        passThroughHeaders: [],
    },
    [API_CATALOG_PATH]: {
        backend: "api",
        backendPath: API_CATALOG_PATH,
        caching: "edge",
        // RFC 9727 requires `Link: <…>; rel="api-catalog"` on the catalog, also for `HEAD`.
        passThroughHeaders: ["Link"],
    },
    [OAUTH_AUTHORIZATION_SERVER_METADATA_PATH]: {
        backend: "api",
        backendPath: OAUTH_AUTHORIZATION_SERVER_METADATA_PATH,
        // OAuth metadata is always `no-store` at the backend; never cache it here.
        caching: "none",
        passThroughHeaders: ["Cache-Control"],
    },
    [AI_CATALOG_PATH]: siteDocument("ai-catalog.json"),
    [ARD_CATALOG_PATH]: siteDocument("ai-catalog.json"),
    [POPPY_DECLARATION_PATH]: siteDocument("poppy.json"),
    [AGENT_SKILLS_INDEX_PATH]: siteDocument("agent-skills/index.json"),
    [AUTH_MD_PATH]: siteDocument("auth.md"),
};

/**
 * Agent Skills names: 1 to 64 lowercase letters, digits and single inner hyphens. Anything else
 * never reaches the backend, so a crafted name cannot address another backend path.
 */
const SKILL_NAME_PATTERN = /^(?=.{1,64}$)[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SKILL_FILE_NAME = "SKILL.md";

/** The route for an exact website path, or `undefined` when the app should answer it. */
export function resolveAgentDiscoveryRoute(pathname: string): AgentDiscoveryRoute | undefined {
    const document = Object.hasOwn(AGENT_DISCOVERY_DOCUMENTS, pathname)
        ? AGENT_DISCOVERY_DOCUMENTS[pathname]
        : undefined;
    if (document) {
        return { kind: "document", document };
    }

    if (!pathname.startsWith(AGENT_SKILLS_PREFIX)) {
        return undefined;
    }

    const segments = pathname.slice(AGENT_SKILLS_PREFIX.length).split("/");
    const [name, fileName] = segments;
    if (segments.length !== 2 || fileName !== SKILL_FILE_NAME || !SKILL_NAME_PATTERN.test(name)) {
        return { kind: "not-found" };
    }

    return { kind: "document", document: siteDocument(`agent-skills/${name}/${SKILL_FILE_NAME}`) };
}
