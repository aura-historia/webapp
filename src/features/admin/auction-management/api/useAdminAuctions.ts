import {
    infiniteQueryOptions,
    queryOptions,
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import {
    adminSearchListingSources,
    createAdminAuction,
    getAdminAuction,
    updateAdminAuction,
    type CreateAuctionData,
    type LanguageData,
    type UpdateAuctionData,
} from "@/client";
import {
    ADMIN_LISTING_SOURCE_PAGE_SIZE,
    mapToAdminListingSourcePage,
} from "@/data/internal/listing-source/AdminListingSource.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { mapAdminAuction, type AdminAuction } from "@/data/internal/auction/AdminAuction.ts";

export const ADMIN_AUCTIONS_QUERY_KEY = ["admin", "auctions"] as const;
export const adminAuctionDetailQueryKey = (auctionId: string) =>
    [...ADMIN_AUCTIONS_QUERY_KEY, "detail", auctionId] as const;

export type AdminAuctionOperation = "read" | "sourceSearch" | "create" | "update";

export class AdminAuctionRequestError extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly operation: AdminAuctionOperation,
    ) {
        super(message);
        this.name = "AdminAuctionRequestError";
    }
}

type AdminAuctionErrorFactory = (
    status: number | undefined,
    operation: AdminAuctionOperation,
) => AdminAuctionRequestError;

function errorKey(status: number, operation: AdminAuctionOperation): string {
    if (status === 401 || status === 403) return "adminAuctions.errors.forbidden";
    if (status === 404) {
        return operation === "create"
            ? "adminAuctions.errors.sourceMissing"
            : "adminAuctions.errors.missing";
    }
    if (status === 409 && operation === "create") return "adminAuctions.errors.duplicateSourceKey";
    if (status === 409 && operation === "update") return "adminAuctions.errors.staleVersion";
    if (status === 400) {
        return operation === "read"
            ? "adminAuctions.errors.invalidId"
            : "adminAuctions.errors.invalid";
    }
    return "adminAuctions.errors.requestFailed";
}

export function createAdminAuctionErrorFactory(t: TFunction): AdminAuctionErrorFactory {
    return (status, operation) => {
        const safeStatus = status ?? 500;
        // API bodies can echo submitted identifiers and metadata. Only expose localized status copy.
        return new AdminAuctionRequestError(
            t(errorKey(safeStatus, operation)),
            safeStatus,
            operation,
        );
    };
}

function useAdminAuctionRequestError() {
    const { t } = useTranslation();
    return createAdminAuctionErrorFactory(t);
}

export function adminAuctionDetailQueryOptions(
    auctionId: string,
    requestError: AdminAuctionErrorFactory,
) {
    return queryOptions({
        queryKey: adminAuctionDetailQueryKey(auctionId),
        staleTime: 0,
        gcTime: 0,
        queryFn: async ({ signal }) => {
            const response = await getAdminAuction({
                path: { auctionId },
                signal,
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "read");
            }
            return mapAdminAuction(response.data);
        },
    });
}

export function useAdminAuction(auctionId: string) {
    return useQuery(adminAuctionDetailQueryOptions(auctionId, useAdminAuctionRequestError()));
}

export function adminAuctionListingSourceOptions(
    queryText: string,
    requestError: AdminAuctionErrorFactory,
) {
    return infiniteQueryOptions({
        queryKey: [...ADMIN_AUCTIONS_QUERY_KEY, "listing-source-selection", queryText] as const,
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (page: ReturnType<typeof mapToAdminListingSourcePage>) =>
            page.searchAfter,
        staleTime: 0,
        gcTime: 0,
        queryFn: async ({ pageParam, signal }) => {
            const response = await adminSearchListingSources({
                query: {
                    query: queryText,
                    size: ADMIN_LISTING_SOURCE_PAGE_SIZE,
                    searchAfter: pageParam,
                },
                signal,
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "sourceSearch");
            }
            return mapToAdminListingSourcePage(response.data);
        },
    });
}

export function useAdminAuctionListingSources(queryText: string) {
    const trimmed = queryText.trim();
    return useInfiniteQuery({
        ...adminAuctionListingSourceOptions(trimmed, useAdminAuctionRequestError()),
        enabled: trimmed.length > 0,
    });
}

export type AuctionMetadataValues = {
    readonly name: string;
    readonly nameLanguage: LanguageData;
    readonly catalogueUrl: string;
    readonly format: "" | "LIVE" | "TIMED";
    readonly reportedStatus: "" | "SCHEDULED" | "IN_PROGRESS" | "ENDED" | "POSTPONED" | "CANCELLED";
    readonly reportedLotCount: string;
    readonly biddingOpens: string;
    readonly liveStarts: string;
    readonly lotsBeginClosing: string;
    readonly scheduledEnd: string;
};

export type AuctionCreateValues = AuctionMetadataValues & {
    readonly listingSourceId: string;
    readonly sourceAuctionId: string;
};

export type AuctionUpdateValues = AuctionMetadataValues;

