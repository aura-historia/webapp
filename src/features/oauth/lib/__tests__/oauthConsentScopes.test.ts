import { describe, expect, it } from "vitest";
import {
    getOAuthConsentScopes,
    getRequestedScopes,
} from "@/features/oauth/lib/oauthConsentScopes.ts";

describe("getRequestedScopes", () => {
    it("splits the scope parameter in request order and ignores repeated spaces", () => {
        expect(getRequestedScopes("watchlist:read  users:read offline_access")).toEqual([
            "watchlist:read",
            "users:read",
            "offline_access",
        ]);
        expect(getRequestedScopes(undefined)).toEqual([]);
    });
});

describe("getOAuthConsentScopes", () => {
    it("shows a registered client's scopes exactly as requested, offline_access included", () => {
        expect(
            getOAuthConsentScopes(["product-listings:write", "offline_access"], undefined),
        ).toEqual({
            requestedScopes: ["product-listings:write", "offline_access"],
            alreadyGrantedScopes: [],
            requestsOfflineAccess: false,
        });
    });

    it("turns offline_access into a note for a metadata document client", () => {
        expect(
            getOAuthConsentScopes(["users:read", "offline_access", "watchlist:read"], {
                grantedScopes: [],
            }),
        ).toEqual({
            requestedScopes: ["users:read", "watchlist:read"],
            alreadyGrantedScopes: [],
            requestsOfflineAccess: true,
        });
    });

    it("lists requested scopes already granted on their own, each requested scope once", () => {
        expect(
            getOAuthConsentScopes(["users:read", "watchlist:read", "watchlist:write"], {
                grantedScopes: ["notifications:read", "users:read", "watchlist:read"],
            }),
        ).toEqual({
            requestedScopes: ["watchlist:write"],
            alreadyGrantedScopes: ["users:read", "watchlist:read"],
            requestsOfflineAccess: false,
        });
    });

    it("keeps an all-granted repeat request in the granted list", () => {
        expect(
            getOAuthConsentScopes(["users:read"], { grantedScopes: ["users:read"] }),
        ).toMatchObject({ requestedScopes: [], alreadyGrantedScopes: ["users:read"] });
    });
});
