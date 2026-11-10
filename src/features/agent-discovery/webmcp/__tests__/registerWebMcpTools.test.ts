import type { AnyRouter } from "@tanstack/react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import snapshot from "../../../../../mcp/mcp-tools.json";
import type { ModelContext, WebMcpTool } from "@/features/agent-discovery/webmcp/modelContext.ts";
import { registerWebMcpTools } from "@/features/agent-discovery/webmcp/registerWebMcpTools.ts";

const STAGE_MCP = "https://mcp.stage.aura-historia.com";
const STAGE_SITE = "https://stage.aura-historia.com";
const NAVIGATION_TOOLS = [
    "openListingSourcePage",
    "openProductListingPage",
    "openProductListingSearch",
];
const PUBLIC_TOOLS = snapshot
    .filter((tool) => tool._meta["aura.historia/access"] === "public")
    .map((tool) => tool.name)
    .sort();

const fetchMock = vi.fn<typeof fetch>();
const router = {
    navigate: vi.fn(),
    state: { location: { pathname: "/en", href: "/en" }, matches: [] },
} as unknown as AnyRouter;

/** A model context that records registrations like the WebMCP spec's tool map. */
function createModelContext() {
    const tools = new Map<string, WebMcpTool>();
    const modelContext = {
        registerTool: vi.fn((tool: WebMcpTool, options?: { signal?: AbortSignal }) => {
            if (tools.has(tool.name))
                return Promise.reject(new DOMException("", "InvalidStateError"));
            tools.set(tool.name, tool);
            options?.signal?.addEventListener("abort", () => tools.delete(tool.name));
            return Promise.resolve();
        }),
    } satisfies ModelContext;
    return { modelContext, tools };
}

function register(
    modelContext: ModelContext,
    { pageOrigin = STAGE_SITE, mcpOrigin = STAGE_MCP, signal = new AbortController().signal } = {},
) {
    registerWebMcpTools({
        modelContext,
        router,
        signal,
        pageOrigin,
        mcpOrigin,
    });
}

beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
});

