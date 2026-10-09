import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mapAdminAuction } from "@/data/internal/auction/AdminAuction.ts";
import {
    adminAuctionDetailQueryKey,
    buildCreateAuctionData,
    buildUpdateAuctionData,
    createAdminAuctionErrorFactory,
    mapAdminAuctionFormValues,
    mapListingSourceSelectionQuery,
    useAdminAuction,
    useAdminAuctionListingSources,
    useCreateAdminAuction,
    useUpdateAdminAuction,
    type AdminAuctionOperation,
    type AuctionCreateValues,
    type AuctionMetadataValues,
} from "../useAdminAuctions.ts";
import {
    auctionCreateSchema,
    auctionMetadataSchema,
    sourceAuctionIdSchema,
} from "../../lib/auctionForm.ts";

const auctionApi = vi.hoisted(() => ({
    getAdminAuction: vi.fn(),
    updateAdminAuction: vi.fn(),
    adminSearchListingSources: vi.fn(),
    createAdminAuction: vi.fn(),
}));

vi.mock("@/client", () => auctionApi);
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

const blankValues: AuctionMetadataValues = {
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

describe("admin auction queries", () => {
    let queryClient: QueryClient;
    const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
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
    });

    it("omits every blank optional value when creating an auction", () => {
        expect(
            buildCreateAuctionData({
                ...blankValues,
                listingSourceId: "ls_01",
                sourceAuctionId: "sale",
            }),
        ).toEqual({ listingSourceId: "ls_01", sourceAuctionId: "sale" });
    });

    it("rejects blank or oversized source keys and invalid metadata", () => {
        expect(sourceAuctionIdSchema.safeParse("   ").success).toBe(false);
        expect(sourceAuctionIdSchema.safeParse("💎".repeat(128)).success).toBe(true);
        expect(sourceAuctionIdSchema.safeParse("💎".repeat(129)).success).toBe(false);
        expect(
            auctionMetadataSchema.safeParse({ ...blankValues, biddingOpens: "2026-02-31T12:00" })
                .success,
        ).toBe(false);
        expect(
            auctionMetadataSchema.safeParse({ ...blankValues, catalogueUrl: "javascript:alert(1)" })
                .success,
        ).toBe(false);
        expect(
            auctionMetadataSchema.safeParse({ ...blankValues, reportedLotCount: "4294967296" })
                .success,
        ).toBe(false);
        expect(
            auctionMetadataSchema.safeParse({ ...blankValues, reportedLotCount: "1.5" }).success,
        ).toBe(false);
    });

    it("updates only mutable auction metadata and clears blank values explicitly", () => {
        expect(buildUpdateAuctionData(blankValues, 7)).toEqual({
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

    it("round-trips stored auction data through the edit form in UTC", () => {
        const auction = mapAdminAuction({
            ...adminAuction(2),
            catalogueUrl: "https://catalogue.example/sale",
            format: "LIVE",
            reportedStatus: "POSTPONED",
            reportedLotCount: 0,
            schedule: {
                biddingOpens: null,
                liveStarts: "2026-11-02T10:30:00Z",
                lotsBeginClosing: null,
                scheduledEnd: null,
            },
        });
        const values = mapAdminAuctionFormValues(auction);

        expect(values).toMatchObject({
            name: "Sale",
            nameLanguage: "ja",
            format: "LIVE",
            reportedStatus: "POSTPONED",
            reportedLotCount: "0",
            liveStarts: "2026-11-02T10:30",
            biddingOpens: "",
        });
        expect(buildUpdateAuctionData(values, 2)).toMatchObject({
            reportedLotCount: 0,
            schedule: { liveStarts: "2026-11-02T10:30:00.000Z", biddingOpens: null },
        });
        expect(mapAdminAuctionFormValues({ ...auction, name: null }, "de").nameLanguage).toBe("de");
    });

    it.each<[number | undefined, AdminAuctionOperation, string]>([
        [401, "read", "adminAuctions.errors.forbidden"],
        [403, "create", "adminAuctions.errors.forbidden"],
        [400, "read", "adminAuctions.errors.invalidId"],
        [400, "update", "adminAuctions.errors.invalid"],
        [404, "read", "adminAuctions.errors.missing"],
        [404, "create", "adminAuctions.errors.sourceMissing"],
        [409, "create", "adminAuctions.errors.duplicateSourceKey"],
        [409, "update", "adminAuctions.errors.staleVersion"],
        [503, "update", "adminAuctions.errors.requestFailed"],
        [undefined, "sourceSearch", "adminAuctions.errors.requestFailed"],
    ])("maps status %s on %s to localized copy", (status, operation, key) => {
        const error = createAdminAuctionErrorFactory(((k: string) => k) as never)(
            status,
            operation,
        );
        expect(error.message).toBe(key);
        expect(error.status).toBe(status ?? 500);
    });

    it("hides API response details from admin read errors", async () => {
        auctionApi.getAdminAuction.mockResolvedValueOnce({
            data: null,
            error: { detail: "private backend diagnostic" },
            response: { status: 404 },
        });

        const { result } = renderHook(() => useAdminAuction("auc_missing"), { wrapper });
        await waitFor(() =>
            expect(result.current.error?.message).toBe("adminAuctions.errors.missing"),
        );
        expect(result.current.error?.message).not.toContain("private backend diagnostic");
    });

    it("searches listing sources only once a query is entered, without caching", async () => {
        auctionApi.adminSearchListingSources.mockResolvedValue({
            data: { items: [], size: 21 },
            error: null,
        });
        const { result, rerender } = renderHook(
            ({ query }) => useAdminAuctionListingSources(query),
            { initialProps: { query: "  " }, wrapper },
        );
        expect(result.current.fetchStatus).toBe("idle");
        expect(auctionApi.adminSearchListingSources).not.toHaveBeenCalled();

        rerender({ query: " house " });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(auctionApi.adminSearchListingSources).toHaveBeenCalledWith(
            expect.objectContaining({
                query: expect.objectContaining({ query: "house" }),
                cache: "no-store",
            }),
        );
    });

    it("sends a pasted listing source ID as the exact ID filter", () => {
        expect(mapListingSourceSelectionQuery("ls_6rd827eqfefsva9teecmwa3ate")).toEqual({
            listingSourceId: "ls_6rd827eqfefsva9teecmwa3ate",
        });
        expect(mapListingSourceSelectionQuery("ls_partial")).toEqual({ query: "ls_partial" });
        expect(mapListingSourceSelectionQuery("Dorotheum")).toEqual({ query: "Dorotheum" });
    });

    it("caches the created auction for its detail page", async () => {
        auctionApi.createAdminAuction.mockResolvedValue({ data: adminAuction(1), error: null });
        const { result } = renderHook(() => useCreateAdminAuction(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync({
                ...blankValues,
                listingSourceId: "ls_01",
                sourceAuctionId: "sale-2026",
            });
        });

        expect(auctionApi.createAdminAuction).toHaveBeenCalledWith(
            expect.objectContaining({ cache: "no-store" }),
        );
        expect(queryClient.getQueryData(adminAuctionDetailQueryKey("auc_01"))).toMatchObject({
            auctionId: "auc_01",
            expectedVersion: 1,
        });
    });

    it("refetches authoritative admin data after an expectedVersion conflict", async () => {
        auctionApi.getAdminAuction
            .mockResolvedValueOnce({ data: adminAuction(4), error: null })
            .mockResolvedValue({ data: adminAuction(5), error: null });
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

        await act(async () => {
            await result.current.update
                .mutateAsync({ values: { ...blankValues, name: "Sale" }, expectedVersion: 4 })
                .catch(() => undefined);
        });

        await waitFor(() => expect(result.current.auction.data?.expectedVersion).toBe(5));
        expect(result.current.update.error?.message).toBe("adminAuctions.errors.staleVersion");
        expect(auctionApi.getAdminAuction).toHaveBeenLastCalledWith(
            expect.objectContaining({ path: { auctionId: "auc_01" }, cache: "no-store" }),
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
        name: { text: "Sale", language: "ja" as const },
        catalogueUrl: null as string | null,
        format: null as "LIVE" | "TIMED" | null,
        schedule: {
            biddingOpens: null as string | null,
            liveStarts: null as string | null,
            lotsBeginClosing: null as string | null,
            scheduledEnd: null as string | null,
        },
        reportedStatus: null as
            | "SCHEDULED"
            | "IN_PROGRESS"
            | "ENDED"
            | "POSTPONED"
            | "CANCELLED"
            | null,
        reportedLotCount: null as number | null,
        expectedVersion,
        created: "2026-10-01T00:00:00Z",
        updated: "2026-10-02T00:00:00Z",
    };
}
