const DEFAULT_API_BASE_URL = "https://api.aura-historia.com";
const DEFAULT_MCP_BASE_URL = "https://mcp.aura-historia.com";

export function getApiBaseUrl(configuredBaseUrl?: string): string {
    return configuredBaseUrl ?? DEFAULT_API_BASE_URL;
}

/**
 * The MCP host's origin. Without a configured value it is the API host's `mcp.` sibling
 * (`api.stage.aura-historia.com` → `mcp.stage.aura-historia.com`), so the two backends always
 * belong to the same environment; an API host without an `api.` label falls back to production.
 */
export function getMcpBaseUrl(configuredBaseUrl: string | undefined, apiBaseUrl: string): string {
    if (configuredBaseUrl !== undefined) {
        return new URL(configuredBaseUrl).origin;
    }

    const apiUrl = new URL(apiBaseUrl);
    if (!apiUrl.hostname.startsWith("api.")) {
        return DEFAULT_MCP_BASE_URL;
    }

    apiUrl.hostname = `mcp.${apiUrl.hostname.slice("api.".length)}`;
    return apiUrl.origin;
}