describe("registerWebMcpTools", () => {
    it("registers every public tool of the synced snapshot and the navigation tools", () => {
        const { modelContext, tools } = createModelContext();

        register(modelContext);

        expect(PUBLIC_TOOLS).toHaveLength(11);
        expect(PUBLIC_TOOLS).not.toContain("discoverPartyLocations");
        expect([...tools.keys()].sort()).toEqual([...NAVIGATION_TOOLS, ...PUBLIC_TOOLS].sort());
        expect(tools.has("getUserAccount")).toBe(false);
    });

    it("registers each catalogue tool with the server's definition and WebMCP hints", () => {
        const { modelContext, tools } = createModelContext();

        register(modelContext);

        for (const entry of snapshot.filter((tool) => PUBLIC_TOOLS.includes(tool.name))) {
            const registered = tools.get(entry.name);
            expect(registered).toMatchObject({
                name: entry.name,
                description: entry.description,
                inputSchema: entry.inputSchema,
            });
            expect(registered?.annotations).toEqual({
                readOnlyHint: entry.annotations.readOnlyHint,
                untrustedContentHint: true,
            });
        }
    });

    it("sends no request before an agent calls a tool", () => {
        const { modelContext } = createModelContext();

        register(modelContext);

        expect(modelContext.registerTool).toHaveBeenCalled();
        expect(fetchMock).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it("forwards a call to the environment's MCP endpoint and maps its result", async () => {
        const { modelContext, tools } = createModelContext();
        fetchMock.mockResolvedValue(
            new Response(
                JSON.stringify({ jsonrpc: "2.0", id: 1, result: { structuredContent: { ok: 1 } } }),
                { headers: { "Content-Type": "application/json" } },
            ),
        );
        register(modelContext);
        const signal = new AbortController().signal;

        const result = await tools
            .get("getPublicListingSourceBySlug")
            ?.execute({ listingSourceSlugId: "galerie" }, { signal });

        expect(result).toEqual({ ok: 1 });
        expect(fetchMock).toHaveBeenCalledOnce();
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe(`${STAGE_MCP}/v1`);
        expect(init?.signal).toBe(signal);
        expect(init?.headers).toMatchObject({ "Mcp-Name": "getPublicListingSourceBySlug" });
        expect(JSON.parse(String(init?.body)).params.arguments).toEqual({
            listingSourceSlugId: "galerie",
        });
    });

    it.each([
        [
            "a Wrangler Preview",
            "https://abc123-aura-historia-staging.example.workers.dev",
            STAGE_MCP,
        ],
        ["a stage page against production", STAGE_SITE, "https://mcp.aura-historia.com"],
        [
            "local development against production",
            "http://localhost:3000",
            "https://mcp.aura-historia.com",
        ],
    ])("registers only the navigation tools on %s", (_label, pageOrigin, mcpOrigin) => {
        const { modelContext, tools } = createModelContext();

        register(modelContext, { pageOrigin, mcpOrigin });

        expect([...tools.keys()].sort()).toEqual(NAVIGATION_TOOLS);
    });

    it.each([
        ["production", "https://aura-historia.com", "https://mcp.aura-historia.com"],
        ["stage", STAGE_SITE, STAGE_MCP],
        ["local development against stage", "http://localhost:3000", STAGE_MCP],
        ["a self-hosted MCP server", "http://localhost:3000", "http://localhost:8081"],
    ])("registers the catalogue tools on %s", (_label, pageOrigin, mcpOrigin) => {
        const { modelContext, tools } = createModelContext();

        register(modelContext, { pageOrigin, mcpOrigin });

        expect(tools.size).toBe(NAVIGATION_TOOLS.length + PUBLIC_TOOLS.length);
    });

    it("unregisters every tool when the signal aborts", () => {
        const { modelContext, tools } = createModelContext();
        const controller = new AbortController();

        register(modelContext, { signal: controller.signal });
        controller.abort();

        expect(tools.size).toBe(0);
        register(modelContext);
        expect(tools.size).toBe(NAVIGATION_TOOLS.length + PUBLIC_TOOLS.length);
    });

    it("registers nothing with an already aborted signal", () => {
        const { modelContext } = createModelContext();

        register(modelContext, { signal: AbortSignal.abort() });

        expect(modelContext.registerTool).not.toHaveBeenCalled();
    });

    it("unregisters by name on older builds that ignore the signal", () => {
        const names = new Set<string>();
        const modelContext: ModelContext = {
            registerTool: (tool) => {
                names.add(tool.name);
            },
            unregisterTool: (name) => {
                names.delete(name);
            },
        };
        const controller = new AbortController();

        register(modelContext, { signal: controller.signal });
        expect(names.size).toBeGreaterThan(0);
        controller.abort();

        expect(names.size).toBe(0);
    });

    it("never unregisters by name a tool whose registration returned a promise", async () => {
        const modelContext: ModelContext = {
            registerTool: () => Promise.reject(new DOMException("", "InvalidStateError")),
            unregisterTool: vi.fn(),
        };
        const controller = new AbortController();

        register(modelContext, { signal: controller.signal });
        controller.abort();
        await Promise.resolve();

        // Another script's tool of the same name stays registered.
        expect(modelContext.unregisterTool).not.toHaveBeenCalled();
    });

    it("tolerates registrations that reject or throw", async () => {
        const rejecting: ModelContext = {
            registerTool: () => Promise.reject(new DOMException("", "NotAllowedError")),
        };
        const throwing: ModelContext = {
            registerTool: () => {
                throw new DOMException("", "InvalidStateError");
            },
        };

        expect(() => register(rejecting)).not.toThrow();
        expect(() => register(throwing)).not.toThrow();
        await Promise.resolve();
    });
});
