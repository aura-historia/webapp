import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    type AdminChip,
    AdminActiveChips,
    AdminCell,
    AdminFilterPanel,
    AdminLedger,
    AdminLedgerRow,
    AdminLedgerSkeleton,
    AdminLoadMore,
    AdminPrimaryCell,
    AdminQuickSelect,
    AdminResultLine,
    AdminRowChevron,
    AdminSelectField,
    AdminSortSelect,
    AdminTextField,
    AdminToolbar,
} from "@/features/admin/common/components/AdminDirectory.tsx";
import { AdminPageHeader } from "@/features/admin/common/components/AdminPageHeader.tsx";
import { AdminStatePanel } from "@/features/admin/common/components/AdminStatePanel.tsx";
import { SECONDARY_PILL_CLASS } from "@/features/admin/common/lib/adminStyles.ts";
import type { AdminProductListingSummary } from "@/data/internal/product/AdminProductListing.ts";
import { LISTING_AVAILABILITY_TRANSLATION_KEYS } from "@/data/internal/product/ListingAvailability.ts";
import { formatDateTime } from "@/lib/utils.ts";
import { useAdminProductListings } from "../api/useAdminProductListings.ts";
import {
    lifecycleTone,
    useAvailabilityLabel,
    useSourcePriceLabel,
} from "../components/AdminProductListingPresentation.tsx";
import {
    ADMIN_PRODUCT_LISTING_AVAILABILITIES,
    ADMIN_PRODUCT_LISTING_LIFECYCLES,
    ADMIN_PRODUCT_LISTING_PAGE_SIZE,
    ADMIN_PRODUCT_LISTING_PAGE_SIZE_OPTIONS,
    ADMIN_PRODUCT_LISTING_SORT_FIELDS,
    type AdminProductListingAvailabilityFilter,
    type AdminProductListingFilters,
    type AdminProductListingLifecycleFilter,
    type AdminProductListingSortField,
    type AdminProductListingSortOrder,
    DEFAULT_ADMIN_PRODUCT_LISTING_SORT,
    isWithinFilterByteLimit,
} from "../lib/adminProductListingSearch.ts";

const LEDGER_COLUMNS =
    "minmax(0,2.4fr) minmax(0,1fr) minmax(0,1fr) minmax(0,0.8fr) minmax(0,0.9fr) 16px";
const DEFAULT_SORT_OPTION = `${DEFAULT_ADMIN_PRODUCT_LISTING_SORT.sort}:${DEFAULT_ADMIN_PRODUCT_LISTING_SORT.order}`;
const SORT_OPTIONS = ADMIN_PRODUCT_LISTING_SORT_FIELDS.flatMap((sort) => [
    `${sort}:desc`,
    `${sort}:asc`,
]);

export function AdminProductListingsPage({
    language,
    filters,
    onFiltersChange,
}: {
    readonly language: string;
    readonly filters: AdminProductListingFilters;
    readonly onFiltersChange: (filters: AdminProductListingFilters) => void;
}) {
    const { t } = useTranslation();
    // Clearing filters keeps the chosen order; it is not a filter.
    const clearFilters = () => onFiltersChange({ sort: filters.sort, order: filters.order });

    return (
        <>
            <AdminPageHeader title={t("adminNavigation.items.productListings")} />
            <AdminProductListingToolbar filters={filters} onFiltersChange={onFiltersChange} />
            <AdminProductListingResults
                language={language}
                filters={filters}
                onFiltersChange={onFiltersChange}
                onClearFilters={clearFilters}
            />
        </>
    );
}

