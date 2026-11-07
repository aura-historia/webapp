import { afterEach, describe, expect, it } from "vitest";
import { getModelContext } from "@/features/agent-discovery/webmcp/modelContext.ts";

function setModelContext(target: Document | Navigator, value: unknown) {
    Object.defineProperty(target, "modelContext", { value, configurable: true });
}

afterEach(() => {
    delete (document as { modelContext?: unknown }).modelContext;
    delete (navigator as { modelContext?: unknown }).modelContext;
});

describe("getModelContext", () => {
    it("returns undefined without WebMCP", () => {
        expect(getModelContext()).toBeUndefined();
    });

    it("prefers document.modelContext", () => {
        const current = { registerTool: () => Promise.resolve() };
        setModelContext(document, current);
        setModelContext(navigator, { registerTool: () => undefined });

        expect(getModelContext()).toBe(current);
    });

    it("falls back to navigator.modelContext of older Chrome builds", () => {
        const legacy = { registerTool: () => undefined };
        setModelContext(navigator, legacy);

        expect(getModelContext()).toBe(legacy);
    });

    it("ignores an object without registerTool", () => {
        setModelContext(document, {});

        expect(getModelContext()).toBeUndefined();
    });
});
