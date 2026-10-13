import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminProductListingDetails } from "@/client";
import { clearViewerScopedQueries } from "@/features/authentication/lib/clearViewerScopedQueries.ts";
import { ADMIN_OVERVIEW_QUERY_KEY } from "@/features/admin/overview/api/useAdminOverview.ts";
import {
    ADMIN_PRODUCT_LISTING_LIST_QUERY_KEY,
    type AdminProductListingOperation,
    AdminProductListingRequestError,
    adminProductListingDetailQueryKey,
    adminProductListingErrorReason,
    createAdminProductListingErrorFactory,
    useAdminProductListing,
    useAdminProductListings,
    useRestoreAdminProductListing,
    useUpdateAdminProductListing,
    useWithdrawAdminProductListing,
} from "../useAdminProductListings.ts";

const api = vi.hoisted(() => ({
    searchAdminProductListings: vi.fn(),
    getAdminProductListing: vi.fn(),
    updateAdminProductListing: vi.fn(),
    withdrawAdminProductListing: vi.fn(),
    restoreAdminProductListing: vi.fn(),
}));

vi.mock("@/client", () => api);
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

const detailDto: AdminProductListingDetails = {
    productListingId: "pl_01",
    productListingTitleSlugId: "walnut-cabinet-pl01",
    source: { listingSourceId: "ls_01", name: "Galerie Nord", slugId: "galerie-nord" },
    sourceListingId: "SKU 0042",
    title: { text: "Walnut cabinet", language: "en" },
    price: { type: "MONETARY", amount: 125_050, currency: "EUR" },
    priceEstimateMin: null,
    priceEstimateMax: null,
    availability: "IN_STOCK",
    lifecycle: "ACTIVE",
    auctionId: null,
    expectedVersion: 7,
    created: "2026-09-01T10:00:00Z",
    updated: "2026-10-01T12:30:00Z",
    description: null,
    url: "https://galerie.example/items/42",
    images: [],
    auction: null,
    saleObservation: null,
};

function ok<T>(data: T, status = 200) {
    return { data, error: undefined, response: { status } };
}

function failure(status: number, error: string, detail = "private diagnostic") {
    return { data: undefined, error: { status, error, detail }, response: { status } };
}

const lostResponse = {
    data: undefined,
    error: new TypeError("Failed to fetch"),
    response: undefined,
};