const SCHEDULE_ROLES = ["biddingOpens", "liveStarts", "lotsBeginClosing", "scheduledEnd"] as const;

function optionalName(name: string, language: LanguageData) {
    const text = name.trim();
    return text ? { text, language } : undefined;
}

function optionalUrl(value: string): string | undefined {
    return value.trim() || undefined;
}

function parseLotCount(value: string): number | undefined {
    const trimmed = value.trim();
    return trimmed ? Number(trimmed) : undefined;
}

/** Form values hold UTC `YYYY-MM-DDTHH:mm`; the API expects RFC3339 instants. */
function fromUtcInput(value: string): string | null {
    return value ? new Date(`${value}:00Z`).toISOString() : null;
}

function toUtcInput(value: Date | null): string {
    return value ? value.toISOString().slice(0, 16) : "";
}

export function buildCreateAuctionData(values: AuctionCreateValues): CreateAuctionData {
    const name = optionalName(values.name, values.nameLanguage);
    const catalogueUrl = optionalUrl(values.catalogueUrl);
    const reportedLotCount = parseLotCount(values.reportedLotCount);
    const schedule = Object.fromEntries(
        SCHEDULE_ROLES.flatMap((role) => {
            const instant = fromUtcInput(values[role]);
            return instant ? [[role, instant]] : [];
        }),
    );
    return {
        listingSourceId: values.listingSourceId,
        sourceAuctionId: values.sourceAuctionId.trim(),
        ...(name && { name }),
        ...(catalogueUrl && { catalogueUrl }),
        ...(values.format && { format: values.format }),
        ...(Object.keys(schedule).length > 0 && { schedule }),
        ...(values.reportedStatus && { reportedStatus: values.reportedStatus }),
        ...(reportedLotCount !== undefined && { reportedLotCount }),
    };
}

export function buildUpdateAuctionData(
    values: AuctionUpdateValues,
    expectedVersion: number,
): UpdateAuctionData {
    return {
        expectedVersion,
        name: optionalName(values.name, values.nameLanguage) ?? null,
        catalogueUrl: optionalUrl(values.catalogueUrl) ?? null,
        format: values.format || null,
        schedule: {
            biddingOpens: fromUtcInput(values.biddingOpens),
            liveStarts: fromUtcInput(values.liveStarts),
            lotsBeginClosing: fromUtcInput(values.lotsBeginClosing),
            scheduledEnd: fromUtcInput(values.scheduledEnd),
        },
        reportedStatus: values.reportedStatus || null,
        reportedLotCount: parseLotCount(values.reportedLotCount) ?? null,
    };
}

export function mapAdminAuctionFormValues(
    auction: AdminAuction,
    fallbackLanguage = "en",
): AuctionUpdateValues {
    return {
        name: auction.name?.text ?? "",
        nameLanguage: auction.name?.language ?? parseLanguage(fallbackLanguage),
        catalogueUrl: auction.catalogueUrl ?? "",
        format: auction.format ?? "",
        reportedStatus: auction.reportedStatus ?? "",
        reportedLotCount: auction.reportedLotCount === null ? "" : String(auction.reportedLotCount),
        biddingOpens: toUtcInput(auction.schedule.biddingOpens),
        liveStarts: toUtcInput(auction.schedule.liveStarts),
        lotsBeginClosing: toUtcInput(auction.schedule.lotsBeginClosing),
        scheduledEnd: toUtcInput(auction.schedule.scheduledEnd),
    };
}

export function useCreateAdminAuction() {
    const queryClient = useQueryClient();
    const requestError = useAdminAuctionRequestError();
    return useMutation({
        gcTime: 0,
        mutationFn: async (values: AuctionCreateValues) => {
            const response = await createAdminAuction({
                body: buildCreateAuctionData(values),
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "create");
            }
            return mapAdminAuction(response.data);
        },
        onSuccess: (auction) => {
            queryClient.setQueryData(adminAuctionDetailQueryKey(auction.auctionId), auction);
        },
    });
}

export function useUpdateAdminAuction(auctionId: string) {
    const queryClient = useQueryClient();
    const requestError = useAdminAuctionRequestError();
    return useMutation({
        gcTime: 0,
        mutationFn: async ({
            values,
            expectedVersion,
        }: {
            readonly values: AuctionUpdateValues;
            readonly expectedVersion: number;
        }) => {
            const response = await updateAdminAuction({
                path: { auctionId },
                body: buildUpdateAuctionData(values, expectedVersion),
                cache: "no-store",
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "update");
            }
            return mapAdminAuction(response.data);
        },
        onSuccess: (auction) => {
            queryClient.setQueryData(adminAuctionDetailQueryKey(auction.auctionId), auction);
        },
        onError: async (error) => {
            if (error instanceof AdminAuctionRequestError && error.status === 409) {
                // A stale version must never be retried against a cached admin record.
                await queryClient.invalidateQueries({
                    queryKey: adminAuctionDetailQueryKey(auctionId),
                    exact: true,
                });
            }
        },
    });
}
