import { describe, expect, it } from "vitest";
import {
    AGENT_DISCOVERY_DOCUMENTS,
    resolveAgentDiscoveryRoute,
} from "@/features/agent-discovery/server/agentDiscoveryRoutes.ts";

describe("resolveAgentDiscoveryRoute", () => {
    it.each([
        ["/.well-known/mcp/server-card.json", "mcp", "/.well-known/mcp/server-card.json"],
        ["/.well-known/api-catalog", "api", "/.well-known/api-catalog"],
        [
            "/.well-known/oauth-authorization-server",
            "api",
            "/.well-known/oauth-authorization-server",
        ],
        ["/.well-known/ai-catalog.json", "api", "/v1/site-discovery/ai-catalog.json"],
        ["/.well-known/ard.json", "api", "/v1/site-discovery/ai-catalog.json"],
        ["/.well-known/poppy.json", "api", "/v1/site-discovery/poppy.json"],
        [
            "/.well-known/agent-skills/index.json",
            "api",
            "/v1/site-discovery/agent-skills/index.json",
        ],
        [
            "/.well-known/agent-skills/catalogue-search/SKILL.md",
            "api",
            "/v1/site-discovery/agent-skills/catalogue-search/SKILL.md",
        ],
        ["/auth.md", "api", "/v1/site-discovery/auth.md"],
    ])("publishes %s from the %s host's %s", (path, backend, backendPath) => {
        const route = resolveAgentDiscoveryRoute(path);

        expect(route).toEqual({
            kind: "document",
            document: expect.objectContaining({ backend, backendPath }),
        });
    });

    it("caches every document at the edge except the OAuth metadata", () => {
        const uncached = Object.entries(AGENT_DISCOVERY_DOCUMENTS)
            .filter(([, document]) => document.caching !== "edge")
            .map(([path]) => path);

        expect(uncached).toEqual(["/.well-known/oauth-authorization-server"]);
        expect(
            resolveAgentDiscoveryRoute("/.well-known/agent-skills/connect-account/SKILL.md"),
        ).toEqual({ kind: "document", document: expect.objectContaining({ caching: "edge" }) });
    });

    it("passes the Link header through on the API catalog only", () => {
        const withLink = Object.entries(AGENT_DISCOVERY_DOCUMENTS)
            .filter(([, document]) => document.passThroughHeaders.includes("Link"))
            .map(([path]) => path);

        expect(withLink).toEqual(["/.well-known/api-catalog"]);
    });

    it.each([
        "/.well-known/openid-configuration",
        "/.well-known/oauth-protected-resource",
        "/.well-known/oauth-protected-resource/de/",
        "/.well-known/acp.json",
        "/.well-known/mcp.json",
        "/.well-known/api-catalog/",
        "/.well-known/API-CATALOG",
        "/de/auth.md",
        "/auth.md/",
        "/llms.txt",
        "/",
        "/de/",
        "/api/oauth/client/redirect-broker/woocommerce",
        "/constructor",
        "/__proto__",
        "/toString",
    ])("leaves %s to the app", (path) => {
        expect(resolveAgentDiscoveryRoute(path)).toBeUndefined();
    });

    it.each([
        "/.well-known/agent-skills/",
        "/.well-known/agent-skills/catalogue-search",
        "/.well-known/agent-skills/catalogue-search/",
        "/.well-known/agent-skills/catalogue-search/skill.md",
        "/.well-known/agent-skills/catalogue-search/SKILL.md/x",
        "/.well-known/agent-skills/Catalogue-Search/SKILL.md",
        "/.well-known/agent-skills/-search/SKILL.md",
        "/.well-known/agent-skills/catalogue--search/SKILL.md",
        "/.well-known/agent-skills/..%2F..%2Fv1%2Fme/SKILL.md",
        "/.well-known/agent-skills/a%2Fb/SKILL.md",
        `/.well-known/agent-skills/${"a".repeat(65)}/SKILL.md`,
    ])("answers %s as not found without the backend", (path) => {
        expect(resolveAgentDiscoveryRoute(path)).toEqual({ kind: "not-found" });
    });

    it("accepts a skill name of 64 characters", () => {
        expect(
            resolveAgentDiscoveryRoute(`/.well-known/agent-skills/${"a".repeat(64)}/SKILL.md`),
        ).toMatchObject({ kind: "document" });
    });
});
