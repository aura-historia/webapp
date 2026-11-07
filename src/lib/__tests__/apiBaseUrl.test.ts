import { describe, expect, it } from "vitest";
import { getApiBaseUrl, getMcpBaseUrl } from "@/lib/apiBaseUrl.ts";

describe("getApiBaseUrl", () => {
    it("uses the configured API and production by default", () => {
        expect(getApiBaseUrl("https://api.stage.aura-historia.com")).toBe(
            "https://api.stage.aura-historia.com",
        );
        expect(getApiBaseUrl()).toBe("https://api.aura-historia.com");
    });
});

describe("getMcpBaseUrl", () => {
    it("uses the configured MCP origin, without a path", () => {
        expect(getMcpBaseUrl("https://mcp.example.test/v1", "https://api.aura-historia.com")).toBe(
            "https://mcp.example.test",
        );
        expect(getMcpBaseUrl("http://localhost:8081", "http://localhost:8080")).toBe(
            "http://localhost:8081",
        );
    });

    it.each([
        ["https://api.aura-historia.com", "https://mcp.aura-historia.com"],
        ["https://api.stage.aura-historia.com", "https://mcp.stage.aura-historia.com"],
        ["https://api.stage.aura-historia.com/", "https://mcp.stage.aura-historia.com"],
        ["http://api.localhost:8080", "http://mcp.localhost:8080"],
    ])("defaults the API %s to its MCP sibling %s", (apiBaseUrl, mcpBaseUrl) => {
        expect(getMcpBaseUrl(undefined, apiBaseUrl)).toBe(mcpBaseUrl);
    });

    it("falls back to production for an API host without an api. label", () => {
        expect(getMcpBaseUrl(undefined, "http://localhost:8080")).toBe(
            "https://mcp.aura-historia.com",
        );
        expect(getMcpBaseUrl(undefined, "https://rapi.example.test")).toBe(
            "https://mcp.aura-historia.com",
        );
    });
});
