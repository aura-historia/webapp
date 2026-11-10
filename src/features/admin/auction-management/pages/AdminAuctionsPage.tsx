import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { AuctionFormatData, AuctionReportedStatusData } from "@/client";
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
import { AdminStatusMark } from "@/features/admin/common/components/AdminStatusMark.tsx";
import {
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import type { AdminAuction } from "@/data/internal/auction/AdminAuction.ts";
import { formatDate } from "@/lib/utils.ts";
import { useAdminAuctions } from "../api/useAdminAuctions.ts";
import { AUCTION_STATUS_TONES } from "../components/AuctionStatus.ts";
import {
    ADMIN_AUCTION_FORMATS,
    ADMIN_AUCTION_PAGE_SIZE,
    ADMIN_AUCTION_PAGE_SIZE_OPTIONS,
    ADMIN_AUCTION_REPORTED_STATUSES,
    ADMIN_AUCTION_SORT_FIELDS,
    type AdminAuctionFilters,
    type AdminAuctionSortField,
    type AdminAuctionSortOrder,
    DEFAULT_ADMIN_AUCTION_SORT,
} from "../lib/adminAuctionSearch.ts";

const LEDGER_COLUMNS =
    "minmax(0,2.2fr) minmax(0,1.1fr) minmax(0,0.7fr) minmax(0,0.9fr) minmax(0,0.8fr) 16px";
const DEFAULT_SORT_OPTION = `${DEFAULT_ADMIN_AUCTION_SORT.sort}:${DEFAULT_ADMIN_AUCTION_SORT.order}`;
const SORT_OPTIONS = ADMIN_AUCTION_SORT_FIELDS.flatMap((sort) =>
    sort === "name" ? [`${sort}:asc`, `${sort}:desc`] : [`${sort}:desc`, `${sort}:asc`],
);

export function AdminAuctionsPage({
    language,
    filters,
    onFiltersChange,
}: {
    readonly language: string;
    readonly filters: AdminAuctionFilters;
    readonly onFiltersChange: (filters: AdminAuctionFilters) => void;
}) {
    const { t } = useTranslation();
    // Clearing filters keeps the chosen order; it is not a filter.
    const clearFilters = () => onFiltersChange({ sort: filters.sort, order: filters.order });

    return (
        <>
            <AdminPageHeader
                title={t("adminNavigation.items.auctions")}
                action={<CreateAuctionLink language={language} />}
            />
            <AdminAuctionToolbar
                filters={filters}
                onFiltersChange={onFiltersChange}
                onClearFilters={clearFilters}
            />
            <AdminAuctionResults
                language={language}
                filters={filters}
                onFiltersChange={onFiltersChange}
                onClearFilters={clearFilters}
            />
        </>
    );
}

function CreateAuctionLink({ language }: { readonly language: string }) {
    const { t } = useTranslation();
    return (
        <Link
            to="/$lng/admin/auctions/new"
            params={{ lng: language }}
            className={PRIMARY_PILL_CLASS}
        >
            <Plus aria-hidden="true" className="size-4" strokeWidth={1.8} />
            {t("adminAuctions.actions.create")}
        </Link>
    );
}

function AdminAuctionToolbar({
    filters,
    onFiltersChange,
    onClearFilters,
}: {
    readonly filters: AdminAuctionFilters;
    readonly onFiltersChange: (filters: AdminAuctionFilters) => void;
    readonly onClearFilters: () => void;
}) {
    const { t } = useTranslation();
    const [query, setQuery] = useState(filters.query ?? "");
    const [appliedQuery, setAppliedQuery] = useState(filters.query);
    // A changed URL (chip removed, back navigation) replaces the typed search text.
    if (filters.query !== appliedQuery) {
        setAppliedQuery(filters.query);
        setQuery(filters.query ?? "");
    }
    const update = (changes: Partial<AdminAuctionFilters>) =>
        onFiltersChange({ ...filters, ...changes });
    const chip = (key: string, label: string, value: string, remove: () => void): AdminChip => ({
        key,
        label: t("adminAuctions.filters.chip", { label, value }),
        onRemove: remove,
    });

    const chips: AdminChip[] = [
        filters.query &&
            chip("query", t("adminAuctions.filters.search"), filters.query, () =>
                update({ query: undefined }),
            ),
        filters.format &&
            chip(
                "format",
                t("adminAuctions.fields.format"),
                t(`adminAuctions.formatLabels.${filters.format}`),
                () => update({ format: undefined }),
            ),
        filters.reportedStatus &&
            chip(
                "status",
                t("adminAuctions.fields.status"),
                t(`adminAuctions.reportedStatuses.${filters.reportedStatus}`),
                () => update({ reportedStatus: undefined }),
            ),
        filters.listingSourceId &&
            chip("listingSource", t("adminAuctions.fields.sourceId"), filters.listingSourceId, () =>
                update({ listingSourceId: undefined }),
            ),
        filters.sourceAuctionId &&
            chip(
                "sourceAuctionId",
                t("adminAuctions.fields.sourceAuctionId"),
                filters.sourceAuctionId,
                () => update({ sourceAuctionId: undefined }),
            ),
        filters.size !== undefined &&
            chip("size", t("adminAuctions.filters.pageSize"), String(filters.size), () =>
                update({ size: undefined }),
            ),
    ].filter((entry): entry is AdminChip => Boolean(entry));

    const panelCount = [filters.listingSourceId, filters.sourceAuctionId, filters.size].filter(
        (value) => value !== undefined,
    ).length;

    return (
        <AdminToolbar
            label={t("adminAuctions.filters.title")}
            search={{
                label: t("adminAuctions.filters.query"),
                value: query,
                onChange: setQuery,
                onSubmit: () => update({ query: query.trim() || undefined }),
            }}
            quickFilters={
                <>
                    <AdminQuickSelect
                        label={t("adminAuctions.fields.format")}
                        value={filters.format ?? ""}
                        options={ADMIN_AUCTION_FORMATS.map((format) => ({
                            value: format,
                            label: t(`adminAuctions.formatLabels.${format}`),
                        }))}
                        onChange={(value) =>
                            update({ format: (value as AuctionFormatData) || undefined })
                        }
                    />
                    <AdminQuickSelect
                        label={t("adminAuctions.fields.status")}
                        value={filters.reportedStatus ?? ""}
                        options={ADMIN_AUCTION_REPORTED_STATUSES.map((status) => ({
                            value: status,
                            label: t(`adminAuctions.reportedStatuses.${status}`),
                        }))}
                        onChange={(value) =>
                            update({
                                reportedStatus: (value as AuctionReportedStatusData) || undefined,
                            })
                        }
                    />
                </>
            }
            panelCount={panelCount}
            panel={(close) => (
                <AdminAuctionFilterPanel
                    filters={filters}
                    onApply={(changes) => {
                        update(changes);
                        close();
                    }}
                />
            )}
            chips={<AdminActiveChips chips={chips} onClearAll={onClearFilters} />}
        />
    );
}

type PanelValues = {
    readonly listingSourceId: string;
    readonly sourceAuctionId: string;
    readonly size: string;
};

const EMPTY_PANEL: PanelValues = {
    listingSourceId: "",
    sourceAuctionId: "",
    size: String(ADMIN_AUCTION_PAGE_SIZE),
};

function AdminAuctionFilterPanel({
    filters,
    onApply,
}: {
    readonly filters: AdminAuctionFilters;
    readonly onApply: (changes: Partial<AdminAuctionFilters>) => void;
}) {
    const { t } = useTranslation();
    const [values, setValues] = useState<PanelValues>({
        listingSourceId: filters.listingSourceId ?? "",
        sourceAuctionId: filters.sourceAuctionId ?? "",
        size: String(filters.size ?? ADMIN_AUCTION_PAGE_SIZE),
    });
    const set = (key: keyof PanelValues) => (value: string) =>
        setValues((current) => ({ ...current, [key]: value }));

    return (
        <AdminFilterPanel
            onApply={() => {
                const size = Number(values.size);
                onApply({
                    listingSourceId: values.listingSourceId.trim() || undefined,
                    sourceAuctionId: values.sourceAuctionId.trim() || undefined,
                    // The default page size is the API default, so it stays out of the URL.
                    size: size === ADMIN_AUCTION_PAGE_SIZE ? undefined : size,
                });
            }}
            onReset={() => setValues(EMPTY_PANEL)}
        >
            <AdminTextField
                label={t("adminAuctions.fields.sourceId")}
                value={values.listingSourceId}
                onChange={set("listingSourceId")}
                mono
            />
            <AdminTextField
                label={t("adminAuctions.fields.sourceAuctionId")}
                value={values.sourceAuctionId}
                onChange={set("sourceAuctionId")}
                mono
            />
            <AdminSelectField
                label={t("adminAuctions.filters.pageSize")}
                value={values.size}
                onChange={set("size")}
                options={ADMIN_AUCTION_PAGE_SIZE_OPTIONS.map((size) => ({
                    value: String(size),
                    label: String(size),
                }))}
            />
        </AdminFilterPanel>
    );
}

function hasFilters(filters: AdminAuctionFilters): boolean {
    return [
        filters.query,
        filters.listingSourceId,
        filters.sourceAuctionId,
        filters.format,
        filters.reportedStatus,
    ].some((value) => value !== undefined);
}

function AdminAuctionResults({
    language,
    filters,
    onFiltersChange,
    onClearFilters,
}: {
    readonly language: string;
    readonly filters: AdminAuctionFilters;
    readonly onFiltersChange: (filters: AdminAuctionFilters) => void;
    readonly onClearFilters: () => void;
}) {
    const { t, i18n } = useTranslation();
    const auctionsQuery = useAdminAuctions(filters);
    const auctions = auctionsQuery.data?.pages.flatMap((page) => page.items) ?? [];
    const sortValue =
        filters.sort && filters.order ? `${filters.sort}:${filters.order}` : DEFAULT_SORT_OPTION;

    if (auctionsQuery.isPending) {
        return <AdminLedgerSkeleton label={t("adminAuctions.list.loading")} />;
    }
    if (auctionsQuery.error && auctions.length === 0) {
        return (
            <AdminStatePanel tone="error" title={t("adminAuctions.list.loadFailed")}>
                <button
                    type="button"
                    onClick={() => auctionsQuery.refetch()}
                    className={SECONDARY_PILL_CLASS}
                >
                    {t("adminCommon.retry")}
                </button>
            </AdminStatePanel>
        );
    }
    if (auctions.length === 0) {
        return hasFilters(filters) ? (
            <AdminStatePanel tone="empty" title={t("adminAuctions.list.noMatches")}>
                <button type="button" onClick={onClearFilters} className={SECONDARY_PILL_CLASS}>
                    {t("adminCommon.filters.clearSearch")}
                </button>
            </AdminStatePanel>
        ) : (
            <AdminStatePanel tone="empty" title={t("adminAuctions.list.none")}>
                <CreateAuctionLink language={language} />
            </AdminStatePanel>
        );
    }

    return (
        <>
            <AdminResultLine
                summary={t("adminCommon.result.loaded", {
                    loaded: new Intl.NumberFormat(i18n.language).format(auctions.length),
                })}
                sort={
                    <AdminSortSelect
                        value={sortValue}
                        options={SORT_OPTIONS.map((option) => ({
                            value: option,
                            label: t(`adminAuctions.sort.${option.replace(":", "_")}`),
                        }))}
                        onChange={(value) => {
                            const [sort, order] = value.split(":") as [
                                AdminAuctionSortField,
                                AdminAuctionSortOrder,
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
                label={t("adminNavigation.items.auctions")}
                columns={LEDGER_COLUMNS}
                headings={[
                    t("adminAuctions.columns.auction"),
                    t("adminAuctions.fields.source"),
                    t("adminAuctions.fields.format"),
                    t("adminAuctions.fields.status"),
                    t("adminAuctions.fields.updated"),
                ]}
            >
                {auctions.map((auction) => (
                    <AdminAuctionRow
                        key={auction.auctionId}
                        auction={auction}
                        language={language}
                    />
                ))}
            </AdminLedger>
            <AdminLoadMore
                hasNextPage={auctionsQuery.hasNextPage}
                isFetchingNextPage={auctionsQuery.isFetchingNextPage}
                isError={auctionsQuery.isFetchNextPageError}
                onLoadMore={() => auctionsQuery.fetchNextPage()}
                label={t("adminAuctions.list.loadMore")}
                endLabel={t("adminAuctions.list.end")}
            />
        </>
    );
}

function AdminAuctionRow({
    auction,
    language,
}: {
    readonly auction: AdminAuction;
    readonly language: string;
}) {
    const { t, i18n } = useTranslation();
    return (
        <AdminLedgerRow asChild>
            <Link
                to="/$lng/admin/auctions/$auctionId"
                params={{ lng: language, auctionId: auction.auctionId }}
                aria-label={t("adminAuctions.list.openLabel", {
                    label: auction.name?.text ?? auction.sourceAuctionId,
                })}
            >
                <AdminPrimaryCell
                    title={auction.name?.text ?? t("adminAuctions.list.noName")}
                    titleMuted={!auction.name}
                    sub={auction.sourceAuctionId}
                    subMono
                />
                <AdminCell head={t("adminAuctions.fields.source")}>
                    <code className="truncate font-mono text-xs text-ink-secondary">
                        {auction.listingSourceId}
                    </code>
                </AdminCell>
                <AdminCell head={t("adminAuctions.fields.format")}>
                    {auction.format ? (
                        t(`adminAuctions.formatLabels.${auction.format}`)
                    ) : (
                        <span className="text-ink-muted">{t("adminCommon.none")}</span>
                    )}
                </AdminCell>
                <AdminCell head={t("adminAuctions.fields.status")}>
                    {auction.reportedStatus ? (
                        <AdminStatusMark
                            tone={AUCTION_STATUS_TONES[auction.reportedStatus]}
                            label={t(`adminAuctions.reportedStatuses.${auction.reportedStatus}`)}
                        />
                    ) : (
                        <span className="text-ink-muted">{t("adminAuctions.fields.notSet")}</span>
                    )}
                </AdminCell>
                <AdminCell head={t("adminAuctions.fields.updated")}>
                    <time dateTime={auction.updated.toISOString()} className="tabular-nums">
                        {formatDate(auction.updated, i18n.language, "UTC")}
                    </time>
                </AdminCell>
                <AdminRowChevron />
            </Link>
        </AdminLedgerRow>
    );
}
