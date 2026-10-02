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
    it("does not retain a selected source when access is revoked", () => {
        const { result, rerender } = renderHook(
            ({ listingSources }) =>
                useOAuthAuthorizeListingSourceSelection({ searchParams: params, listingSources }),
            { initialProps: { listingSources: sources } },
        );
        act(() => result.current.selectListingSource("ls_second"));
        expect(result.current.listingSourceId).toBe("ls_second");
        rerender({ listingSources: [] });
        expect(result.current.listingSourceId).toBeUndefined();
        expect(result.current.effectiveListingSource).toBeUndefined();
    });

    it("rejects a choice that is absent from the current grant list", () => {
        const { result } = renderHook(() =>
            useOAuthAuthorizeListingSourceSelection({
                searchParams: params,
                listingSources: sources,
            }),
        );
        act(() => result.current.selectListingSource("ls_ungranted"));
        expect(result.current.listingSourceId).toBeUndefined();
    });

    it("selects the single granted source", () => {
        const { result } = renderHook(() =>
            useOAuthAuthorizeListingSourceSelection({
                searchParams: params,
                listingSources: sources.slice(0, 1),
            }),
        );
        expect(result.current.listingSourceId).toBe("ls_first");
    });

    it("uses a selected canonical source ID", () => {
        const { result } = renderHook(() =>
            useOAuthAuthorizeListingSourceSelection({
                searchParams: params,
                listingSources: sources,
            }),
        );
        act(() => result.current.selectListingSource("ls_second"));
        expect(result.current.listingSourceId).toBe("ls_second");
    });

    it("clears manual selection when state changes", () => {
        const { result, rerender } = renderHook(
            ({ searchParams }) =>
                useOAuthAuthorizeListingSourceSelection({ searchParams, listingSources: sources }),
            { initialProps: { searchParams: params } },
        );
        act(() => result.current.selectListingSource("ls_second"));
        rerender({ searchParams: { ...params, state: "changed" } });
        expect(result.current.listingSourceId).toBeUndefined();
        rerender({ searchParams: params });
        expect(result.current.listingSourceId).toBeUndefined();
        act(() => result.current.selectListingSource("ls_first"));
        expect(result.current.listingSourceId).toBe("ls_first");
    });
});