function AdminProductListingToolbar({
    filters,
    onFiltersChange,
}: {
    readonly filters: AdminProductListingFilters;
    readonly onFiltersChange: (filters: AdminProductListingFilters) => void;
}) {
    const { t } = useTranslation();
    const availabilityLabel = useAvailabilityLabel();
    const [query, setQuery] = useState(filters.query ?? "");
    const [appliedQuery, setAppliedQuery] = useState(filters.query);
    // A changed URL (chip removed, back navigation) replaces the typed search text.
    if (filters.query !== appliedQuery) {
        setAppliedQuery(filters.query);
        setQuery(filters.query ?? "");
    }
    const update = (changes: Partial<AdminProductListingFilters>) =>
        onFiltersChange({ ...filters, ...changes });
    const chip = (key: string, label: string, value: string, remove: () => void): AdminChip => ({
        key,
        label: t("adminProductListings.filters.chip", { label, value }),
        onRemove: remove,
    });

    const chips: AdminChip[] = [
        filters.query &&
            chip("query", t("adminProductListings.filters.search"), filters.query, () =>
                update({ query: undefined }),
            ),
        filters.lifecycle &&
            chip(
                "lifecycle",
                t("adminProductListings.fields.lifecycle"),
                t(`adminProductListings.lifecycles.${filters.lifecycle}`),
                () => update({ lifecycle: undefined }),
            ),
        filters.availability &&
            chip(
                "availability",
                t("adminProductListings.fields.availability"),
                availabilityLabel(filters.availability),
                () => update({ availability: undefined }),
            ),
        filters.listingSourceId &&
            chip(
                "listingSource",
                t("adminProductListings.fields.sourceId"),
                filters.listingSourceId,
                () => update({ listingSourceId: undefined }),
            ),
        filters.sourceListingId &&
            chip(
                "sourceListingId",
                t("adminProductListings.fields.sourceListingId"),
                filters.sourceListingId,
                () => update({ sourceListingId: undefined }),
            ),
        filters.auctionId &&
            chip("auction", t("adminProductListings.fields.auctionId"), filters.auctionId, () =>
                update({ auctionId: undefined }),
            ),
        filters.size !== undefined &&
            chip("size", t("adminProductListings.filters.pageSize"), String(filters.size), () =>
                update({ size: undefined }),
            ),
    ].filter((entry): entry is AdminChip => Boolean(entry));

    const panelCount = [
        filters.listingSourceId,
        filters.sourceListingId,
        filters.auctionId,
        filters.size,
    ].filter((value) => value !== undefined).length;

    return (
        <AdminToolbar
            label={t("adminProductListings.filters.title")}
            search={{
                label: t("adminProductListings.filters.query"),
                value: query,
                onChange: setQuery,
                onSubmit: () => update({ query: query.trim() || undefined }),
            }}
            quickFilters={
                <>
                    <AdminQuickSelect
                        label={t("adminProductListings.fields.lifecycle")}
                        value={filters.lifecycle ?? ""}
                        allLabel={t("adminProductListings.filters.allLifecycles")}
                        options={ADMIN_PRODUCT_LISTING_LIFECYCLES.map((lifecycle) => ({
                            value: lifecycle,
                            label: t(`adminProductListings.lifecycles.${lifecycle}`),
                        }))}
                        onChange={(value) =>
                            update({
                                lifecycle:
                                    (value as AdminProductListingLifecycleFilter) || undefined,
                            })
                        }
                    />
                    <AdminQuickSelect
                        label={t("adminProductListings.fields.availability")}
                        value={filters.availability ?? ""}
                        options={ADMIN_PRODUCT_LISTING_AVAILABILITIES.map((availability) => ({
                            value: availability,
                            label: t(LISTING_AVAILABILITY_TRANSLATION_KEYS[availability]),
                        }))}
                        onChange={(value) =>
                            update({
                                availability:
                                    (value as AdminProductListingAvailabilityFilter) || undefined,
                            })
                        }
                    />
                </>
            }
            panelCount={panelCount}
            panel={
                <AdminProductListingFilterPanel
                    filters={filters}
                    onApply={(changes) => {
                        update(changes);
                    }}
                />
            }
            chips={
                <AdminActiveChips
                    chips={chips}
                    onClearAll={() => onFiltersChange({ sort: filters.sort, order: filters.order })}
                />
            }
        />
    );
}

type PanelValues = {
    readonly listingSourceId: string;
    readonly sourceListingId: string;
    readonly auctionId: string;
    readonly size: string;
};

const EMPTY_PANEL: PanelValues = {
    listingSourceId: "",
    sourceListingId: "",
    auctionId: "",
    size: String(ADMIN_PRODUCT_LISTING_PAGE_SIZE),
};

