import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AGENT_DISCOVERY_DOCUMENTS } from "@/features/agent-discovery/server/agentDiscoveryRoutes.ts";
import { API_CATALOG_LINK_HEADER } from "@/features/agent-discovery/lib/agentDiscoveryPaths.ts";
import { isLocalizedAppPath } from "@/i18n/routing.ts";

/** The app's answer for any path: the root route's locale redirect, as for an unprefixed page. */
const defaultFetch = vi.hoisted(() => vi.fn());
const createServerEntry = vi.hoisted(() => vi.fn((entry: unknown) => entry));
vi.mock("@tanstack/react-start/server-entry", () => ({
    default: { fetch: defaultFetch },
    createServerEntry,
}));
vi.mock("@/env.ts", () => ({ env: { VITE_API_URL: "https://api.stage.aura-historia.com" } }));

const { default: server } = await import("@/server.ts");
const { default: worker } = await import("@/worker.ts");
// Recorded at import: mock calls are cleared between tests.
const serverEntries = createServerEntry.mock.calls.map(([entry]) => entry);

const SITE = "https://stage.aura-historia.com";
const WEBSITE_PATHS = [
    ...Object.keys(AGENT_DISCOVERY_DOCUMENTS),
    "/.well-known/agent-skills/catalogue-search/SKILL.md",
];

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
    defaultFetch.mockReset();
    defaultFetch.mockImplementation(
        async (request: Request) =>
            new Response(null, {
                status: 302,
                headers: { Location: `/de${new URL(request.url).pathname}` },
            }),
    );
    fetchMock.mockReset();
    fetchMock.mockImplementation(
        async () =>
            new Response("{}", {
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            }),
    );
    vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("server entry", () => {
    it("is the Worker's handler, inside TanStack Start's request scope", () => {
        expect(worker).toBe(server);
        expect(serverEntries).toEqual([server]);
    });

    it.each(WEBSITE_PATHS)("answers %s from the backend, never the app", async (path) => {
        // Without the forwarding table, the root route would locale-redirect this path.
        expect(isLocalizedAppPath(path)).toBe(true);

        for (const method of ["GET", "HEAD"]) {
            const response = await server.fetch(new Request(`${SITE}${path}`, { method }));

            expect(response.status).toBe(200);
            expect(response.headers.get("Location")).toBeNull();
            expect(response.headers.get("Content-Type")).toBe("application/json");
        }
        expect(defaultFetch).not.toHaveBeenCalled();
    });

    it("answers a backend failure with JSON instead of the app's HTML", async () => {
        fetchMock.mockRejectedValue(new TypeError("fetch failed"));

        const response = await server.fetch(new Request(`${SITE}/auth.md`));

        expect(response.status).toBe(502);
        expect(response.headers.get("Content-Type")).toBe("application/json; charset=utf-8");
        expect(defaultFetch).not.toHaveBeenCalled();
    });

    it("adds the API catalog link and security headers to HTML pages", async () => {
        defaultFetch.mockResolvedValue(
            new Response("<!doctype html>", {
                headers: { "Content-Type": "text/html; charset=utf-8" },
            }),
        );

        const response = await server.fetch(new Request(`${SITE}/de/search`));

        expect(response.headers.get("Link")).toBe(API_CATALOG_LINK_HEADER);
        expect(response.headers.get("Content-Security-Policy")).toContain("frame-ancestors");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("copies a response whose headers are immutable before adding headers", async () => {
        defaultFetch.mockResolvedValue(Response.redirect(`${SITE}/de/`, 302));

        const response = await server.fetch(new Request(`${SITE}/`));

        expect(response.status).toBe(302);
        expect(response.headers.get("Location")).toBe(`${SITE}/de/`);
        expect(response.headers.get("Content-Security-Policy")).toContain("frame-ancestors");
    });

    it("leaves the app's redirects and other responses without the link", async () => {
        const redirect = await server.fetch(new Request(`${SITE}/`));

        expect(redirect.status).toBe(302);
        expect(redirect.headers.get("Location")).toBe("/de/");
        expect(redirect.headers.has("Link")).toBe(false);
    });
});
