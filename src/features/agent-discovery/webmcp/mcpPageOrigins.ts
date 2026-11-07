/**
 * The page origins each hosted MCP server admits, besides gateway CORS (backend
 * `docs/http-api-front-door.md`). Wrangler Previews are not admitted.
 */
const HOSTED_MCP_PAGE_ORIGINS: ReadonlyMap<string, readonly string[]> = new Map([
    ["https://mcp.aura-historia.com", ["https://aura-historia.com"]],
    [
        "https://mcp.stage.aura-historia.com",
        ["https://stage.aura-historia.com", "http://localhost:3000"],
    ],
]);

/**
 * Whether a page on `pageOrigin` may call the MCP server on `mcpOrigin`. A self-hosted MCP
 * server (a `VITE_MCP_URL` outside this table) admits the origins its own configuration lists.
 */
export function canCallMcpFromPage(mcpOrigin: string, pageOrigin: string): boolean {
    const admittedOrigins = HOSTED_MCP_PAGE_ORIGINS.get(mcpOrigin);
    return admittedOrigins === undefined || admittedOrigins.includes(pageOrigin);
}
