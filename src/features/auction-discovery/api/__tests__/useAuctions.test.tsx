import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuctionDirectoryFilters } from "@/data/internal/auction/Auction.ts";
import {
    auctionCatalogueQueryKey,
    buildCreateAuctionData,
    buildUpdateAuctionData,
    useAdminAuction,
    useAuctionCatalogue,
    useAuctionDirectory,
    useUpdateAdminAuction,
    type AuctionCreateValues,
    type AuctionMetadataValues,
} from "../useAuctions.ts";
import {
    auctionCreateSchema,
    auctionMetadataSchema,
    sourceAuctionIdSchema,
} from "../../lib/auctionForm.ts";

const auctionApi = vi.hoisted(() => ({
    listAuctions: vi.fn(),
    getAuctionCatalogue: vi.fn(),
    getAdminAuction: vi.fn(),
    updateAdminAuction: vi.fn(),
    getAuction: vi.fn(),
    adminSearchListingSources: vi.fn(),
    createAdminAuction: vi.fn(),
}));

vi.mock("@/client", () => auctionApi);
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@/features/authentication/hooks/useResolvedAuth.ts", () => ({
    useResolvedAuth: () => ({ user: null, isLoading: false }),
}));

describe("auction discovery queries", () => {
    let queryClient: QueryClient;
    const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);
    const directoryCursor = {
        created: "2026-10-08T13:20:00Z",
        auctionId: "auc_01",
        scope: {
            listingSourceId: "ls_01",
            format: "TIMED" as const,
            reportedStatus: "SCHEDULED" as const,
            timeRole: "LIVE_STARTS" as const,
            from: "2026-10-01T00:00:00Z",
            to: "2026-11-01T00:00:00Z",
        },
    };
    const catalogueCursor = {
        auctionId: "auc_01",
        cataloguePosition: null,
        productListingId: "plist_02",
    };

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
        auctionApi.listAuctions.mockResolvedValue({
            data: { items: [], pageSize: 21, searchAfter: directoryCursor },
            error: null,
        });
        auctionApi.getAuctionCatalogue.mockResolvedValue({
            data: { items: [], pageSize: 21, searchAfter: catalogueCursor },
            error: null,
        });
    });

    it("sends every directory filter and serializes the complete scoped cursor", async () => {
        const filters = {
            listingSourceId: "ls_01",
            format: "TIMED" as const,
            reportedStatus: "SCHEDULED" as const,
            timeRole: "LIVE_STARTS" as const,
            from: directoryCursor.scope.from,
            to: directoryCursor.scope.to,
        };
        auctionApi.listAuctions
            .mockResolvedValueOnce({
                data: { items: [], pageSize: 21, searchAfter: directoryCursor },
                error: null,
            })
            .mockResolvedValueOnce({ data: { items: [], pageSize: 21 }, error: null });

        const { result } = renderHook(() => useAuctionDirectory(filters), { wrapper });
        await waitFor(() => expect(result.current.data?.pages).toHaveLength(1));
        await act(async () => result.current.fetchNextPage());

        expect(auctionApi.listAuctions).toHaveBeenLastCalledWith(
            expect.objectContaining({
                query: {
                    ...filters,
                    pageSize: 21,
                    searchAfter: JSON.stringify(directoryCursor),
                },
            }),
        );
        await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
        await waitFor(() => expect(result.current.hasNextPage).toBe(false));
    });

    it("starts a separate directory result when filters change", async () => {
        const firstFilters: AuctionDirectoryFilters = { format: "TIMED" };
        const { result, rerender } = renderHook(({ filters }) => useAuctionDirectory(filters), {
            initialProps: { filters: firstFilters },
            wrapper,
        });
        await waitFor(() => expect(result.current.data?.pages).toHaveLength(1));

        rerender({ filters: { format: "LIVE" } });
        await waitFor(() => expect(auctionApi.listAuctions).toHaveBeenCalledTimes(2));
        await waitFor(() => expect(result.current.data?.pages).toHaveLength(1));
        expect(auctionApi.listAuctions).toHaveBeenLastCalledWith(
            expect.objectContaining({
                query: { format: "LIVE", pageSize: 21, searchAfter: undefined },
            }),
        );
    });

    it("keeps public authorization failures in public copy and hides API response details", async () => {
        auctionApi.listAuctions.mockResolvedValueOnce({
            data: null,
            error: { detail: "private backend diagnostic" },
            response: { status: 403 },
        });

        const { result } = renderHook(() => useAuctionDirectory(), { wrapper });
        await waitFor(() =>
            expect(result.current.error?.message).toBe("auctions.errors.requestFailed"),
        );
        expect(result.current.error?.message).not.toContain("private backend diagnostic");
    });

    it("serializes the entire catalogue cursor and keeps its null ordering value", async () => {
        auctionApi.getAuctionCatalogue
            .mockResolvedValueOnce({
                data: { items: [], pageSize: 21, searchAfter: catalogueCursor },
                error: null,
            })
            .mockResolvedValueOnce({ data: { items: [], pageSize: 21 }, error: null });

        const { result } = renderHook(() => useAuctionCatalogue("auc_01", "en", "EUR"), {
            wrapper,
        });
        await waitFor(() => expect(result.current.data?.pages).toHaveLength(1));
        await act(async () => result.current.fetchNextPage());

        expect(auctionApi.getAuctionCatalogue).toHaveBeenLastCalledWith(
            expect.objectContaining({
                path: { auctionId: "auc_01" },
                query: {
                    language: "en",
                    currency: "EUR",
                    pageSize: 21,
                    searchAfter: JSON.stringify(catalogueCursor),
                },
            }),
        );
        await waitFor(() => expect(result.current.hasNextPage).toBe(false));
    });

    it("partitions personalized catalogue pages by viewer and presentation", () => {
        const anonymous = auctionCatalogueQueryKey("auc_01", "en", "EUR");
        expect(anonymous).not.toEqual(auctionCatalogueQueryKey("auc_01", "en", "EUR", "user-1"));
        expect(auctionCatalogueQueryKey("auc_01", "en", "EUR", "user-1")).not.toEqual(
            auctionCatalogueQueryKey("auc_01", "en", "EUR", "user-2"),
        );
        expect(anonymous).not.toEqual(auctionCatalogueQueryKey("auc_01", "de", "EUR"));
        expect(anonymous).not.toEqual(auctionCatalogueQueryKey("auc_01", "en", "USD"));
    });

    it("associates a new auction with the selected source and validates values", () => {
        const values: AuctionCreateValues = {
            listingSourceId: "ls_authorized",
            sourceAuctionId: " Sale 01 ",
            name: " Autumn Sale ",
            nameLanguage: "ja",
            catalogueUrl: "https://catalogue.example/sale-01",
            format: "TIMED",
            reportedStatus: "SCHEDULED",
            reportedLotCount: "5",
            biddingOpens: "2026-10-10T12:00",
            liveStarts: "",
            lotsBeginClosing: "",
            scheduledEnd: "",
        };

        expect(auctionCreateSchema.safeParse(values).success).toBe(true);
        expect(buildCreateAuctionData(values)).toEqual({
            listingSourceId: "ls_authorized",
            sourceAuctionId: "Sale 01",
            name: { text: "Autumn Sale", language: "ja" },
            catalogueUrl: "https://catalogue.example/sale-01",
            format: "TIMED",
            schedule: { biddingOpens: "2026-10-10T12:00:00.000Z" },
            reportedStatus: "SCHEDULED",
            reportedLotCount: 5,
        });
        expect(sourceAuctionIdSchema.safeParse("   ").success).toBe(false);
        expect(sourceAuctionIdSchema.safeParse("💎".repeat(129)).success).toBe(false);
        expect(
            auctionMetadataSchema.safeParse({
                ...values,
                biddingOpens: "2026-02-31T12:00",
            }).success,
        ).toBe(false);
    });

    it("updates only mutable auction metadata and clears blank values explicitly", () => {
        const values: AuctionMetadataValues = {
            name: "",
            nameLanguage: "en",
            catalogueUrl: "",
            format: "",
            reportedStatus: "",
            reportedLotCount: "",
            biddingOpens: "",
            liveStarts: "",
            lotsBeginClosing: "",
            scheduledEnd: "",
        };

        expect(buildUpdateAuctionData(values, 7)).toEqual({
            expectedVersion: 7,
            name: null,
            catalogueUrl: null,
            format: null,
            schedule: {
                biddingOpens: null,
                liveStarts: null,
                lotsBeginClosing: null,
                scheduledEnd: null,
            },
            reportedStatus: null,
            reportedLotCount: null,
        });
    });

    it("refetches authoritative admin data after an expectedVersion conflict", async () => {
        const previous = adminAuction(4);
        const latest = adminAuction(5);
        auctionApi.getAdminAuction
            .mockResolvedValueOnce({ data: previous, error: null })
            .mockResolvedValue({ data: latest, error: null });
        auctionApi.updateAdminAuction.mockResolvedValue({
            data: null,
            error: { status: 409 },
            response: { status: 409 },
        });

        const { result } = renderHook(
            () => ({
                auction: useAdminAuction("auc_01"),
                update: useUpdateAdminAuction("auc_01"),
            }),
            { wrapper },
        );
        await waitFor(() => expect(result.current.auction.data?.expectedVersion).toBe(4));

        const values: AuctionMetadataValues = {
            name: "Sale",
            nameLanguage: "ja",
            catalogueUrl: "",
            format: "",
            reportedStatus: "",
            reportedLotCount: "",
            biddingOpens: "",
            liveStarts: "",
            lotsBeginClosing: "",
            scheduledEnd: "",
        };
        await act(async () => {
            await result.current.update
                .mutateAsync({ values, expectedVersion: 4 })
                .catch(() => undefined);
        });

        await waitFor(() => expect(result.current.auction.data?.expectedVersion).toBe(5));
        expect(auctionApi.getAdminAuction).toHaveBeenLastCalledWith(
            expect.objectContaining({
                path: { auctionId: "auc_01" },
                cache: "no-store",
            }),
        );
        expect(auctionApi.updateAdminAuction).toHaveBeenCalledWith(
            expect.objectContaining({
                path: { auctionId: "auc_01" },
                body: expect.objectContaining({ expectedVersion: 4 }),
                cache: "no-store",
            }),
        );
    });
});

function adminAuction(expectedVersion: number) {
    return {
        auctionId: "auc_01",
        listingSourceId: "ls_01",
        sourceAuctionId: "sale-2026",
        name: { text: "Sale", language: "ja" },
        catalogueUrl: null,
        format: null,
        schedule: {
            biddingOpens: null,
            liveStarts: null,
            lotsBeginClosing: null,
            scheduledEnd: null,
        },
        reportedStatus: null,
        reportedLotCount: null,
        expectedVersion,
        created: "2026-10-01T00:00:00Z",
        updated: "2026-10-02T00:00:00Z",
    };
}
