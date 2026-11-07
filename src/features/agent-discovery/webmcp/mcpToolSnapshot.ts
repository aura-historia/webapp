// Synced from the backend's docs/mcp-tools.json by scripts/sync_mcp_tools.py; never edit by hand.
import snapshot from "../../../../mcp/mcp-tools.json";

export type McpToolAccess = "public" | "protected";

/** One tool of the backend's anonymous `tools/list`, reduced to what WebMCP registration uses. */
export interface McpToolSnapshotEntry {
    readonly name: string;
    readonly description: string;
    readonly inputSchema: Readonly<Record<string, unknown>>;
    readonly annotations: { readonly readOnlyHint: boolean };
    readonly _meta: { readonly "aura.historia/access": McpToolAccess };
}

export const MCP_TOOL_SNAPSHOT: readonly McpToolSnapshotEntry[] =
    snapshot as McpToolSnapshotEntry[];

/** The catalogue tools an anonymous caller may use. Protected tools follow with sign-in (#1245). */
export const PUBLIC_MCP_TOOLS: readonly McpToolSnapshotEntry[] = MCP_TOOL_SNAPSHOT.filter(
    (tool) => tool._meta["aura.historia/access"] === "public",
);
