import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { postWooCommerceBrokerComplete } from "@/features/oauth-client-broker/api/brokerCompleteHandler.ts";
import { postWooCommerceBrokerInitiate } from "@/features/oauth-client-broker/api/brokerInitiateHandler.ts";
import {
    WOOCOMMERCE_BROKER_COMPLETE_PATH,
    WOOCOMMERCE_BROKER_INITIATE_PATH,
} from "@/features/oauth-client-broker/lib/brokerUrls.ts";
import { Route as TransactionsRoute } from "@/routes/api.oauth.client_.redirect-broker.woocommerce_.transactions.ts";
import { Route as CompleteRoute } from "@/routes/api.oauth.client_.redirect-broker.woocommerce_.transactions_.complete.ts";

vi.mock("@/env.ts", () => ({ env: {} }));

// The WooCommerce extension (from 0.3.2) posts JSON with `Accept: application/json` to these
// paths. Without an exactly matching server route, TanStack Start answers with its HTML-only
// fallback (406 for JSON, an HTML 404 page otherwise) and no store can connect.
const PLUGIN_INITIATE_PATH = "/api/oauth/client/redirect-broker/woocommerce/transactions";
const PLUGIN_COMPLETE_PATH = "/api/oauth/client/redirect-broker/woocommerce/transactions/complete";

function serverHandlers(route: { options: unknown }) {
    return (route.options as { server?: { handlers?: Record<string, unknown> } }).server?.handlers;
}

describe("WooCommerce broker server routes", () => {
    it("serves initiation and completion at the paths the WooCommerce extension calls", () => {
        const routeTree = readFileSync(resolve(process.cwd(), "src/routeTree.gen.ts"), "utf8");

        expect(WOOCOMMERCE_BROKER_INITIATE_PATH).toBe(PLUGIN_INITIATE_PATH);
        expect(WOOCOMMERCE_BROKER_COMPLETE_PATH).toBe(PLUGIN_COMPLETE_PATH);
        expect(routeTree).toContain(`fullPath: '${PLUGIN_INITIATE_PATH}'`);
        expect(routeTree).toContain(`fullPath: '${PLUGIN_COMPLETE_PATH}'`);
        expect(routeTree).not.toContain("/api/oauth/broker/woocommerce/initiate");
        expect(routeTree).not.toContain("/api/oauth/broker/woocommerce/complete");
    });

    it("answers POST with the broker handlers", () => {
        expect(serverHandlers(TransactionsRoute)).toEqual({ POST: postWooCommerceBrokerInitiate });
        expect(serverHandlers(CompleteRoute)).toEqual({ POST: postWooCommerceBrokerComplete });
    });
});
