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
    getAuction,
    getAuctionCatalogue,
    listAuctions,
    updateAdminAuction,
    type CreateAuctionData,
    type UpdateAuctionData,
} from "@/client";
import {
    ADMIN_LISTING_SOURCE_PAGE_SIZE,
    mapToAdminListingSourcePage,
} from "@/data/internal/listing-source/AdminListingSource.ts";
import { mapPersonalizedProductListingDetails } from "@/data/internal/product/ProductListing.ts";
import { mapToProductListingDetail } from "@/data/internal/product/ProductListingDetail.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import type { LanguageData } from "@/client";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import {
    mapAdminAuction,
    mapPublicAuction,
    mapPublicAuctionDirectory,
    serializeAuctionCursor,
    type AdminAuction,
    type AuctionCataloguePage,
    type AuctionDirectoryFilters,
    type AuctionOperation,
    type PublicAuctionDirectoryPage,
} from "@/data/internal/auction/Auction.ts";

export const PUBLIC_AUCTIONS_QUERY_KEY = ["auctions", "public"] as const;
export const AUCTION_CATALOGUES_QUERY_KEY = ["auctionCatalogues"] as const;
export const ADMIN_AUCTIONS_QUERY_KEY = ["admin", "auctions"] as const;
export const auctionDirectoryQueryKey = (filters: AuctionDirectoryFilters) =>
    [...PUBLIC_AUCTIONS_QUERY_KEY, "directory", filters] as const;
export const auctionDetailQueryKey = (auctionId: string) =>
    [...PUBLIC_AUCTIONS_QUERY_KEY, "detail", auctionId] as const;
export const auctionCatalogueQueryKey = (
    auctionId: string,
    language: string,
    currency: string,
    viewerCacheKey?: string,
) =>
    [
        ...AUCTION_CATALOGUES_QUERY_KEY,
        auctionId,
        language,
        currency,
        viewerCacheKey ?? "anonymous",
    ] as const;
export const adminAuctionDetailQueryKey = (auctionId: string) =>
    [...ADMIN_AUCTIONS_QUERY_KEY, "detail", auctionId] as const;

const AUCTION_DIRECTORY_PAGE_SIZE = 21;
const AUCTION_CATALOGUE_PAGE_SIZE = 21;

export class AuctionRequestError extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly operation: AuctionOperation,
    ) {
        super(message);
        this.name = "AuctionRequestError";
    }
}

type AuctionErrorFactory = (
    status: number | undefined,
    operation: AuctionOperation,
) => AuctionRequestError;

export function createAuctionErrorFactory(t: TFunction): AuctionErrorFactory {
    return (status, operation) => {
        const safeStatus = status ?? 500;
        const isPublicOperation =
            operation === "publicDirectory" ||
            operation === "publicDetail" ||
            operation === "catalogue";
        let key: string;
        if (safeStatus === 401 || safeStatus === 403) {
            key = isPublicOperation
                ? "auctions.errors.requestFailed"
                : "adminAuctions.errors.forbidden";
        } else if (safeStatus === 404) {
            key =
                operation === "publicDirectory"
                    ? "auctions.errors.requestFailed"
                    : isPublicOperation
                      ? "auctions.errors.missing"
                      : "adminAuctions.errors.missing";
        } else if (safeStatus === 409 && operation === "create") {
            key = "adminAuctions.errors.duplicateSourceKey";
        } else if (safeStatus === 409 && operation === "update") {
            key = "adminAuctions.errors.staleVersion";
        } else if (safeStatus === 400) {
            key = isPublicOperation
                ? "auctions.errors.invalidRequest"
                : "adminAuctions.errors.invalid";
        } else {
            key = isPublicOperation
                ? "auctions.errors.requestFailed"
                : "adminAuctions.errors.requestFailed";
        }
        // API bodies can echo submitted identifiers and metadata. Only expose localized status copy.
        return new AuctionRequestError(t(key), safeStatus, operation);
    };
}

function useAuctionRequestError() {
    const { t } = useTranslation();
    return createAuctionErrorFactory(t);
}

