import type { AnyRouter } from "@tanstack/react-router";
import type { ModelContext, WebMcpTool } from "@/features/agent-discovery/webmcp/modelContext.ts";
import { PUBLIC_MCP_TOOLS } from "@/features/agent-discovery/webmcp/mcpToolSnapshot.ts";
import { callMcpTool, MCP_ENDPOINT_PATH } from "@/features/agent-discovery/webmcp/mcpToolCall.ts";
import { canCallMcpFromPage } from "@/features/agent-discovery/webmcp/mcpPageOrigins.ts";
import { createNavigationTools } from "@/features/agent-discovery/webmcp/navigationTools.ts";

export interface WebMcpRegistrationOptions {
    readonly modelContext: ModelContext;
    readonly router: AnyRouter;
    /** Aborting it unregisters every tool. */
    readonly signal: AbortSignal;
    /** The origin of this page, such as `https://aura-historia.com`. */
    readonly pageOrigin: string;
    /** The environment's MCP origin (`getMcpBaseUrl`). */
    readonly mcpOrigin: string;
}

/**
 * The public catalogue tools of the synced snapshot. Each call is forwarded to the MCP server
 * only when an agent executes the tool; registration sends no request.
 */
export function createCatalogueTools(mcpOrigin: string): WebMcpTool[] {
    const endpoint = `${mcpOrigin}${MCP_ENDPOINT_PATH}`;
    return PUBLIC_MCP_TOOLS.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: {
            readOnlyHint: tool.annotations.readOnlyHint,
            // Listing text comes from third-party providers and can carry prompt injection.
            untrustedContentHint: true,
        },
        execute: (input, options) => callMcpTool(endpoint, tool.name, input, options?.signal),
    }));
}

function registerTool(modelContext: ModelContext, tool: WebMcpTool, signal: AbortSignal): void {
    try {
        // A rejection (a duplicate name, an abort, a frame without the "tools" permission) only
        // means the tool is not offered.
        Promise.resolve(modelContext.registerTool(tool, { signal })).catch(() => undefined);
    } catch {
        return;
    }

    signal.addEventListener(
        "abort",
        () => {
            try {
                modelContext.unregisterTool?.(tool.name);
            } catch {
                // Already unregistered through the signal.
            }
        },
        { once: true },
    );
}

/**
 * Registers this page's WebMCP tools once per document: the navigation tools everywhere and the
 * public catalogue tools where the MCP server admits the page's origin.
 */
export function registerWebMcpTools({
    modelContext,
    router,
    signal,
    pageOrigin,
    mcpOrigin,
}: WebMcpRegistrationOptions): void {
    if (signal.aborted) {
        return;
    }

    const tools = [
        ...createNavigationTools(router, pageOrigin),
        ...(canCallMcpFromPage(mcpOrigin, pageOrigin) ? createCatalogueTools(mcpOrigin) : []),
    ];
    for (const tool of tools) {
        registerTool(modelContext, tool, signal);
    }
}
