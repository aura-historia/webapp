import { describe, expect, it, vi } from "vitest";
import type {
    ConnectedApp,
    ConnectedAppToken,
} from "@/data/internal/access-tokens/OwnCredentials.ts";
import {
    getConnectedAppExpiry,
    getConnectedAppKind,
    isWebsiteBrowserAgentsClient,
    sortConnectedApps,
} from "./connectedApps.ts";

vi.mock("@/env.ts", () => ({ env: { VITE_APP_URL: "https://aura-historia.com" } }));

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 8, 12, 0, 0);
const WEBSITE_CLIENT_ID = "https://aura-historia.com/oauth/webmcp-client.json";

function app(
    overrides: Omit<Partial<ConnectedApp>, "client"> & {
        client?: Partial<ConnectedApp["client"]>;
    } = {},
): ConnectedApp {
    const { client, ...rest } = overrides;
    return {
        origin: "OAuth",
        scopes: [],
        connection: null,
        tokens: [],
        ...rest,
        client: {
            clientId: "oc_shopify",
            name: "Shopify",
            kind: "registered",
            host: "shopify.com",
            ...client,
        },
    };
}

function token(id: string, expiresAt: Date | null): ConnectedAppToken {
    return { id, scopes: [], expiresAt };
}

describe("isWebsiteBrowserAgentsClient", () => {
    it("recognizes the website's own WebMCP client document", () => {
        expect(isWebsiteBrowserAgentsClient(WEBSITE_CLIENT_ID)).toBe(true);
    });

    it("does not recognize another host's document at the same path", () => {
        expect(isWebsiteBrowserAgentsClient("https://example.com/oauth/webmcp-client.json")).toBe(
            false,
        );
        expect(
            isWebsiteBrowserAgentsClient("https://claude.ai/oauth/claude-code-client-metadata"),
        ).toBe(false);
    });
});

describe("getConnectedAppKind", () => {
    it("reads a registered client as an integration", () => {
        expect(getConnectedAppKind(app())).toBe("integration");
    });

    it("reads a registered client as an integration even with the website client's ID", () => {
        expect(getConnectedAppKind(app({ client: { clientId: WEBSITE_CLIENT_ID } }))).toBe(
            "integration",
        );
    });

    it("reads the website's own metadata document client as browser agents", () => {
        expect(
            getConnectedAppKind(
                app({ client: { clientId: WEBSITE_CLIENT_ID, kind: "metadataDocument" } }),
            ),
        ).toBe("browser");
    });

    it("reads any other metadata document client as an AI agent", () => {
        expect(
            getConnectedAppKind(
                app({
                    client: {
                        clientId: "https://claude.ai/oauth/claude-code-client-metadata",
                        kind: "metadataDocument",
                    },
                }),
            ),
        ).toBe("agent");
    });
});

describe("getConnectedAppExpiry", () => {
    it("has no expiry without tokens", () => {
        expect(getConnectedAppExpiry(app(), NOW)).toBeNull();
    });

    it("never expires while one token does not expire", () => {
        expect(
            getConnectedAppExpiry(
                app({
                    tokens: [token("a", new Date(NOW + 30 * DAY)), token("b", null)],
                }),
                NOW,
            ),
        ).toEqual({ state: "none", expiresAt: null });
    });

    it("ends at the latest token's expiry", () => {
        const latest = new Date(NOW + 60 * DAY);
        expect(
            getConnectedAppExpiry(
                app({
                    tokens: [
                        token("a", new Date(NOW + 30 * DAY)),
                        token("b", latest),
                        token("c", new Date(NOW - DAY)),
                    ],
                }),
                NOW,
            ),
        ).toEqual({ state: "later", expiresAt: latest });
    });

    it("is expired when every token has expired", () => {
        const latest = new Date(NOW - DAY);
        expect(
            getConnectedAppExpiry(
                app({ tokens: [token("a", new Date(NOW - 10 * DAY)), token("b", latest)] }),
                NOW,
            ),
        ).toEqual({ state: "expired", expiresAt: latest });
    });

    it("expires soon within the warning window", () => {
        const latest = new Date(NOW + 3 * DAY);
        expect(getConnectedAppExpiry(app({ tokens: [token("a", latest)] }), NOW)).toEqual({
            state: "soon",
            expiresAt: latest,
        });
    });

    it("reads a dated app as valid without a clock reading", () => {
        const latest = new Date(NOW - DAY);
        expect(getConnectedAppExpiry(app({ tokens: [token("a", latest)] }), null)).toEqual({
            state: "later",
            expiresAt: latest,
        });
    });
});

describe("sortConnectedApps", () => {
    it("sorts by the shown name without changing the input", () => {
        const apps = [
            app({ client: { clientId: "c", name: "shopify" } }),
            app({ client: { clientId: "a", name: "Claude Code" } }),
            app({ client: { clientId: "b", name: "Ändern" } }),
        ];

        const sorted = sortConnectedApps(apps, (entry) => entry.client.name, "de");

        expect(sorted.map((entry) => entry.client.clientId)).toEqual(["b", "a", "c"]);
        expect(apps.map((entry) => entry.client.clientId)).toEqual(["c", "a", "b"]);
    });

    it("sorts by the display name it is given", () => {
        const apps = [
            app({ client: { clientId: "x", name: "Zeta" } }),
            app({ client: { clientId: "y", name: "Alpha" } }),
        ];

        const sorted = sortConnectedApps(
            apps,
            (entry) => (entry.client.clientId === "x" ? "AAA" : entry.client.name),
            "en",
        );

        expect(sorted.map((entry) => entry.client.clientId)).toEqual(["x", "y"]);
    });
});
