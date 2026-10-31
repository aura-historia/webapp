import { describe, expect, it } from "vitest";
import { mapToOAuthBrokerConsent } from "@/data/internal/oauth/OAuthBrokerConsent.ts";

describe("mapToOAuthBrokerConsent", () => {
    it("maps a pending transaction's presentation fields", () => {
        expect(
            mapToOAuthBrokerConsent({
                status: "pending",
                transaction_id: "t",
                client_id: "oc_x",
                merchant_redirect_uri: "https://shop.example/wp-admin/admin.php?page=aura",
                recipient: "https://shop.example",
                scope: "product-listings:write listing-sources:write",
                resource: "https://api.aura-historia.com",
                expires_at: "2026-10-30T12:15:00.000Z",
            }),
        ).toEqual({
            status: "pending",
            transactionId: "t",
            clientId: "oc_x",
            merchantRedirectUri: "https://shop.example/wp-admin/admin.php?page=aura",
            recipient: "https://shop.example",
            scopes: ["product-listings:write", "listing-sources:write"],
            resource: "https://api.aura-historia.com",
        });
    });

    it.each([
        [{ status: "declined" }, "declined"],
        [{ status: "answered" }, "answered"],
        [{ status: "invalid" }, "invalid"],
        [{ status: "pending", transaction_id: "t" }, "invalid"],
        [null, "invalid"],
        ["pending", "invalid"],
    ])("maps %o to %s", (data, status) => {
        expect(mapToOAuthBrokerConsent(data)).toEqual({ status });
    });
});
