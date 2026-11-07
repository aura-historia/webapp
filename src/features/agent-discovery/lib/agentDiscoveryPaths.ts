/**
 * Website paths of the agent discovery documents. The backend writes every document; the webapp
 * only decides which website paths publish them (`server/agentDiscoveryRoutes.ts`).
 * See `docs/architecture-guidelines.md#agent-discovery`.
 */
export const MCP_SERVER_CARD_PATH = "/.well-known/mcp/server-card.json";
export const API_CATALOG_PATH = "/.well-known/api-catalog";
export const OAUTH_AUTHORIZATION_SERVER_METADATA_PATH = "/.well-known/oauth-authorization-server";
export const AI_CATALOG_PATH = "/.well-known/ai-catalog.json";
/** ARD 0.91 renamed the AI catalog path; scanners still probe {@link AI_CATALOG_PATH}. */
export const ARD_CATALOG_PATH = "/.well-known/ard.json";
export const POPPY_DECLARATION_PATH = "/.well-known/poppy.json";
export const AGENT_SKILLS_PREFIX = "/.well-known/agent-skills/";
export const AGENT_SKILLS_INDEX_PATH = `${AGENT_SKILLS_PREFIX}index.json`;
export const AUTH_MD_PATH = "/auth.md";

/**
 * RFC 9727 §3 and RFC 8288: every HTML page names the API catalog in a `Link` response header.
 * Worker-rendered pages get it in `src/server.ts`, prerendered pages from `public/_headers`.
 */
export const API_CATALOG_LINK_HEADER = `<${API_CATALOG_PATH}>; rel="api-catalog"`;
