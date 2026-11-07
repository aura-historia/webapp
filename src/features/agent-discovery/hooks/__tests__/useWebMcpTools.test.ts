import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useWebMcpTools } from "@/features/agent-discovery/hooks/useWebMcpTools.ts";
import type { WebMcpRegistrationOptions } from "@/features/agent-discovery/webmcp/registerWebMcpTools.ts";

const router = vi.hoisted(() => ({ id: "router" }));
const registerWebMcpTools = vi.hoisted(() => vi.fn<(options: WebMcpRegistrationOptions) => void>());

vi.mock("@tanstack/react-router", () => ({ useRouter: () => router }));
vi.mock("@/env.ts", () => ({ env: { VITE_API_URL: "https://api.stage.aura-historia.com" } }));
vi.mock("@/features/agent-discovery/webmcp/registerWebMcpTools.ts", () => ({
    registerWebMcpTools,
}));

afterEach(() => {
    delete (document as { modelContext?: unknown }).modelContext;
    registerWebMcpTools.mockReset();
});

describe("useWebMcpTools", () => {
    it("does nothing without a model context", async () => {
        const { unmount } = renderHook(() => useWebMcpTools());
        await new Promise((resolve) => setTimeout(resolve, 0));
        unmount();

        expect(registerWebMcpTools).not.toHaveBeenCalled();
    });

    it("registers the tools once for the document and unregisters them on unmount", async () => {
        const modelContext = { registerTool: vi.fn() };
        Object.defineProperty(document, "modelContext", {
            value: modelContext,
            configurable: true,
        });

        const { rerender, unmount } = renderHook(() => useWebMcpTools());
        rerender();
        await waitFor(() => expect(registerWebMcpTools).toHaveBeenCalledOnce());

        const [options] = registerWebMcpTools.mock.calls[0];
        expect(options).toMatchObject({
            modelContext,
            router,
            pageOrigin: window.location.origin,
            mcpOrigin: "https://mcp.stage.aura-historia.com",
        });
        expect(options.signal.aborted).toBe(false);

        unmount();
        expect(options.signal.aborted).toBe(true);
    });
});
