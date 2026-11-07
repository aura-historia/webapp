import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    AGENT_DISCOVERY_BACKEND_TIMEOUT_MS,
    AGENT_DISCOVERY_CLIENT_CACHE_CONTROL,
    AGENT_DISCOVERY_EDGE_CACHE_TTL_SECONDS,
    forwardAgentDiscoveryRequest,
} from "@/features/agent-discovery/server/agentDiscoveryForwarding.ts";

const mockEnv = vi.hoisted(() => ({}) as Record<string, string | undefined>);
vi.mock("@/env.ts", () => ({ env: mockEnv }));

const SITE = "https://stage.aura-historia.com";
const API = "https://api.stage.aura-historia.com";
const MCP = "https://mcp.stage.aura-historia.com";
const BACKEND_CACHE_CONTROL = "public, max-age=0, s-maxage=300, stale-if-error=0";
const API_CATALOG_TYPE =
    'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"';
const API_CATALOG_LINK = `<${API}/.well-known/api-catalog>; rel="api-catalog"`;

/** Bytes a re-encoding would change: a BOM, CRLF, tabs, trailing spaces, non-ASCII, no final newline. */
const SKILL_BYTES = new Uint8Array([
    ...new TextEncoder().encode(
        "\uFEFF---\r\nname: catalogue-search\r\n---\r\n\r\n# Suche \t \r\n",
    ),
    0xc3,
    0xa4,
    0x20,
    0x20,
]);

const DOCUMENTS: ReadonlyArray<readonly [websitePath: string, backendUrl: string, type: string]> = [
    [
        "/.well-known/mcp/server-card.json",
        `${MCP}/.well-known/mcp/server-card.json`,
        "application/mcp-server-card+json",
    ],
    ["/.well-known/api-catalog", `${API}/.well-known/api-catalog`, API_CATALOG_TYPE],
    [
        "/.well-known/oauth-authorization-server",
        `${API}/.well-known/oauth-authorization-server`,
        "application/json",
    ],
    [
        "/.well-known/ai-catalog.json",
        `${API}/v1/site-discovery/ai-catalog.json`,
        "application/ai-catalog+json",
    ],
    [
        "/.well-known/ard.json",
        `${API}/v1/site-discovery/ai-catalog.json`,
        "application/ai-catalog+json",
    ],
    ["/.well-known/poppy.json", `${API}/v1/site-discovery/poppy.json`, "application/json"],
    [
        "/.well-known/agent-skills/index.json",
        `${API}/v1/site-discovery/agent-skills/index.json`,
        "application/json",
    ],
    [
        "/.well-known/agent-skills/catalogue-search/SKILL.md",
        `${API}/v1/site-discovery/agent-skills/catalogue-search/SKILL.md`,
        "text/markdown; charset=utf-8",
    ],
    ["/auth.md", `${API}/v1/site-discovery/auth.md`, "text/markdown; charset=utf-8"],
];

interface StoredEntry {
    readonly status: number;
    readonly headers: Headers;
    readonly body: ArrayBuffer;
}

/** The Workers Cache API surface the forwarder uses, keyed by URL like the edge cache. */
class FakeEdgeCache {
    readonly entries = new Map<string, StoredEntry>();
    readonly match = vi.fn(async (request: Request): Promise<Response | undefined> => {
        const entry = this.entries.get(request.url);
        if (!entry) {
            return undefined;
        }
        const headers = new Headers(entry.headers);
        // Headers the edge adds to a hit must not reach the client.
        headers.set("CF-Cache-Status", "HIT");
        headers.set("Age", "12");
        return new Response(entry.body.slice(0), { status: entry.status, headers });
    });
    readonly put = vi.fn(async (request: Request, response: Response): Promise<void> => {
        if (request.method !== "GET") {
            throw new TypeError("Cannot cache response to non-GET request.");
        }
        this.entries.set(request.url, {
            status: response.status,
            headers: new Headers(response.headers),
            body: await response.arrayBuffer(),
        });
    });
}

