import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SUPPORTED_LANGUAGES } from "@/i18n/languages.ts";
import { API_CATALOG_LINK_HEADER } from "@/features/agent-discovery/lib/agentDiscoveryPaths.ts";
import { applyAgentDiscoveryLinkHeader } from "@/features/agent-discovery/server/agentDiscoveryLinkHeader.ts";

describe("applyAgentDiscoveryLinkHeader", () => {
    it("names the API catalog on HTML pages", () => {
        const headers = applyAgentDiscoveryLinkHeader(
            new Headers({ "Content-Type": "text/html; charset=utf-8" }),
        );

        expect(headers.get("Link")).toBe('</.well-known/api-catalog>; rel="api-catalog"');
    });

    it("keeps existing links and adds the catalog once", () => {
        const headers = new Headers({
            "Content-Type": "TEXT/HTML",
            Link: '</llms.txt>; rel="describedby"',
        });

        applyAgentDiscoveryLinkHeader(headers);
        applyAgentDiscoveryLinkHeader(headers);

        expect(headers.get("Link")).toBe(
            `</llms.txt>; rel="describedby", ${API_CATALOG_LINK_HEADER}`,
        );
    });

    it.each([
        ["JSON", new Headers({ "Content-Type": "application/json" })],
        ["a redirect without a body", new Headers({ Location: "/de/" })],
        ["text that only resembles HTML", new Headers({ "Content-Type": "text/html-sandboxed" })],
    ])("leaves %s alone", (_, headers) => {
        expect(applyAgentDiscoveryLinkHeader(headers).has("Link")).toBe(false);
    });

    it("is served on every prerendered page from Cloudflare static asset headers", () => {
        const cloudflareHeaders = readFileSync(resolve(process.cwd(), "public/_headers"), "utf8");

        for (const { code } of SUPPORTED_LANGUAGES) {
            expect(cloudflareHeaders).toContain(
                `\n/${code}/*\n  Link: ${API_CATALOG_LINK_HEADER}\n`,
            );
        }
    });
});