describe("admin product listing requests", () => {
    let queryClient: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
    });

    it.each<[number | undefined, AdminProductListingOperation, string | undefined, string]>([
        [401, "read", undefined, "forbidden"],
        [403, "update", "FORBIDDEN", "forbidden"],
        [400, "read", "INVALID_OBJECT_ID", "invalidId"],
        [400, "search", "BAD_QUERY_PARAMETER_VALUE", "invalidSearch"],
        [400, "withdraw", "BAD_QUERY_PARAMETER_VALUE", "invalid"],
        [404, "read", "PRODUCT_LISTING_NOT_FOUND", "missing"],
        [404, "update", "AUCTION_NOT_FOUND", "auctionMissing"],
        [404, "restore", "PRODUCT_LISTING_NOT_FOUND", "missing"],
        [409, "update", "PRODUCT_LISTING_CONCURRENCY_CONFLICT", "versionConflict"],
        [409, "update", "PRODUCT_LISTING_WITHDRAWN", "withdrawn"],
        [409, "update", "CONFLICT", "auctionSourceMismatch"],
        [409, "withdraw", "PRODUCT_LISTING_CONCURRENCY_CONFLICT", "versionConflict"],
        [503, "search", "PRODUCT_LISTING_TEMPORARILY_UNAVAILABLE", "unavailable"],
        [503, "update", "PRODUCT_LISTING_TEMPORARILY_UNAVAILABLE", "indefinite"],
        [undefined, "restore", undefined, "indefinite"],
        [undefined, "read", undefined, "requestFailed"],
        [500, "read", "PRODUCT_LISTING_INTERNAL_ERROR", "requestFailed"],
    ])("maps status %s on %s (%s) to %s", (status, operation, code, reason) => {
        expect(adminProductListingErrorReason(status, operation, code)).toBe(reason);
        const error = createAdminProductListingErrorFactory(((key: string) => key) as never)(
            status,
            operation,
            code && { error: code, detail: "private diagnostic" },
        );
        expect(error.message).toBe(`adminProductListings.errors.${reason}`);
    });

    it("hides API response details from read errors", async () => {
        api.getAdminProductListing.mockResolvedValue(failure(404, "PRODUCT_LISTING_NOT_FOUND"));

        const { result } = renderHook(() => useAdminProductListing("pl_missing"), { wrapper });

        await waitFor(() =>
            expect(result.current.error).toBeInstanceOf(AdminProductListingRequestError),
        );
        expect(result.current.error?.message).toBe("adminProductListings.errors.missing");
        expect(api.getAdminProductListing).toHaveBeenCalledWith(
            expect.objectContaining({
                path: { productListingId: "pl_missing" },
                cache: "no-store",
            }),
        );
    });

    it("pages with the returned cursor verbatim and starts a changed scope without one", async () => {
        api.searchAdminProductListings
            .mockResolvedValueOnce(ok({ items: [detailDto], size: 1, searchAfter: "cursor+/=1" }))
            .mockResolvedValueOnce(
                ok({ items: [{ ...detailDto, productListingId: "pl_02" }], size: 1 }),
            )
            .mockResolvedValueOnce(ok({ items: [], size: 0 }));
        const { result, rerender } = renderHook(({ filters }) => useAdminProductListings(filters), {
            wrapper,
            initialProps: { filters: { lifecycle: "WITHDRAWN" as const } },
        });

        await waitFor(() => expect(result.current.hasNextPage).toBe(true));
        expect(api.searchAdminProductListings).toHaveBeenLastCalledWith(
            expect.objectContaining({
                query: { lifecycle: "WITHDRAWN", size: 25 },
                cache: "no-store",
                signal: expect.any(AbortSignal),
            }),
        );

        await act(async () => {
            await result.current.fetchNextPage();
        });
        expect(api.searchAdminProductListings).toHaveBeenLastCalledWith(
            expect.objectContaining({
                query: { lifecycle: "WITHDRAWN", size: 25, searchAfter: "cursor+/=1" },
            }),
        );
        await waitFor(() => expect(result.current.hasNextPage).toBe(false));
        expect(result.current.data?.pages.flatMap((page) => page.items)).toHaveLength(2);

        rerender({ filters: { lifecycle: "WITHDRAWN", sort: "created", order: "asc" } as never });
        await waitFor(() => expect(api.searchAdminProductListings).toHaveBeenCalledTimes(3));
        expect(api.searchAdminProductListings).toHaveBeenLastCalledWith(
            expect.objectContaining({
                query: { lifecycle: "WITHDRAWN", sort: "created", order: "asc", size: 25 },
            }),
        );
    });

    it("submits the loaded version with only the patch and refreshes admin views", async () => {
        api.getAdminProductListing.mockResolvedValue(ok({ ...detailDto, expectedVersion: 8 }));
        api.updateAdminProductListing.mockResolvedValue(
            ok({ productListingId: "pl_01", expectedVersion: 8, outcome: "CHANGED" }),
        );
        const invalidate = vi.spyOn(queryClient, "invalidateQueries");
        const { result } = renderHook(() => useUpdateAdminProductListing("pl_01"), { wrapper });

        let outcome: unknown;
        await act(async () => {
            outcome = await result.current.mutateAsync({
                patch: { availability: null, images: [] },
                expectedVersion: 7,
            });
        });

        expect(outcome).toEqual({
            productListingId: "pl_01",
            expectedVersion: 8,
            outcome: "CHANGED",
        });
        expect(api.updateAdminProductListing).toHaveBeenCalledWith({
            path: { productListingId: "pl_01" },
            body: { expectedVersion: 7, availability: null, images: [] },
            cache: "no-store",
        });
        expect(invalidate).toHaveBeenCalledWith({
            queryKey: adminProductListingDetailQueryKey("pl_01"),
            exact: true,
        });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ADMIN_PRODUCT_LISTING_LIST_QUERY_KEY });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ADMIN_OVERVIEW_QUERY_KEY });
    });

    it.each([
        [
            "a version conflict",
            failure(409, "PRODUCT_LISTING_CONCURRENCY_CONFLICT"),
            "versionConflict",
        ],
        ["a withdrawn listing", failure(409, "PRODUCT_LISTING_WITHDRAWN"), "withdrawn"],
        ["a lost response", lostResponse, "indefinite"],
    ])("refetches the listing after %s without resubmitting", async (_label, response, reason) => {
        api.getAdminProductListing
            .mockResolvedValueOnce(ok(detailDto))
            .mockResolvedValueOnce(ok({ ...detailDto, expectedVersion: 9 }));
        api.updateAdminProductListing.mockResolvedValue(response);
        const detail = renderHook(() => useAdminProductListing("pl_01"), { wrapper });
        await waitFor(() => expect(detail.result.current.data?.expectedVersion).toBe(7));
        const { result } = renderHook(() => useUpdateAdminProductListing("pl_01"), { wrapper });

        let rejection: unknown;
        let versionWhenSettled: number | undefined;
        await act(async () => {
            rejection = await result.current
                .mutateAsync({ patch: { url: "https://galerie.example/new" }, expectedVersion: 7 })
                .catch((error: unknown) => {
                    versionWhenSettled = queryClient.getQueryData<{ expectedVersion: number }>(
                        adminProductListingDetailQueryKey("pl_01"),
                    )?.expectedVersion;
                    return error;
                });
        });

        expect(rejection).toMatchObject({ reason });
        expect((rejection as Error).message).not.toContain("private diagnostic");
        // The refetch completes before the mutation settles, so no command can start from stale data.
        expect(versionWhenSettled).toBe(9);
        expect(api.updateAdminProductListing).toHaveBeenCalledTimes(1);
    });

    it("does not refetch for a cross-source auction reference", async () => {
        api.updateAdminProductListing.mockResolvedValue(failure(409, "CONFLICT"));
        const invalidate = vi.spyOn(queryClient, "invalidateQueries");
        const { result } = renderHook(() => useUpdateAdminProductListing("pl_01"), { wrapper });

        let rejection: unknown;
        await act(async () => {
            rejection = await result.current
                .mutateAsync({ patch: { auction: { auctionId: "auc_other" } }, expectedVersion: 7 })
                .catch((error: unknown) => error);
        });

        expect(rejection).toMatchObject({ reason: "auctionSourceMismatch" });
        expect(invalidate).not.toHaveBeenCalled();
    });

    it("withdraws with the version in the query and restores with it in the body", async () => {
        api.getAdminProductListing.mockResolvedValue(ok(detailDto));
        api.withdrawAdminProductListing.mockResolvedValue(ok({}, 204));
        api.restoreAdminProductListing.mockResolvedValue(
            ok({ productListingId: "pl_01", expectedVersion: 9, outcome: "UNCHANGED" }),
        );
        const withdraw = renderHook(() => useWithdrawAdminProductListing("pl_01"), { wrapper });
        const restore = renderHook(() => useRestoreAdminProductListing("pl_01"), { wrapper });

        await act(async () => {
            await withdraw.result.current.mutateAsync({ expectedVersion: 7 });
        });
        let restored: unknown;
        await act(async () => {
            restored = await restore.result.current.mutateAsync({ expectedVersion: 8 });
        });

        expect(api.withdrawAdminProductListing).toHaveBeenCalledWith({
            path: { productListingId: "pl_01" },
            query: { expectedVersion: 7 },
            cache: "no-store",
        });
        expect(api.restoreAdminProductListing).toHaveBeenCalledWith({
            path: { productListingId: "pl_01" },
            body: { expectedVersion: 8 },
            cache: "no-store",
        });
        expect(restored).toMatchObject({ outcome: "UNCHANGED", expectedVersion: 9 });
    });

    it("surfaces a withdrawal conflict instead of retrying with a newer version", async () => {
        api.getAdminProductListing.mockResolvedValue(ok({ ...detailDto, expectedVersion: 9 }));
        api.withdrawAdminProductListing.mockResolvedValue(
            failure(409, "PRODUCT_LISTING_CONCURRENCY_CONFLICT"),
        );
        const { result } = renderHook(() => useWithdrawAdminProductListing("pl_01"), { wrapper });

        let rejection: unknown;
        await act(async () => {
            rejection = await result.current
                .mutateAsync({ expectedVersion: 7 })
                .catch((error: unknown) => error);
        });

        expect(rejection).toMatchObject({ reason: "versionConflict", status: 409 });
        expect(api.withdrawAdminProductListing).toHaveBeenCalledTimes(1);
    });

    it("aborts protected reads and drops cached listings when the viewer changes", async () => {
        api.getAdminProductListing.mockImplementation(
            ({ signal }: { signal: AbortSignal }) =>
                new Promise((_resolve, reject) => {
                    signal.addEventListener("abort", () => reject(new Error("aborted")), {
                        once: true,
                    });
                }),
        );
        const hook = renderHook(() => useAdminProductListing("pl_01"), { wrapper });
        await waitFor(() => expect(api.getAdminProductListing).toHaveBeenCalled());
        const signal: AbortSignal = api.getAdminProductListing.mock.calls[0]?.[0].signal;

        await act(async () => {
            clearViewerScopedQueries(queryClient);
        });

        expect(signal.aborted).toBe(true);
        expect(
            queryClient.getQueryData(adminProductListingDetailQueryKey("pl_01")),
        ).toBeUndefined();
        hook.unmount();

        api.getAdminProductListing.mockResolvedValue(ok(detailDto));
        const loaded = renderHook(() => useAdminProductListing("pl_01"), { wrapper });
        await waitFor(() => expect(loaded.result.current.data?.sourceListingId).toBe("SKU 0042"));
        loaded.unmount();
        // Admin reads are not retained once no view observes them.
        await waitFor(() =>
            expect(
                queryClient.getQueryData(adminProductListingDetailQueryKey("pl_01")),
            ).toBeUndefined(),
        );
    });
});
