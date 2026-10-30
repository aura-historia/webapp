import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type ParseError, parse } from "jsonc-parser";
import { describe, expect, it, vi } from "vitest";
import { OAUTH_CLIENT_ID_PATTERN } from "@/features/oauth-client-broker/server/brokerConfig.ts";
import {
    BROKER_RATE_LIMITER_BINDING,
    BROKER_TRANSACTIONS_BINDING,
} from "@/features/oauth-client-broker/server/brokerBindings.ts";

vi.mock("@/env.ts", () => ({
    env: {},
}));

// The registered WooCommerce OAuth client; recreating it breaks every connected store.
const REGISTERED_CLIENT_ID = "oc_01m5vyvraxecksre2zepjcza88";

interface WorkerConfig {
    readonly main?: string;
    readonly vars?: Record<string, string>;
    readonly durable_objects?: { bindings?: Array<{ name: string; class_name: string }> };
    readonly migrations?: Array<{ tag: string; new_sqlite_classes?: string[] }>;
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

    it("binds the transaction store to a SQLite-backed class the Worker entry exports", () => {
        const binding = wranglerConfig.durable_objects?.bindings?.find(
            (entry) => entry.name === BROKER_TRANSACTIONS_BINDING,
        );
        const workerEntry = readFileSync(resolve(process.cwd(), "src/worker.ts"), "utf8");

        expect(wranglerConfig.main).toBe("./src/worker.ts");
        expect(binding?.class_name).toBe("WooCommerceOAuthBrokerTransaction");
        expect(workerEntry).toContain("export { WooCommerceOAuthBrokerTransaction }");
        expect(
            wranglerConfig.migrations?.some((migration) =>
                migration.new_sqlite_classes?.includes("WooCommerceOAuthBrokerTransaction"),
            ),
        ).toBe(true);
    });

    it("configures the initiation and completion rate limiter", () => {
        expect(
            wranglerConfig.ratelimits?.find((entry) => entry.name === BROKER_RATE_LIMITER_BINDING)
                ?.simple,
        ).toEqual({ limit: 30, period: 60 });
    });
});
