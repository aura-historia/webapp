import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type ParseError, parse } from "jsonc-parser";
import { describe, expect, it, vi } from "vitest";
import { OAUTH_CLIENT_ID_PATTERN } from "@/features/oauth-client-broker/server/brokerConfig.ts";
import {
    BROKER_RATE_LIMITER_BINDING,
    BROKER_TRANSACTIONS_EXPORT,
} from "@/features/oauth-client-broker/server/brokerBindings.ts";

vi.mock("@/env.ts", () => ({
    env: {},
}));

// The registered WooCommerce OAuth client; recreating it breaks every connected store.
const REGISTERED_CLIENT_ID = "oc_01m5vyvraxecksre2zepjcza88";

interface WorkerConfig {
    readonly main?: string;
    readonly compatibility_flags?: string[];
    readonly vars?: Record<string, string>;
    readonly durable_objects?: { bindings?: Array<{ name: string; class_name: string }> };
    readonly migrations?: unknown[];
    readonly exports?: Record<string, { type: string; storage?: string }>;
    readonly ratelimits?: Array<{ name: string; simple: { limit: number; period: number } }>;
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

    it("declares the transaction store as a SQLite-backed export the Worker entry provides", () => {
        const workerEntry = readFileSync(resolve(process.cwd(), "src/worker.ts"), "utf8");

        expect(wranglerConfig.main).toBe("./src/worker.ts");
        expect(workerEntry).toContain(`export { ${BROKER_TRANSACTIONS_EXPORT} }`);
        expect(wranglerConfig.exports?.[BROKER_TRANSACTIONS_EXPORT]).toEqual({
            type: "durable-object",
            storage: "sqlite",
        });
        // Version uploads (releases, branch builds) refuse pending migrations and bindings to a
        // class not yet provisioned, so the namespace is reached through the Worker's exports.
        expect(wranglerConfig.migrations ?? []).toEqual([]);
        expect(wranglerConfig.durable_objects?.bindings ?? []).toEqual([]);
        expect(wranglerConfig.compatibility_flags).toContain("enable_ctx_exports");
    });

    it("configures the initiation and completion rate limiter", () => {
        expect(
            wranglerConfig.ratelimits?.find((entry) => entry.name === BROKER_RATE_LIMITER_BINDING)
                ?.simple,
        ).toEqual({ limit: 30, period: 60 });
    });
});
