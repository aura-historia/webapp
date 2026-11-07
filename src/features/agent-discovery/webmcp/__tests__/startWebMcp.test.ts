import type { AnyRouter } from "@tanstack/react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { startWebMcp } from "@/features/agent-discovery/webmcp/startWebMcp.ts";
import type { WebMcpRegistrationOptions } from "@/features/agent-discovery/webmcp/registerWebMcpTools.ts";

const registerWebMcpTools = vi.hoisted(() => vi.fn<(options: WebMcpRegistrationOptions) => void>());

vi.mock("@/env.ts", () => ({ env: { VITE_API_URL: "https://api.stage.aura-historia.com" } }));
vi.mock("@/features/agent-discovery/webmcp/registerWebMcpTools.ts", () => ({
    registerWebMcpTools,
}));

const router = { id: "router" } as unknown as AnyRouter;
const controllers: AbortController[] = [];

function start() {
    const controller = startWebMcp(router);
    if (controller) controllers.push(controller);
    return controller;
}

function provideModelContext() {
    const modelContext = { registerTool: vi.fn() };
    Object.defineProperty(document, "modelContext", { value: modelContext, configurable: true });
    return modelContext;
}

afterEach(() => {
    for (const controller of controllers.splice(0)) controller.abort();
    delete (document as { modelContext?: unknown }).modelContext;
    registerWebMcpTools.mockReset();
});

describe("startWebMcp", () => {
    it("does nothing without a model context", async () => {
        expect(start()).toBeUndefined();
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(registerWebMcpTools).not.toHaveBeenCalled();
    });

    it("registers the tools for this page and environment", async () => {
        const modelContext = provideModelContext();

        const controller = start();
        await vi.waitFor(() => expect(registerWebMcpTools).toHaveBeenCalledOnce());

        expect(registerWebMcpTools).toHaveBeenCalledWith({
            modelContext,
            router,
            signal: controller?.signal,
            pageOrigin: window.location.origin,
            mcpOrigin: "https://mcp.stage.aura-historia.com",
        });
    });

    it("registers once per document until the registration is aborted", async () => {
        provideModelContext();

        const first = start();
        expect(start()).toBeUndefined();
        await vi.waitFor(() => expect(registerWebMcpTools).toHaveBeenCalledOnce());

        first?.abort();
        expect(registerWebMcpTools.mock.calls[0][0].signal.aborted).toBe(true);
        expect(start()).toBeDefined();
        await vi.waitFor(() => expect(registerWebMcpTools).toHaveBeenCalledTimes(2));
    });
});