function backendResponse(
    body: BodyInit | null,
    init: { status?: number; headers?: Record<string, string> } = {},
): Response {
    return new Response(body, {
        status: init.status ?? 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": BACKEND_CACHE_CONTROL,
            ...init.headers,
        },
    });
}

function request(path: string, init?: RequestInit): Request {
    return new Request(`${SITE}${path}`, init);
}

async function forward(path: string, init?: RequestInit): Promise<Response> {
    const response = await forwardAgentDiscoveryRequest(request(path, init));
    if (!response) {
        throw new Error(`${path} was not forwarded`);
    }
    return response;
}

function sha256(bytes: ArrayBuffer | Uint8Array): string {
    return createHash("sha256").update(new Uint8Array(bytes)).digest("hex");
}

const fetchMock = vi.fn<typeof fetch>();
let edgeCache: FakeEdgeCache;

beforeEach(() => {
    for (const key of Object.keys(mockEnv)) {
        delete mockEnv[key];
    }
    mockEnv.VITE_API_URL = API;
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    edgeCache = new FakeEdgeCache();
    vi.stubGlobal("caches", { default: edgeCache });
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("forwardAgentDiscoveryRequest", () => {
    it.each(DOCUMENTS)("publishes %s from %s", async (path, backendUrl, type) => {
        fetchMock.mockResolvedValue(
            backendResponse("document", { headers: { "Content-Type": type } }),
        );

        const response = await forward(path);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(String(fetchMock.mock.calls[0][0])).toBe(backendUrl);
        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe(type);
        expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
        expect(await response.text()).toBe("document");
    });

    it("leaves every other path to the app", async () => {
        for (const path of ["/", "/de/", "/de/auth.md", "/.well-known/openid-configuration"]) {
            await expect(forwardAgentDiscoveryRequest(request(path))).resolves.toBeUndefined();
        }
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("uses a configured MCP origin and the production backends by default", async () => {
        fetchMock.mockImplementation(async () => backendResponse("{}"));

        mockEnv.VITE_MCP_URL = "https://mcp.example.test/v1";
        await forward("/.well-known/mcp/server-card.json");
        delete mockEnv.VITE_MCP_URL;
        delete mockEnv.VITE_API_URL;
        edgeCache.entries.clear();
        await forward("/.well-known/mcp/server-card.json");
        await forward("/auth.md");

        expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
            "https://mcp.example.test/.well-known/mcp/server-card.json",
            "https://mcp.aura-historia.com/.well-known/mcp/server-card.json",
            "https://api.aura-historia.com/v1/site-discovery/auth.md",
        ]);
    });

    it("sends a fresh GET without the client's cookies, credentials, origin or query", async () => {
        fetchMock.mockResolvedValue(backendResponse("{}"));

        await forward("/.well-known/poppy.json?cache=bust", {
            headers: {
                Authorization: "Bearer user-token",
                Cookie: "session=secret",
                Origin: "https://agent.example",
                Referer: "https://agent.example/page",
                "X-Forwarded-For": "203.0.113.7",
                "User-Agent": "agent/1.0",
                Accept: "text/html",
            },
        });

        const [url, init] = fetchMock.mock.calls[0];
        expect(String(url)).toBe(`${API}/v1/site-discovery/poppy.json`);
        expect(init?.method).toBe("GET");
        expect(init?.redirect).toBe("manual");
        expect(init?.signal).toBeInstanceOf(AbortSignal);
        expect([...new Headers(init?.headers).entries()]).toEqual([["accept", "*/*"]]);
    });

    it("passes the API catalog's media type parameters and Link header through unchanged", async () => {
        fetchMock.mockImplementation(async () =>
            backendResponse('{"linkset":[]}', {
                headers: { "Content-Type": API_CATALOG_TYPE, Link: API_CATALOG_LINK },
            }),
        );

        for (const method of ["GET", "HEAD"]) {
            edgeCache.entries.clear();
            const response = await forward("/.well-known/api-catalog", { method });

            expect(response.headers.get("Content-Type")).toBe(API_CATALOG_TYPE);
            expect(response.headers.get("Link")).toBe(API_CATALOG_LINK);
            expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
        }
    });

    it("passes no other backend header through", async () => {
        fetchMock.mockResolvedValue(
            backendResponse("{}", {
                headers: {
                    "Content-Type": "application/ai-catalog+json",
                    Link: '<https://api.example>; rel="other"',
                    "Set-Cookie": "backend=1",
                    "Content-Encoding": "identity",
                    ETag: '"abc"',
                    Server: "backend",
                    Vary: "Origin",
                    Via: "1.1 cloudfront",
                    "X-Cache": "Hit from cloudfront",
                },
            }),
        );

        const response = await forward("/.well-known/ai-catalog.json");

        expect([...response.headers.keys()].sort()).toEqual([
            "access-control-allow-origin",
            "cache-control",
            "content-type",
            "x-content-type-options",
        ]);
        expect(response.headers.get("Cache-Control")).toBe(AGENT_DISCOVERY_CLIENT_CACHE_CONTROL);
    });

    it("passes the body through byte for byte, from the backend and from the edge", async () => {
        fetchMock.mockImplementation(async () =>
            backendResponse(SKILL_BYTES.slice(), {
                headers: { "Content-Type": "text/markdown; charset=utf-8" },
            }),
        );
        const path = "/.well-known/agent-skills/catalogue-search/SKILL.md";

        const fromBackend = new Uint8Array(await (await forward(path)).arrayBuffer());
        const fromEdge = new Uint8Array(await (await forward(path)).arrayBuffer());

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fromBackend).toEqual(SKILL_BYTES);
        expect(fromEdge).toEqual(SKILL_BYTES);
    });

    it("serves every SKILL.md with the digest the website's skills index names", async () => {
        const skills = {
            "catalogue-search": SKILL_BYTES,
            "connect-account": new TextEncoder().encode("---\nname: connect-account\n---\n"),
        };
        const index = JSON.stringify({
            skills: Object.entries(skills).map(([name, bytes]) => ({
                name,
                type: "skill-md",
                url: `${SITE}/.well-known/agent-skills/${name}/SKILL.md`,
                digest: `sha256:${sha256(bytes)}`,
            })),
        });
        fetchMock.mockImplementation(async (input) => {
            const path = new URL(String(input)).pathname;
            const name = /agent-skills\/([^/]+)\/SKILL\.md$/.exec(path)?.[1];
            return name
                ? backendResponse(skills[name as keyof typeof skills].slice(), {
                      headers: { "Content-Type": "text/markdown; charset=utf-8" },
                  })
                : backendResponse(index, { headers: { "Content-Type": "application/json" } });
        });

        const served = (await (await forward("/.well-known/agent-skills/index.json")).json()) as {
            skills: Array<{ url: string; digest: string }>;
        };
        for (const skill of served.skills) {
            for (let attempt = 0; attempt < 2; attempt++) {
                const response = await forward(new URL(skill.url).pathname);
                expect(`sha256:${sha256(await response.arrayBuffer())}`).toBe(skill.digest);
            }
        }
    });

    it("answers HEAD with the GET status and headers but no body", async () => {
        fetchMock.mockImplementation(async () =>
            backendResponse("# auth.md", {
                headers: { "Content-Type": "text/markdown; charset=utf-8" },
            }),
        );

        const fromBackend = await forward("/auth.md", { method: "HEAD" });
        const fromEdge = await forward("/auth.md", { method: "HEAD" });

        for (const response of [fromBackend, fromEdge]) {
            expect(response.status).toBe(200);
            expect(response.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
            expect(response.body).toBeNull();
        }
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0][1]?.method).toBe("GET");
    });

    it("passes a backend client error through without caching it", async () => {
        fetchMock.mockImplementation(async () =>
            backendResponse(null, {
                status: 404,
                headers: { "Cache-Control": "private, no-store" },
            }),
        );
        const path = "/.well-known/agent-skills/unknown/SKILL.md";

        const first = await forward(path);
        const second = await forward(path);

        expect(first.status).toBe(404);
        expect(second.status).toBe(404);
        expect(first.headers.get("Cache-Control")).toBe("no-store");
        expect(edgeCache.put).not.toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("passes a backend status without a body through", async () => {
        fetchMock.mockResolvedValue(backendResponse(null, { status: 204 }));

        const response = await forward("/.well-known/poppy.json");

        expect(response.status).toBe(204);
        expect(response.body).toBeNull();
        expect(edgeCache.put).not.toHaveBeenCalled();
    });

    it("answers malformed skill paths and other methods itself", async () => {
        const notFound = await forward("/.well-known/agent-skills/a%2Fb/SKILL.md");
        const notFoundHead = await forward("/.well-known/agent-skills/x/skill.md", {
            method: "HEAD",
        });
        const post = await forward("/.well-known/api-catalog", { method: "POST", body: "{}" });
        const options = await forward("/auth.md", { method: "OPTIONS" });

        expect(notFound.status).toBe(404);
        expect(notFound.headers.get("Content-Type")).toBe("application/json; charset=utf-8");
        expect(await notFound.json()).toMatchObject({ status: 404, error: "NOT_FOUND" });
        expect(notFoundHead.status).toBe(404);
        expect(notFoundHead.body).toBeNull();
        for (const response of [post, options]) {
            expect(response.status).toBe(405);
            expect(response.headers.get("Allow")).toBe("GET, HEAD");
        }
        expect(fetchMock).not.toHaveBeenCalled();
    });

    describe("backend failures", () => {
        it.each([
            ["is unreachable", () => Promise.reject(new TypeError("fetch failed")), 502],
            [
                "times out",
                () => Promise.reject(new DOMException("The operation timed out.", "TimeoutError")),
                502,
            ],
            [
                "fails",
                () =>
                    Promise.resolve(
                        backendResponse("<html>error</html>", {
                            status: 500,
                            headers: { "Content-Type": "text/html" },
                        }),
                    ),
                502,
            ],
            [
                "answers 502",
                () => Promise.resolve(backendResponse("bad gateway", { status: 502 })),
                502,
            ],
            [
                "is unavailable",
                () => Promise.resolve(backendResponse("unavailable", { status: 503 })),
                503,
            ],
            [
                "redirects",
                () =>
                    Promise.resolve(
                        new Response(null, {
                            status: 302,
                            headers: { Location: "https://elsewhere.example/" },
                        }),
                    ),
                502,
            ],
        ])("answers JSON when the backend %s", async (_, backend, status) => {
            fetchMock.mockImplementation(backend);

            const response = await forward("/.well-known/ai-catalog.json");

            expect(response.status).toBe(status);
            expect(response.headers.get("Content-Type")).toBe("application/json; charset=utf-8");
            expect(response.headers.get("Cache-Control")).toBe("no-store");
            expect(response.headers.get("Location")).toBeNull();
            expect(await response.json()).toMatchObject({
                status,
                error: status === 503 ? "SERVICE_UNAVAILABLE" : "BAD_GATEWAY",
            });
            expect(edgeCache.put).not.toHaveBeenCalled();
        });

        it("answers JSON when the body cannot be read", async () => {
            fetchMock.mockResolvedValue(
                backendResponse(
                    new ReadableStream({
                        pull(controller) {
                            controller.error(new Error("connection reset"));
                        },
                    }),
                ),
            );

            const response = await forward("/auth.md");

            expect(response.status).toBe(502);
            expect(edgeCache.put).not.toHaveBeenCalled();
        });

        it("bounds the backend request", async () => {
            const timeout = vi.spyOn(AbortSignal, "timeout");
            fetchMock.mockResolvedValue(backendResponse("{}"));

            await forward("/.well-known/poppy.json");

            expect(timeout).toHaveBeenCalledWith(AGENT_DISCOVERY_BACKEND_TIMEOUT_MS);
            timeout.mockRestore();
        });
    });

    describe("edge caching", () => {
        it("keeps each document once per website path for the shared TTL", async () => {
            fetchMock.mockImplementation(async () =>
                backendResponse('{"entries":[]}', {
                    headers: { "Content-Type": "application/ai-catalog+json" },
                }),
            );

            const first = await forward("/.well-known/ai-catalog.json");
            const second = await forward("/.well-known/ai-catalog.json?v=2", {
                headers: { Authorization: "Bearer x" },
            });

            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(edgeCache.put).toHaveBeenCalledTimes(1);
            const [key, stored] = edgeCache.put.mock.calls[0];
            expect(key.url).toBe(`${SITE}/.well-known/ai-catalog.json`);
            expect(key.method).toBe("GET");
            expect([...key.headers.keys()]).toEqual([]);
            expect(stored.headers.get("Cache-Control")).toBe(
                `public, max-age=${AGENT_DISCOVERY_EDGE_CACHE_TTL_SECONDS}`,
            );
            for (const response of [first, second]) {
                expect(response.headers.get("Cache-Control")).toBe(
                    AGENT_DISCOVERY_CLIENT_CACHE_CONTROL,
                );
                expect(response.headers.get("Content-Type")).toBe("application/ai-catalog+json");
                expect(response.headers.has("CF-Cache-Status")).toBe(false);
                expect(response.headers.has("Age")).toBe(false);
                expect(await response.text()).toBe('{"entries":[]}');
            }
        });

        it("caches the skills index and every SKILL.md for the same time", async () => {
            fetchMock.mockImplementation(async () => backendResponse("x"));

            await forward("/.well-known/agent-skills/index.json");
            await forward("/.well-known/agent-skills/catalogue-search/SKILL.md");
            await forward("/.well-known/agent-skills/partner-listing-batches/SKILL.md");

            expect(
                edgeCache.put.mock.calls.map(([, response]) =>
                    response.headers.get("Cache-Control"),
                ),
            ).toEqual(Array(3).fill(`public, max-age=${AGENT_DISCOVERY_EDGE_CACHE_TTL_SECONDS}`));
            expect(AGENT_DISCOVERY_EDGE_CACHE_TTL_SECONDS).toBeLessThanOrEqual(300);
        });

        it("never caches the OAuth metadata and passes its no-store through", async () => {
            fetchMock.mockImplementation(async () =>
                backendResponse('{"issuer":"x"}', {
                    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
                }),
            );

            const first = await forward("/.well-known/oauth-authorization-server");
            await forward("/.well-known/oauth-authorization-server");

            expect(first.headers.get("Cache-Control")).toBe("no-store");
            expect(edgeCache.match).not.toHaveBeenCalled();
            expect(edgeCache.put).not.toHaveBeenCalled();
            expect(fetchMock).toHaveBeenCalledTimes(2);
        });

        it.each(["private, no-store", "no-cache", "public, max-age=0, s-maxage=0"])(
            "respects a backend that forbids shared caching with %s",
            async (cacheControl) => {
                fetchMock.mockImplementation(async () =>
                    backendResponse("{}", { headers: { "Cache-Control": cacheControl } }),
                );

                const response = await forward("/.well-known/poppy.json");

                expect(response.status).toBe(200);
                expect(response.headers.get("Cache-Control")).toBe("no-store");
                expect(edgeCache.put).not.toHaveBeenCalled();
            },
        );

        it("still answers when the cache fails or is unavailable", async () => {
            fetchMock.mockImplementation(async () => backendResponse("card"));
            edgeCache.match.mockRejectedValueOnce(new Error("cache down"));
            edgeCache.put.mockRejectedValueOnce(new Error("cache down"));

            const withFailingCache = await forward("/.well-known/mcp/server-card.json");
            vi.stubGlobal("caches", undefined);
            const withoutCache = await forward("/.well-known/mcp/server-card.json");

            expect(await withFailingCache.text()).toBe("card");
            expect(await withoutCache.text()).toBe("card");
            expect(fetchMock).toHaveBeenCalledTimes(2);
        });
    });
});
