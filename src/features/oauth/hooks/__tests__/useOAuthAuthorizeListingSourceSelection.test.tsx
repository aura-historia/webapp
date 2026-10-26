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

const requestChanges = [
    { client_id: "oc_other" },
    { redirect_uri: "https://client.example/other-callback" },
    { state: "changed" },
    { requires_listing_source_id: false },
    { code_challenge: "new-challenge" },
    { scope: "watchlist:read" },
    { response_type: "other" },
    { code_challenge_method: "plain" },
    { resource: "https://mcp.aura-historia.com/v1" },
] satisfies Partial<OAuthAuthorizeSearchParams>[];

describe("listing-source selection", () => {
    it("does not retain a selected source when access is revoked", () => {
        const { result, rerender } = renderHook(
            ({ listingSources }) =>
                useOAuthAuthorizeListingSourceSelection({
                    searchParams: params,
                    listingSources,
                    hasMoreListingSources: false,
                }),
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
                hasMoreListingSources: false,
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
                hasMoreListingSources: false,
            }),
        );
        expect(result.current.listingSourceId).toBe("ls_first");
        expect(result.current.shouldShowSelectedListingSource).toBe(true);
        expect(result.current.requiresListingSourceSelection).toBe(false);
    });

    it("asks for a choice when the single loaded source is not the last page", () => {
        const { result } = renderHook(() =>
            useOAuthAuthorizeListingSourceSelection({
                searchParams: params,
                listingSources: sources.slice(0, 1),
                hasMoreListingSources: true,
            }),
        );
        expect(result.current.listingSourceId).toBeUndefined();
        expect(result.current.shouldShowSelectedListingSource).toBe(false);
        expect(result.current.requiresListingSourceSelection).toBe(true);
    });

    it("selects a source from a later page and drops it when the pages restart", () => {
        const lastPageSource = { listingSourceId: "ls_last_page", name: "First" };
        const { result, rerender } = renderHook(
            ({ listingSources, hasMoreListingSources }) =>
                useOAuthAuthorizeListingSourceSelection({
                    searchParams: params,
                    listingSources,
                    hasMoreListingSources,
                }),
            { initialProps: { listingSources: sources, hasMoreListingSources: true } },
        );
        expect(result.current.requiresListingSourceSelection).toBe(true);
        rerender({ listingSources: [...sources, lastPageSource], hasMoreListingSources: false });
        act(() => result.current.selectListingSource("ls_last_page"));
        expect(result.current.listingSourceId).toBe("ls_last_page");
        expect(result.current.effectiveListingSource).toBe(lastPageSource);

        // A grant refresh restarts from the first page; the unloaded choice is not submitted.
        rerender({ listingSources: sources, hasMoreListingSources: true });
        expect(result.current.listingSourceId).toBeUndefined();
    });

    it("uses a selected canonical source ID", () => {
        const { result } = renderHook(() =>
            useOAuthAuthorizeListingSourceSelection({
                searchParams: params,
                listingSources: sources,
                hasMoreListingSources: false,
            }),
        );
        act(() => result.current.selectListingSource("ls_second"));
        expect(result.current.listingSourceId).toBe("ls_second");
    });

    it.each(requestChanges)("clears manual selection when request fields change: %j", (change) => {
        for (const state of [params.state, undefined]) {
            const searchParams = { ...params, state };
            const { result, rerender, unmount } = renderHook(
                ({ searchParams }) =>
                    useOAuthAuthorizeListingSourceSelection({
                        searchParams,
                        listingSources: sources,
                        hasMoreListingSources: false,
                    }),
                { initialProps: { searchParams } },
            );
            act(() => result.current.selectListingSource("ls_second"));
            expect(result.current.listingSourceId).toBe("ls_second");
            rerender({ searchParams: { ...searchParams, ...change } });
            expect(result.current.listingSourceId).toBeUndefined();
            rerender({ searchParams });
            expect(result.current.listingSourceId).toBeUndefined();
            act(() => result.current.selectListingSource("ls_first"));
            expect(result.current.listingSourceId).toBe("ls_first");
            unmount();
        }
    });

    it("clears manual selection when the resource indicator changes to another resource", () => {
        const searchParams = { ...params, resource: "https://api.aura-historia.com" };
        const { result, rerender } = renderHook(
            ({ searchParams }) =>
                useOAuthAuthorizeListingSourceSelection({
                    searchParams,
                    listingSources: sources,
                    hasMoreListingSources: false,
                }),
            { initialProps: { searchParams } },
        );
        act(() => result.current.selectListingSource("ls_second"));
        rerender({
            searchParams: { ...searchParams, resource: "https://mcp.aura-historia.com/v1" },
        });
        expect(result.current.listingSourceId).toBeUndefined();
        rerender({ searchParams });
        expect(result.current.listingSourceId).toBeUndefined();
    });

    it("preserves manual selection when the normalized request is unchanged", () => {
        const { result, rerender } = renderHook(
            ({ searchParams }) =>
                useOAuthAuthorizeListingSourceSelection({
                    searchParams,
                    listingSources: sources,
                    hasMoreListingSources: false,
                }),
            { initialProps: { searchParams: params } },
        );
        act(() => result.current.selectListingSource("ls_second"));
        rerender({ searchParams: { ...params } });
        expect(result.current.listingSourceId).toBe("ls_second");
    });

    it("omits a cached single source when source selection is disabled", () => {
        const { result, rerender } = renderHook(
            ({ searchParams }) =>
                useOAuthAuthorizeListingSourceSelection({
                    searchParams,
                    listingSources: sources.slice(0, 1),
                    hasMoreListingSources: false,
                }),
            { initialProps: { searchParams: params } },
        );
        expect(result.current.listingSourceId).toBe("ls_first");
        rerender({ searchParams: { ...params, requires_listing_source_id: false } });
        expect(result.current.listingSourceId).toBeUndefined();
        expect(result.current.effectiveListingSource).toBeUndefined();
    });
});
