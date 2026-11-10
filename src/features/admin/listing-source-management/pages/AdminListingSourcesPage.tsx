import { Plus } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ReferralConfigurationData } from "@/client";
import {
    AdminCell,
    AdminLedger,
    AdminLedgerRow,
    AdminLedgerSkeleton,
    AdminLoadMore,
    AdminPrimaryCell,
    AdminResultLine,
    AdminRowChevron,
    AdminSortSelect,
} from "@/features/admin/common/components/AdminDirectory.tsx";
import { AdminPageHeader } from "@/features/admin/common/components/AdminPageHeader.tsx";
import { AdminStatePanel } from "@/features/admin/common/components/AdminStatePanel.tsx";
import { AdminMark } from "@/features/admin/common/components/AdminStatusMark.tsx";
import {
    ADMIN_MONO_CLASS,
    ADMIN_TAG_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import {
    ADMIN_LISTING_SOURCE_SORT_FIELDS,
    type AdminListingSourceDetail,
    type AdminListingSourceFilters,
    type AdminListingSourceSortField,
    type AdminListingSourceSortOrder,
    type AdminListingSourceSummary,
} from "@/data/internal/listing-source/AdminListingSource.ts";
import { useAdminListingSources } from "../api/useAdminListingSources.ts";
import { AdminListingSourceDetailDialog } from "../components/AdminListingSourceDetailDialog.tsx";
import { AdminListingSourceFormDialog } from "../components/AdminListingSourceFormDialog.tsx";
import { AdminListingSourceToolbar } from "../components/AdminListingSourceToolbar.tsx";
import {
    DEFAULT_ADMIN_LISTING_SOURCE_FILTERS,
    hasAdminListingSourceFilters,
} from "../lib/adminListingSourceSearch.ts";
import { formatAdminDay } from "../lib/formatAdminListingSourceDate.ts";
import { cn } from "@/lib/utils.ts";

const LEDGER_COLUMNS =
    "minmax(0,2fr) minmax(0,0.9fr) minmax(0,1.3fr) minmax(0,0.8fr) minmax(0,0.8fr) 16px";

/** Every sort the API accepts: names A–Z first, dates newest first. */
const SORT_OPTIONS = ADMIN_LISTING_SOURCE_SORT_FIELDS.flatMap((sort) =>
    sort === "created" || sort === "updated"
        ? ([`${sort}:desc`, `${sort}:asc`] as const)
        : ([`${sort}:asc`, `${sort}:desc`] as const),
) as readonly `${AdminListingSourceSortField}:${AdminListingSourceSortOrder}`[];

type FormState =
    | { readonly open: false }
    | {
          readonly open: true;
          readonly source?: AdminListingSourceDetail;
          readonly referralConfiguration?: ReferralConfigurationData | null;
      };

/**
 * The listing-source directory (board "Admin · Directory", section sources): filters live in the
 * URL, rows open the source's detail dialog, whose ID is the `source` search parameter.
 */
export function AdminListingSourcesPage({
    filters,
    selectedSourceId,
    onFiltersChange,
    onSourceSelect,
}: {
    readonly filters: AdminListingSourceFilters;
    readonly selectedSourceId?: string;
    readonly onFiltersChange: (filters: AdminListingSourceFilters) => void;
    readonly onSourceSelect: (listingSourceId: string | undefined) => void;
}) {
    const { t, i18n } = useTranslation();
    const [form, setForm] = useState<FormState>({ open: false });
    const query = useAdminListingSources(filters);
    const sources = query.data?.pages.flatMap((page) => page.items) ?? [];
    const total = query.data?.pages[0]?.total;
    const filtered = hasAdminListingSourceFilters(filters);
    // Referral data is only exposed on search summaries; read it from the live list cache so it
    // refreshes after mutations instead of keeping a snapshot from when the dialog was opened.
    const selectedSummary = sources.find((source) => source.listingSourceId === selectedSourceId);
    const numbers = new Intl.NumberFormat(i18n.language);

    const openCreate = () => setForm({ open: true });
    const createAction = (
        <button type="button" onClick={openCreate} className={PRIMARY_PILL_CLASS}>
            <Plus aria-hidden="true" className="size-4" strokeWidth={1.8} />
            {t("adminListingSources.actions.create")}
        </button>
    );
    const resetFilters = () => onFiltersChange({ ...DEFAULT_ADMIN_LISTING_SOURCE_FILTERS });

    let content: ReactNode;
    if (query.error && sources.length === 0) {
        content = (
            <AdminStatePanel tone="error" title={t("adminListingSources.states.error")}>
                <button
                    type="button"
                    onClick={() => void query.refetch()}
                    className={SECONDARY_PILL_CLASS}
                >
                    {t("adminCommon.retry")}
                </button>
            </AdminStatePanel>
        );
    } else if (query.isPending) {
        content = <AdminLedgerSkeleton label={t("adminListingSources.loading")} />;
    } else if (sources.length === 0) {
        content = filtered ? (
            <AdminStatePanel tone="empty" title={t("adminListingSources.states.noMatches")}>
                <button type="button" onClick={resetFilters} className={SECONDARY_PILL_CLASS}>
                    {t("adminCommon.filters.clearSearch")}
                </button>
            </AdminStatePanel>
        ) : (
            <AdminStatePanel tone="empty" title={t("adminListingSources.states.empty")}>
                {createAction}
            </AdminStatePanel>
        );
    } else {
        content = (
            <>
                <AdminResultLine
                    summary={
                        typeof total === "number"
                            ? t("adminCommon.result.loadedOfTotal", {
                                  loaded: numbers.format(sources.length),
                                  total: numbers.format(total),
                              })
                            : t("adminCommon.result.loaded", {
                                  loaded: numbers.format(sources.length),
                              })
                    }
                    sort={
                        <AdminSortSelect
                            value={`${filters.sort ?? "name"}:${filters.order ?? "asc"}`}
                            options={SORT_OPTIONS.map((option) => ({
                                value: option,
                                label: t(
                                    `adminListingSources.sortOptions.${option.replace(":", "_")}`,
                                ),
                            }))}
                            onChange={(value) => {
                                const [sort, order] = value.split(":") as [
                                    AdminListingSourceSortField,
                                    AdminListingSourceSortOrder,
                                ];
                                onFiltersChange({ ...filters, sort, order });
                            }}
                        />
                    }
                />
                <AdminLedger
                    label={t("adminListingSources.heading")}
                    columns={LEDGER_COLUMNS}
                    headings={[
                        t("adminListingSources.list.heads.source"),
                        t("adminListingSources.list.heads.type"),
                        t("adminListingSources.list.heads.ingestion"),
                        t("adminListingSources.list.heads.platform"),
                        t("adminListingSources.list.heads.updated"),
                    ]}
                >
                    {sources.map((source) => (
                        <ListingSourceRow
                            key={source.listingSourceId}
                            source={source}
                            selected={source.listingSourceId === selectedSourceId}
                            onOpen={() => onSourceSelect(source.listingSourceId)}
                        />
                    ))}
                </AdminLedger>
                <AdminLoadMore
                    hasNextPage={Boolean(query.hasNextPage)}
                    isFetchingNextPage={query.isFetchingNextPage}
                    isError={query.isFetchNextPageError}
                    onLoadMore={() => void query.fetchNextPage()}
                    label={t("adminListingSources.list.loadMoreSources")}
                />
            </>
        );
    }

    return (
        <>
            <AdminPageHeader title={t("adminListingSources.heading")} action={createAction} />
            <AdminListingSourceToolbar filters={filters} onFiltersChange={onFiltersChange} />
            {content}
            <AdminListingSourceDetailDialog
                listingSourceId={selectedSourceId}
                summary={selectedSummary}
                open={Boolean(selectedSourceId) && !form.open}
                onOpenChange={(open) => {
                    if (!open) onSourceSelect(undefined);
                }}
                onEdit={(source, referralConfiguration) => {
                    onSourceSelect(undefined);
                    setForm({ open: true, source, referralConfiguration });
                }}
            />
            <AdminListingSourceFormDialog
                source={form.open ? form.source : undefined}
                referralConfiguration={form.open ? form.referralConfiguration : undefined}
                open={form.open}
                onOpenChange={(open) => {
                    if (!open) setForm({ open: false });
                }}
                onCreated={onSourceSelect}
                onUpdated={onSourceSelect}
            />
        </>
    );
}

function ListingSourceRow({
    source,
    selected,
    onOpen,
}: {
    readonly source: AdminListingSourceSummary;
    readonly selected: boolean;
    readonly onOpen: () => void;
}) {
    const { t, i18n } = useTranslation();
    return (
        <AdminLedgerRow selected={selected} onClick={onOpen}>
            <AdminPrimaryCell
                title={source.name}
                sub={t("adminListingSources.list.operatedBy", { name: source.operator.name })}
            />
            <AdminCell head={t("adminListingSources.list.heads.type")}>
                <span className="truncate">
                    {t(`listingSourceTypes.${source.listingSourceType}`)}
                </span>
            </AdminCell>
            <AdminCell head={t("adminListingSources.list.heads.ingestion")}>
                {source.ingestionMethods.length > 0 ? (
                    <span className="flex flex-wrap gap-1">
                        {source.ingestionMethods.map((method) => (
                            <span key={method} className={ADMIN_TAG_CLASS}>
                                {t(`adminListingSources.methods.${method}`)}
                            </span>
                        ))}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 text-meta text-ink-muted">
                        <AdminMark tone="brass" className="size-2" />
                        {t("adminListingSources.list.none")}
                    </span>
                )}
            </AdminCell>
            <AdminCell head={t("adminListingSources.list.heads.platform")}>
                {source.platformTechnology ? (
                    <code className={cn(ADMIN_MONO_CLASS, "truncate")}>
                        {source.platformTechnology}
                    </code>
                ) : (
                    <span className="text-ink-muted">{t("adminCommon.none")}</span>
                )}
            </AdminCell>
            <AdminCell head={t("adminListingSources.list.heads.updated")}>
                <time dateTime={source.updated.toISOString()} className="tabular-nums">
                    {formatAdminDay(source.updated, i18n.language)}
                </time>
            </AdminCell>
            <AdminRowChevron />
        </AdminLedgerRow>
    );
}
