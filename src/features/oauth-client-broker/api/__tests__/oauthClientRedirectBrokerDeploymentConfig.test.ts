import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type ParseError, parse } from "jsonc-parser";
import { describe, expect, it, vi } from "vitest";
import { OAUTH_CLIENT_ID_PATTERN } from "../oauthClientRedirectBrokerHandler.ts";

vi.mock("@/env.ts", () => ({
    env: {},
}));

// The registered WooCommerce OAuth client; recreating it breaks every connected store.
const REGISTERED_CLIENT_ID = "oc_01m5vyvraxecksre2zepjcza88";

interface WorkerConfig {
    readonly vars?: Record<string, string>;
}

const wranglerConfigErrors: ParseError[] = [];
const wranglerConfig = parse(
    readFileSync(resolve(process.cwd(), "wrangler.jsonc"), "utf8"),
    wranglerConfigErrors,
    { allowTrailingComma: true },
) as WorkerConfig;

describe("WooCommerce OAuth broker deployment config", () => {
    it("parses wrangler.jsonc", () => {
        expect(wranglerConfigErrors).toEqual([]);
    });

    it("configures the registered client as a canonical OAuthClient ID", () => {
        const clientId = wranglerConfig.vars?.OAUTH_CLIENT_REDIRECT_BROKER_WOOCOMMERCE_CLIENT_ID;

        expect(clientId).toBe(REGISTERED_CLIENT_ID);
        expect(clientId).toMatch(OAUTH_CLIENT_ID_PATTERN);
    });
});
