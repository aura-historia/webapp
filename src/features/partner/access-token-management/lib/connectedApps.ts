import type { ConnectedApp } from "@/data/internal/access-tokens/OwnCredentials.ts";
import { env } from "@/env.ts";
import { getExpiryState, type AccessTokenExpiryState } from "./accessTokenExpiry.ts";

/** How a connected app is presented: an AI agent, the website's own browser agents, or an integration. */
export type ConnectedAppKind = "agent" | "browser" | "integration";

/** The metadata document the website's own WebMCP client publishes (#1245). */
export const WEBSITE_BROWSER_AGENTS_CLIENT_PATH = "/oauth/webmcp-client.json";

/**
 * Whether a client is the website's own browser-agent client. Its document names itself in
 * English, so the dashboard shows a translated label instead.
 */
export function isWebsiteBrowserAgentsClient(clientId: string): boolean {
    return clientId === new URL(WEBSITE_BROWSER_AGENTS_CLIENT_PATH, env.VITE_APP_URL).href;
}

export function getConnectedAppKind(app: ConnectedApp): ConnectedAppKind {
    if (app.client.kind === "registered") return "integration";
    return isWebsiteBrowserAgentsClient(app.client.clientId) ? "browser" : "agent";
}

export type ConnectedAppExpiry = {
    readonly state: AccessTokenExpiryState;
    /** The latest expiry of the app's tokens; null when one never expires. */
    readonly expiresAt: Date | null;
};

/**
 * When a registered client's access ends: never while one of its tokens does not expire, else at
 * its latest token's expiry. Agents' rotating tokens are not listed, so they have none.
 */
export function getConnectedAppExpiry(
    app: ConnectedApp,
    now: number | null,
): ConnectedAppExpiry | null {
    if (app.tokens.length === 0) return null;
    let latest: Date | null = null;
    for (const token of app.tokens) {
        if (token.expiresAt === null) return { state: "none", expiresAt: null };
        if (latest === null || token.expiresAt > latest) latest = token.expiresAt;
    }
    return { state: getExpiryState(latest, now), expiresAt: latest };
}

/** Connected apps by their shown name. */
export function sortConnectedApps(
    apps: readonly ConnectedApp[],
    displayName: (app: ConnectedApp) => string,
    locale: string,
): ConnectedApp[] {
    return [...apps].sort((first, second) =>
        displayName(first).localeCompare(displayName(second), locale),
    );
}
