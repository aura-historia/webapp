import { describe, expect, it } from "vitest";
import {
    mapToCreateAccessTokenRequest,
    mapToUpdateAccessTokenRequest,
    type UpdateAccessTokenInput,
} from "./AccessTokenRequests.ts";
import { ACCESS_TOKEN_SCOPES, ACCESS_TOKEN_SCOPE_METADATA } from "./AccessTokenScope.ts";
import de from "@/i18n/locales/de/translation.json";
import en from "@/i18n/locales/en/translation.json";
import es from "@/i18n/locales/es/translation.json";
import fr from "@/i18n/locales/fr/translation.json";
import itLocale from "@/i18n/locales/it/translation.json";

describe("access-token wire contracts", () => {
    const id = "at_01jopaque-token-id";
    const expiresAt = new Date("2026-10-01T12:34:56.789Z");

    it("uses singular scope and expiresAt only on create", () => {
        expect(
            mapToCreateAccessTokenRequest({
                name: "Sync",
                scopes: [...ACCESS_TOKEN_SCOPES],
                expiresAt,
            }),
        ).toEqual({
            name: "Sync",
            scope: [...ACCESS_TOKEN_SCOPES],
            expiresAt: expiresAt.toISOString(),
        });
    });

    it("keeps empty create defaults unprivileged", () => {
        expect(mapToCreateAccessTokenRequest({ name: "Sync", scopes: [] })).toEqual({
            name: "Sync",
        });
    });

    it("uses plural scopes and expires only on patch", () => {
        expect(
            mapToUpdateAccessTokenRequest({
                id,
                name: "Sync",
                scopes: ["product-listings:write"],
                expiresAt,
            }),
        ).toEqual({
            accessTokenId: id,
            name: "Sync",
            scopes: ["product-listings:write"],
            expires: expiresAt.toISOString(),
        });
    });

    it("omits unchanged patch fields and preserves opaque IDs", () => {
        expect(mapToUpdateAccessTokenRequest({ id })).toEqual({ accessTokenId: id });
        expect(
            mapToUpdateAccessTokenRequest({
                id,
                name: "Renamed",
                scopes: undefined,
                expiresAt: undefined,
            }),
        ).toEqual({ accessTokenId: id, name: "Renamed" });
    });

    it("preserves explicit empty scope sets and null expiry", () => {
        expect(mapToUpdateAccessTokenRequest({ id, scopes: [], expiresAt: null })).toEqual({
            accessTokenId: id,
            scopes: [],
            expires: null,
        });
    });

    it.each([
        { name: null },
        { scopes: null },
        { scopes: ["shops:manage"] },
        { scopes: ["products:write"] },
    ])("rejects invalid patch grants or nullable fields: %j", (fields) => {
        expect(() =>
            mapToUpdateAccessTokenRequest({ id, ...fields } as unknown as UpdateAccessTokenInput),
        ).toThrow();
    });

    it("exports exactly the supported scopes with copy in all locales", () => {
        expect(ACCESS_TOKEN_SCOPES).toEqual([
            "product-listings:write",
            "users:read",
            "users:write",
            "access-tokens:read",
            "access-tokens:write",
            "search-filters:write",
            "watchlist:read",
            "watchlist:write",
        ]);
        for (const locale of [de, en, es, fr, itLocale]) {
            for (const scope of ACCESS_TOKEN_SCOPES) {
                const metadata = ACCESS_TOKEN_SCOPE_METADATA[scope];
                const label = metadata.label
                    .split(".")
                    .at(-1) as keyof typeof locale.partnerAccessTokens.scopes;
                expect(locale.partnerAccessTokens.scopes[label]).toBeTruthy();
                expect(locale.partnerAccessTokens.create.scopeDescriptions[label]).toBeTruthy();
            }
        }
    });
});