function mapDirectoryQuery(
    filters: AuctionDirectoryFilters,
    cursor: PublicAuctionDirectoryPage["searchAfter"],
) {
    return {
        ...(filters.listingSourceId && { listingSourceId: filters.listingSourceId }),
        ...(filters.format && { format: filters.format }),
        ...(filters.reportedStatus && { reportedStatus: filters.reportedStatus }),
        ...(filters.timeRole && { timeRole: filters.timeRole }),
        ...(filters.from && { from: filters.from }),
        ...(filters.to && { to: filters.to }),
        pageSize: AUCTION_DIRECTORY_PAGE_SIZE,
        searchAfter: serializeAuctionCursor(cursor),
    };
}

export function auctionDirectoryQueryOptions(
    filters: AuctionDirectoryFilters,
    requestError: AuctionErrorFactory,
) {
    return infiniteQueryOptions({
        queryKey: auctionDirectoryQueryKey(filters),
        initialPageParam: undefined as PublicAuctionDirectoryPage["searchAfter"],
        getNextPageParam: (page: PublicAuctionDirectoryPage) => page.searchAfter ?? undefined,
        staleTime: 60_000,
        queryFn: async ({ pageParam, signal }) => {
            const response = await listAuctions({
                query: mapDirectoryQuery(filters, pageParam),
                signal,
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "publicDirectory");
            }
            return mapPublicAuctionDirectory(response.data);
        },
    });
}

export function useAuctionDirectory(filters: AuctionDirectoryFilters = {}) {
    return useInfiniteQuery(auctionDirectoryQueryOptions(filters, useAuctionRequestError()));
}

export function auctionDetailQueryOptions(auctionId: string, requestError: AuctionErrorFactory) {
    return queryOptions({
        queryKey: auctionDetailQueryKey(auctionId),
        staleTime: 60_000,
        queryFn: async ({ signal }) => {
            const response = await getAuction({ path: { auctionId }, signal });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "publicDetail");
            }
            return mapPublicAuction(response.data);
        },
    });
}

export function useAuction(auctionId: string) {
    return useQuery(auctionDetailQueryOptions(auctionId, useAuctionRequestError()));
}

export function auctionCatalogueQueryOptions(
    auctionId: string,
    language: string,
    currency: string,
    requestError: AuctionErrorFactory,
    viewerCacheKey?: string,
) {
    return infiniteQueryOptions({
        queryKey: auctionCatalogueQueryKey(auctionId, language, currency, viewerCacheKey),
        initialPageParam: undefined as
            | {
                  readonly auctionId: string;
                  readonly cataloguePosition: number | null;
                  readonly productListingId: string;
              }
            | undefined,
        getNextPageParam: (page: AuctionCataloguePage<unknown>) => page.searchAfter ?? undefined,
        staleTime: 60_000,
        queryFn: async ({ pageParam, signal }) => {
            const response = await getAuctionCatalogue({
                path: { auctionId },
                query: {
                    language: parseLanguage(language),
                    currency,
                    pageSize: AUCTION_CATALOGUE_PAGE_SIZE,
                    searchAfter: serializeAuctionCursor(pageParam),
                },
                signal,
            });
            if (response.error || !response.data) {
                throw requestError(response.response?.status, "catalogue");
            }
            return {
                items: response.data.items.map((dto) => ({
                    product: mapPersonalizedProductListingDetails(dto, language),
                    detail: mapToProductListingDetail(dto, language),
                })),
                pageSize: response.data.pageSize,
                ...(Object.hasOwn(response.data, "searchAfter") && {
                    searchAfter: response.data.searchAfter,
                }),
            } satisfies AuctionCataloguePage<{
                readonly product: ReturnType<typeof mapPersonalizedProductListingDetails>;
                readonly detail: ReturnType<typeof mapToProductListingDetail>;
            }>;
        },
    });
}

export function useAuctionCatalogue(auctionId: string, language: string, currency: string) {
    const { user, isLoading } = useResolvedAuth();
    return useInfiniteQuery({
        ...auctionCatalogueQueryOptions(
            auctionId,
            language,
            currency,
            useAuctionRequestError(),
            user?.userId,
        ),
        enabled: !isLoading,
    });
}

export function adminAuctionDetailQueryOptions(
    auctionId: string,
    requestError: AuctionErrorFactory,
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
                throw requestError(response.response?.status, "adminRead");
            }
            return mapAdminAuction(response.data);
        },
    });
}

