import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useOAuthAuthorizeListingSourceSelection } from "../useOAuthAuthorizeListingSourceSelection.ts";
import type { OAuthAuthorizeSearchParams } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";

const params: OAuthAuthorizeSearchParams = {
    client_id: "oc_test",
    response_type: "code",
    redirect_uri: "https://client.example/callback",
    code_challenge: "challenge",
    code_challenge_method: "S256",
    scope: "product-listings:write",
    state: "csrf",
    requires_listing_source_id: true,
};
const sources = [
    { listingSourceId: "ls_first", name: "First" },
    { listingSourceId: "ls_second", name: "Second" },
];

describe("listing-source selection", () => {
    it("selects a single granted source, but emits no source when selection is disabled", () => {
        const { result, rerender } = renderHook(
            ({ required }) =>
                useOAuthAuthorizeListingSourceSelection({
                    searchParams: { ...params, requires_listing_source_id: required },
                    listingSources: sources.slice(0, 1),
                }),
            { initialProps: { required: true } },
        );
        expect(result.current.listingSourceId).toBe("ls_first");
        rerender({ required: false });
        expect(result.current.listingSourceId).toBeUndefined();
    });

    it("does not substitute another source when selected access is revoked", () => {
        const { result, rerender } = renderHook(
            ({ listingSources }) =>
                useOAuthAuthorizeListingSourceSelection({
                    searchParams: params,
                    listingSources,
                }),
            { initialProps: { listingSources: sources } },
        );
        act(() => result.current.selectListingSource("ls_second"));
        rerender({ listingSources: sources.slice(0, 1) });
        expect(result.current.listingSourceId).toBeUndefined();
        rerender({ listingSources: [] });
        expect(result.current.listingSourceId).toBeUndefined();
    });

    it("rejects a redirect hint outside current grants", () => {
        const { result } = renderHook(() =>
            useOAuthAuthorizeListingSourceSelection({
                searchParams: {
                    ...params,
                    redirect_uri: `${params.redirect_uri}?listing_source_id=ls_attacker`,
                },
                listingSources: sources.slice(0, 1),
            }),
        );
        expect(result.current.listingSourceId).toBeUndefined();
    });

    it.each(["scope", "code_challenge", "state"] as const)(
        "clears manual selection when %s changes",
        (field) => {
            const { result, rerender } = renderHook(
                ({ searchParams }) =>
                    useOAuthAuthorizeListingSourceSelection({
                        searchParams,
                        listingSources: sources,
                    }),
                { initialProps: { searchParams: params } },
            );
            act(() => result.current.selectListingSource("ls_second"));
            rerender({ searchParams: { ...params, [field]: "changed" } });
            expect(result.current.listingSourceId).toBeUndefined();
        },
    );
});