function AdminProductListingFilterPanel({
    filters,
    onApply,
}: {
    readonly filters: AdminProductListingFilters;
    readonly onApply: (changes: Partial<AdminProductListingFilters>) => void;
}) {
    const { t } = useTranslation();
    const [values, setValues] = useState<PanelValues>({
        listingSourceId: filters.listingSourceId ?? "",
        sourceListingId: filters.sourceListingId ?? "",
        auctionId: filters.auctionId ?? "",
        size: String(filters.size ?? ADMIN_PRODUCT_LISTING_PAGE_SIZE),
    });
    const [submitted, setSubmitted] = useState(false);
    const sourceListingIdTooLong = !isWithinFilterByteLimit(values.sourceListingId);
    const set = (key: keyof PanelValues) => (value: string) =>
        setValues((current) => ({ ...current, [key]: value }));

    const apply = () => {
        setSubmitted(true);
        if (sourceListingIdTooLong) return false;
        const size = Number(values.size);
        onApply({
            listingSourceId: values.listingSourceId.trim() || undefined,
            sourceListingId: values.sourceListingId.trim() || undefined,
            auctionId: values.auctionId.trim() || undefined,
            // The default page size is the API default, so it stays out of the URL and request.
            size: size === ADMIN_PRODUCT_LISTING_PAGE_SIZE ? undefined : size,
        });
    };

    return (
        <AdminFilterPanel
            onApply={apply}
            onReset={() => {
                setSubmitted(false);
                setValues(EMPTY_PANEL);
            }}
        >
            <AdminTextField
                label={t("adminProductListings.fields.sourceId")}
                value={values.listingSourceId}
                onChange={set("listingSourceId")}
                mono
            />
            <AdminTextField
                label={t("adminProductListings.fields.sourceListingId")}
                value={values.sourceListingId}
                onChange={set("sourceListingId")}
                error={
                    submitted && sourceListingIdTooLong
                        ? t("adminProductListings.validation.filterTooLong")
                        : undefined
                }
                mono
            />
            <AdminTextField
                label={t("adminProductListings.fields.auctionId")}
                value={values.auctionId}
                onChange={set("auctionId")}
                mono
            />
            <AdminSelectField
                label={t("adminProductListings.filters.pageSize")}
                value={values.size}
                onChange={set("size")}
                options={ADMIN_PRODUCT_LISTING_PAGE_SIZE_OPTIONS.map((size) => ({
                    value: String(size),
                    label: String(size),
                }))}
            />
        </AdminFilterPanel>
    );
}

function hasFilters(filters: AdminProductListingFilters): boolean {
    return [
        filters.query,
        filters.listingSourceId,
        filters.sourceListingId,
        filters.lifecycle,
        filters.availability,
        filters.auctionId,
    ].some((value) => value !== undefined);
}

