import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    callMcpTool,
    McpInvalidParamsError,
    McpProtocolError,
    McpToolError,
    McpTransportError,
} from "@/features/agent-discovery/webmcp/mcpToolCall.ts";

const ENDPOINT = "https://mcp.stage.aura-historia.com/v1";
const fetchMock = vi.fn<typeof fetch>();

function jsonRpc(body: Record<string, unknown>, status = 200): Response {
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, ...body }), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

function lastRequest() {
    const [url, init] = fetchMock.mock.calls.at(-1) ?? [];
    return { url, init: init as RequestInit, body: JSON.parse(String(init?.body)) };
}

beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
});

describe("callMcpTool", () => {
    it("sends an anonymous 2026-07-28 tools/call whose headers match the body", async () => {
        fetchMock.mockResolvedValue(jsonRpc({ result: { structuredContent: { ok: true } } }));
        const signal = new AbortController().signal;

        await callMcpTool(ENDPOINT, "getAuction", { auctionId: "a1" }, signal);

        const { url, init, body } = lastRequest();
        expect(url).toBe(ENDPOINT);
        expect(init).toMatchObject({
            method: "POST",
            signal,
            credentials: "omit",
            cache: "no-store",
            redirect: "error",
        });
        expect(init.headers).toEqual({
            Accept: "application/json, text/event-stream",
            "Content-Type": "application/json",
            "MCP-Protocol-Version": "2026-07-28",
            "Mcp-Method": "tools/call",
            "Mcp-Name": "getAuction",
        });
        expect(init.headers).not.toHaveProperty("Authorization");
        expect(body).toEqual({
            jsonrpc: "2.0",
            id: expect.any(Number),
            method: "tools/call",
            params: {
                name: "getAuction",
                arguments: { auctionId: "a1" },
                _meta: {
                    "io.modelcontextprotocol/protocolVersion": "2026-07-28",
                    "io.modelcontextprotocol/clientInfo": {
                        name: "aura-historia-webmcp",
                        version: "1.0.0",
                    },
                    "io.modelcontextprotocol/clientCapabilities": {},
                },
            },
        });
    });

    it("sends empty arguments when the agent passes none and numbers requests", async () => {
        fetchMock.mockImplementation(async () => jsonRpc({ result: { structuredContent: {} } }));

        await callMcpTool(ENDPOINT, "getPublicOverview", undefined);
        const first = lastRequest().body;
        await callMcpTool(ENDPOINT, "getPublicOverview", undefined);
        const second = lastRequest().body;

        expect(first.params.arguments).toEqual({});
        expect(second.id).toBeGreaterThan(first.id);
    });

    it("resolves with the result's structuredContent", async () => {
        const structuredContent = { items: [{ productListingId: "p1" }], size: 1 };
        fetchMock.mockResolvedValue(
            jsonRpc({
                result: {
                    content: [{ type: "text", text: JSON.stringify(structuredContent) }],
                    structuredContent,
                },
            }),
        );

        await expect(callMcpTool(ENDPOINT, "simpleSearchProductListings", {})).resolves.toEqual(
            structuredContent,
        );
    });

    it("rejects an isError result with the tool's error", async () => {
        fetchMock.mockResolvedValue(
            jsonRpc({ result: { isError: true, content: [{ type: "text", text: "NOT_FOUND" }] } }),
        );

        const error = await callMcpTool(ENDPOINT, "getAuction", { auctionId: "a1" }).catch(
            (reason: unknown) => reason,
        );

        expect(error).toBeInstanceOf(McpToolError);
        expect(error).toMatchObject({
            name: "McpToolError",
            toolName: "getAuction",
            toolError: "NOT_FOUND",
            message: "getAuction failed: NOT_FOUND",
        });
    });

    it.each([200, 400])("rejects -32602 distinctly (HTTP %i)", async (status) => {
        fetchMock.mockResolvedValue(
            jsonRpc({ error: { code: -32602, message: "Invalid tool parameters" } }, status),
        );

        const error = await callMcpTool(ENDPOINT, "getAuction", {}).catch(
            (reason: unknown) => reason,
        );

        expect(error).toBeInstanceOf(McpInvalidParamsError);
        expect(error).not.toBeInstanceOf(McpProtocolError);
        expect((error as Error).message).toContain("Invalid tool parameters");
    });

    it.each([
        [400, -32020],
        [403, -32600],
        [408, -32603],
        [413, -32600],
        [500, -32603],
    ])("rejects other JSON-RPC errors with their code (HTTP %i)", async (status, code) => {
        fetchMock.mockResolvedValue(jsonRpc({ error: { code, message: "Rejected" } }, status));

        await expect(callMcpTool(ENDPOINT, "getAuction", {})).rejects.toMatchObject({
            name: "McpProtocolError",
            code,
        });
    });

    it("rejects network failures as transport errors", async () => {
        const cause = new TypeError("Failed to fetch");
        fetchMock.mockRejectedValue(cause);

        const error = await callMcpTool(ENDPOINT, "getAuction", {}).catch(
            (reason: unknown) => reason,
        );

        expect(error).toBeInstanceOf(McpTransportError);
        expect(error).toMatchObject({ status: undefined, cause });
    });

    it.each([
        [
            "an HTTP error without a JSON-RPC body",
            new Response("Bad gateway", { status: 502 }),
            502,
        ],
        ["a non-JSON-RPC body", new Response(JSON.stringify({ ok: true }), { status: 200 }), 200],
        ["a result without structuredContent", jsonRpc({ result: { content: [] } }), 200],
        [
            "an event stream",
            new Response('event: message\ndata: {"jsonrpc":"2.0","id":1,"result":{}}\n\n', {
                headers: { "Content-Type": "text/event-stream" },
            }),
            200,
        ],
    ])("rejects %s as a transport error", async (_label, response, status) => {
        fetchMock.mockResolvedValue(response);

        await expect(callMcpTool(ENDPOINT, "getAuction", {})).rejects.toMatchObject({
            name: "McpTransportError",
            status,
        });
    });

    it("rejects with the abort reason when the agent cancels", async () => {
        const controller = new AbortController();
        fetchMock.mockImplementation(async () => {
            controller.abort(new DOMException("Cancelled", "AbortError"));
            throw new DOMException("The operation was aborted", "AbortError");
        });

        await expect(
            callMcpTool(ENDPOINT, "getAuction", {}, controller.signal),
        ).rejects.toMatchObject({ message: "Cancelled" });
    });
});