export function useAdminAuction(auctionId: string) {
    return useQuery(adminAuctionDetailQueryOptions(auctionId, useAuctionRequestError()));
}

export function adminAuctionListingSourceOptions(
    queryText: string,
    requestError: AuctionErrorFactory,
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
        ...adminAuctionListingSourceOptions(trimmed, useAuctionRequestError()),
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

function optionalSchedule(values: AuctionMetadataValues) {
    return {
        ...(values.biddingOpens && {
            biddingOpens: new Date(`${values.biddingOpens}:00Z`).toISOString(),
        }),
        ...(values.liveStarts && {
            liveStarts: new Date(`${values.liveStarts}:00Z`).toISOString(),
        }),
        ...(values.lotsBeginClosing && {
            lotsBeginClosing: new Date(`${values.lotsBeginClosing}:00Z`).toISOString(),
        }),
        ...(values.scheduledEnd && {
            scheduledEnd: new Date(`${values.scheduledEnd}:00Z`).toISOString(),
        }),
    };
}

export function buildCreateAuctionData(values: AuctionCreateValues): CreateAuctionData {
    const name = optionalName(values.name, values.nameLanguage);
    const reportedLotCount = parseLotCount(values.reportedLotCount);
    return {
        listingSourceId: values.listingSourceId,
        sourceAuctionId: values.sourceAuctionId.trim(),
        ...(name && { name }),
        ...(optionalUrl(values.catalogueUrl)
            ? { catalogueUrl: optionalUrl(values.catalogueUrl) }
            : {}),
        ...(values.format && { format: values.format }),
        ...(Object.keys(optionalSchedule(values)).length > 0
            ? { schedule: optionalSchedule(values) }
            : {}),
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
            biddingOpens: values.biddingOpens
                ? new Date(`${values.biddingOpens}:00Z`).toISOString()
                : null,
            liveStarts: values.liveStarts
                ? new Date(`${values.liveStarts}:00Z`).toISOString()
                : null,
            lotsBeginClosing: values.lotsBeginClosing
                ? new Date(`${values.lotsBeginClosing}:00Z`).toISOString()
                : null,
            scheduledEnd: values.scheduledEnd
                ? new Date(`${values.scheduledEnd}:00Z`).toISOString()
                : null,
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
        biddingOpens: auction.schedule.biddingOpens?.toISOString().slice(0, 16) ?? "",
        liveStarts: auction.schedule.liveStarts?.toISOString().slice(0, 16) ?? "",
        lotsBeginClosing: auction.schedule.lotsBeginClosing?.toISOString().slice(0, 16) ?? "",
        scheduledEnd: auction.schedule.scheduledEnd?.toISOString().slice(0, 16) ?? "",
    };
}

function useInvalidatePublicAuctions() {
    const queryClient = useQueryClient();
    return async (auctionId?: string) => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: PUBLIC_AUCTIONS_QUERY_KEY }),
            ...(auctionId
                ? [
                      queryClient.invalidateQueries({
                          queryKey: auctionDetailQueryKey(auctionId),
                      }),
                      queryClient.invalidateQueries({
                          queryKey: [...AUCTION_CATALOGUES_QUERY_KEY, auctionId],
                      }),
                  ]
                : []),
        ]);
    };
}

export function useCreateAdminAuction() {
    const queryClient = useQueryClient();
    const requestError = useAuctionRequestError();
    const invalidatePublic = useInvalidatePublicAuctions();
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
        onSuccess: async (auction) => {
            queryClient.setQueryData(adminAuctionDetailQueryKey(auction.auctionId), auction);
            await invalidatePublic(auction.auctionId);
        },
    });
}

export function useUpdateAdminAuction(auctionId: string) {
    const queryClient = useQueryClient();
    const requestError = useAuctionRequestError();
    const invalidatePublic = useInvalidatePublicAuctions();
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
        onSuccess: async (auction) => {
            queryClient.setQueryData(adminAuctionDetailQueryKey(auction.auctionId), auction);
            await invalidatePublic(auction.auctionId);
        },
        onError: async (error) => {
            if (error instanceof AuctionRequestError && error.status === 409) {
                // A stale version must never be retried against a cached admin record.
                await queryClient.invalidateQueries({
                    queryKey: adminAuctionDetailQueryKey(auctionId),
                    exact: true,
                });
            }
        },
    });
}