function AdminProductListingResults({
    language,
    filters,
    onFiltersChange,
    onClearFilters,
}: {
    readonly language: string;
    readonly filters: AdminProductListingFilters;
    readonly onFiltersChange: (filters: AdminProductListingFilters) => void;
    readonly onClearFilters: () => void;
}) {
    const { t, i18n } = useTranslation();
    const listingsQuery = useAdminProductListings(filters);
    const listings = listingsQuery.data?.pages.flatMap((page) => page.items) ?? [];
    const sortValue =
        filters.sort && filters.order ? `${filters.sort}:${filters.order}` : DEFAULT_SORT_OPTION;

    if (listingsQuery.isPending) {
        return <AdminLedgerSkeleton label={t("adminProductListings.list.loading")} />;
    }
    if (listingsQuery.error && listings.length === 0) {
        return (
            <AdminStatePanel tone="error" title={t("adminProductListings.list.loadFailed")}>
                <button
                    type="button"
                    onClick={() => listingsQuery.refetch()}
                    className={SECONDARY_PILL_CLASS}
                >
                    {t("adminCommon.retry")}
                </button>
            </AdminStatePanel>
        );
    }
    if (listings.length === 0) {
        return hasFilters(filters) ? (
            <AdminStatePanel tone="empty" title={t("adminProductListings.list.noMatches")}>
                <button type="button" onClick={onClearFilters} className={SECONDARY_PILL_CLASS}>
                    {t("adminCommon.filters.clearSearch")}
                </button>
            </AdminStatePanel>
        ) : (
            <AdminStatePanel tone="empty" title={t("adminProductListings.list.none")} />
        );
    }

    return (
        <>
            <AdminResultLine
                summary={t("adminCommon.result.loaded", {
                    loaded: new Intl.NumberFormat(i18n.language).format(listings.length),
                })}
                sort={
                    <AdminSortSelect
                        value={sortValue}
                        options={SORT_OPTIONS.map((option) => ({
                            value: option,
                            label: t(`adminProductListings.sort.${option.replace(":", "_")}`),
                        }))}
                        onChange={(value) => {
                            const [sort, order] = value.split(":") as [
                                AdminProductListingSortField,
                                AdminProductListingSortOrder,
                            ];
                            // The default ordering is the API default and stays out of the URL.
                            onFiltersChange({
                                ...filters,
                                sort: value === DEFAULT_SORT_OPTION ? undefined : sort,
                                order: value === DEFAULT_SORT_OPTION ? undefined : order,
                            });
                        }}
                    />
                }
            />
            <AdminLedger
                label={t("adminNavigation.items.productListings")}
                columns={LEDGER_COLUMNS}
                headings={[
                    t("adminProductListings.columns.listing"),
                    t("adminProductListings.fields.sourceListingId"),
                    t("adminProductListings.fields.availability"),
                    t("adminProductListings.fields.price"),
                    t("adminProductListings.fields.updated"),
                ]}
            >
                {listings.map((listing) => (
                    <AdminProductListingRow
                        key={listing.productListingId}
                        listing={listing}
                        language={language}
                    />
                ))}
            </AdminLedger>
            <AdminLoadMore
                hasNextPage={listingsQuery.hasNextPage}
                isFetchingNextPage={listingsQuery.isFetchingNextPage}
                isError={listingsQuery.isFetchNextPageError}
                onLoadMore={() => listingsQuery.fetchNextPage()}
                label={t("adminProductListings.list.loadMore")}
                endLabel={t("adminProductListings.list.end")}
            />
        </>
    );
}

function AdminProductListingRow({
    listing,
    language,
}: {
    readonly listing: AdminProductListingSummary;
    readonly language: string;
}) {
    const { t, i18n } = useTranslation();
    const availabilityLabel = useAvailabilityLabel();
    const priceLabel = useSourcePriceLabel();
    const price = priceLabel(listing.price);
    return (
        <AdminLedgerRow asChild>
            <Link
                to="/$lng/admin/product-listings/$productListingId"
                params={{ lng: language, productListingId: listing.productListingId }}
                aria-label={t("adminProductListings.list.openLabel", {
                    label: listing.title?.text ?? listing.sourceListingId,
                })}
            >
                <AdminPrimaryCell
                    mark={lifecycleTone(listing.lifecycle)}
                    title={listing.title?.text ?? t("adminProductListings.list.noTitle")}
                    titleMuted={!listing.title}
                    sub={t("adminProductListings.list.sub", {
                        lifecycle: t(`adminProductListings.lifecycles.${listing.lifecycle}`),
                        source: listing.source.name,
                    })}
                />
                <AdminCell head={t("adminProductListings.fields.sourceListingId")}>
                    <code className="truncate font-mono text-xs text-ink-secondary">
                        {listing.sourceListingId}
                    </code>
                </AdminCell>
                <AdminCell head={t("adminProductListings.fields.availability")}>
                    <span className={listing.availability === null ? "text-ink-muted" : undefined}>
                        {availabilityLabel(listing.availability)}
                    </span>
                </AdminCell>
                <AdminCell head={t("adminProductListings.fields.price")}>
                    <span className={price ? "tabular-nums" : "text-ink-muted"}>
                        {price ?? t("adminCommon.none")}
                    </span>
                </AdminCell>
                <AdminCell head={t("adminProductListings.fields.updated")}>
                    <time dateTime={listing.updated.toISOString()} className="tabular-nums">
                        {formatDateTime(listing.updated, i18n.language, "UTC")}
                    </time>
                </AdminCell>
                <AdminRowChevron />
            </Link>
        </AdminLedgerRow>
    );
}
