import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    type AdminContentNoticeFilters,
    type AdminContentNoticeSummary,
    adminContentNoticeTitle,
    CONTENT_NOTICE_REASONS,
    CONTENT_NOTICE_ROLES,
    CONTENT_NOTICE_TARGET_TYPES,
    type ContentNoticeReason,
    type ContentNoticeRole,
    type ContentNoticeTargetType,
} from "@/data/internal/content-notice/AdminContentNotice.ts";
import {
    type AdminChip,
    AdminActiveChips,
    AdminCell,
    AdminDateRangeField,
    AdminFilterPanel,
    AdminLedger,
    AdminLedgerRow,
    AdminLedgerSkeleton,
    AdminLoadMore,
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
import { ADMIN_TAG_CLASS, SECONDARY_PILL_CLASS } from "@/features/admin/common/lib/adminStyles.ts";
import { formatAdminTimestamp } from "@/features/admin/party-management/lib/adminDates.ts";
import { cn, formatShortDate, formatTime } from "@/lib/utils.ts";
import { Flag } from "lucide-react";
import {
    AdminContentNoticeRequestError,
    useAdminContentNotices,
} from "../api/useAdminContentNotices.ts";
import { AdminContentNoticeDialog } from "../components/AdminContentNoticeDialog.tsx";
import {
    CONTENT_NOTICE_REASON_KEY,
    CONTENT_NOTICE_ROLE_KEY,
    CONTENT_NOTICE_TARGET_KEY,
} from "../lib/adminContentNoticePresentation.ts";
import {
    type AdminContentNoticeRouteSearch,
    adminContentNoticeFiltersOf,
} from "../lib/adminContentNoticeSearch.ts";

const COLUMNS = "minmax(0, 2.4fr) minmax(0, 1.1fr) minmax(0, 1.3fr) minmax(0, 0.9fr) 16px";

type PanelDraft = Pick<
    AdminContentNoticeFilters,
    | "targetType"
    | "reason"
    | "role"
    | "sourceId"
    | "productListingId"
    | "receivedFrom"
    | "receivedTo"
>;
const PANEL_KEYS = [
    "targetType",
    "reason",
    "role",
    "sourceId",
    "productListingId",
    "receivedFrom",
    "receivedTo",
] as const satisfies readonly (keyof PanelDraft)[];

/** Drops empty values so the URL and the query key only hold active filters. */
function clean(search: AdminContentNoticeRouteSearch): AdminContentNoticeRouteSearch {
    return Object.fromEntries(
        Object.entries(search).filter(([, value]) => typeof value === "string" && value.trim()),
    ) as AdminContentNoticeRouteSearch;
}

/** A UTC timestamp for a ledger cell, e.g. "21 Nov 2026, 16:42". */
function formatReceived(date: Date, language: string): string {
    return `${formatShortDate(date, language, "UTC")}, ${formatTime(date, language, "UTC")}`;
}

/**
 * The content notice review queue (board "Admin · Directory — Content notices"): filters in the
 * URL, rows that open the record dialog (also by URL). Read-only: the API has no decisions yet.
 */
export function AdminContentNoticesPage({
    search,
    language,
    onSearchChange,
}: {
    readonly search: AdminContentNoticeRouteSearch;
    readonly language: string;
    readonly onSearchChange: (search: AdminContentNoticeRouteSearch) => void;
}) {
    const { t, i18n } = useTranslation();
    const filters = adminContentNoticeFiltersOf(search);
    const { data, isPending, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
        useAdminContentNotices(filters);
    const notices = data?.pages.flatMap((page) => page.items) ?? [];
    const selected = notices.find((notice) => notice.id === search.notice);

    const setFilters = (next: AdminContentNoticeFilters) =>
        onSearchChange(clean({ ...next, notice: search.notice }));
    const update = (patch: Partial<AdminContentNoticeFilters>) =>
        setFilters({ ...filters, ...patch });
    const resetFilters = () => setFilters(filters.order ? { order: filters.order } : {});
    const openNotice = (id?: string) => onSearchChange(clean({ ...filters, notice: id }));

    const reasonOptions = CONTENT_NOTICE_REASONS.map((reason) => ({
        value: reason,
        label: t(CONTENT_NOTICE_REASON_KEY[reason]),
    }));
    const roleOptions = CONTENT_NOTICE_ROLES.map((role) => ({
        value: role,
        label: t(CONTENT_NOTICE_ROLE_KEY[role]),
    }));
    const chips = noticeChips(filters, t, update);
    const panelCount = noticePanelCount(filters);
    const hasFilters = chips.length > 0;
    const summary = t("adminCommon.result.loaded", {
        loaded: new Intl.NumberFormat(i18n.language).format(notices.length),
    });
    const filterRejected = error instanceof AdminContentNoticeRequestError && error.status === 400;

    let content: ReactNode;
    if (error && notices.length === 0) {
        content = filterRejected ? (
            <AdminStatePanel tone="error" title={t("adminContentNotices.errors.filterRejected")}>
                <button type="button" onClick={resetFilters} className={SECONDARY_PILL_CLASS}>
                    {t("adminCommon.filters.clearSearch")}
                </button>
            </AdminStatePanel>
        ) : (
            <AdminStatePanel tone="error" title={t("adminContentNotices.loadFailed")}>
                <button type="button" onClick={() => refetch()} className={SECONDARY_PILL_CLASS}>
                    {t("adminCommon.retry")}
                </button>
            </AdminStatePanel>
        );
    } else if (isPending) {
        content = <AdminLedgerSkeleton label={t("adminContentNotices.loading")} />;
    } else if (notices.length === 0) {
        content = (
            <AdminStatePanel
                tone="empty"
                icon={hasFilters ? undefined : Flag}
                title={t(
                    hasFilters ? "adminContentNotices.noMatches" : "adminContentNotices.emptyTitle",
                )}
            >
                {hasFilters && (
                    <button type="button" onClick={resetFilters} className={SECONDARY_PILL_CLASS}>
                        {t("adminCommon.filters.clearSearch")}
                    </button>
                )}
            </AdminStatePanel>
        );
    } else {
        content = (
            <>
                <AdminLedger
                    label={t("adminContentNotices.pageTitle")}
                    columns={COLUMNS}
                    headings={[
                        t("adminContentNotices.columns.content"),
                        t("adminContentNotices.columns.reason"),
                        t("adminContentNotices.columns.notifier"),
                        t("adminContentNotices.columns.received"),
                    ]}
                >
                    {notices.map((notice) => (
                        <NoticeRow
                            key={notice.id}
                            notice={notice}
                            selected={notice.id === search.notice}
                            onOpen={() => openNotice(notice.id)}
                        />
                    ))}
                </AdminLedger>
                <AdminLoadMore
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    isError={Boolean(error)}
                    onLoadMore={() => fetchNextPage()}
                    label={t("adminContentNotices.list.loadMore")}
                    endLabel={t("adminContentNotices.list.end")}
                />
            </>
        );
    }

    return (
        <>
            <AdminPageHeader title={t("adminContentNotices.pageTitle")} />
            <AdminToolbar
                label={t("adminContentNotices.filters.title")}
                quickFilters={
                    <>
                        <AdminQuickSelect
                            label={t("adminContentNotices.filters.reason")}
                            value={filters.reason ?? ""}
                            options={reasonOptions}
                            onChange={(value) =>
                                update({ reason: (value || undefined) as ContentNoticeReason })
                            }
                        />
                        <AdminQuickSelect
                            label={t("adminContentNotices.filters.role")}
                            value={filters.role ?? ""}
                            options={roleOptions}
                            onChange={(value) =>
                                update({ role: (value || undefined) as ContentNoticeRole })
                            }
                        />
                    </>
                }
                panelCount={panelCount}
                panel={
                    <NoticeFilterPanel
                        filters={filters}
                        onApply={(draft) => update(draft)}
                        onReset={() =>
                            update(Object.fromEntries(PANEL_KEYS.map((key) => [key, undefined])))
                        }
                    />
                }
                chips={<AdminActiveChips chips={chips} onClearAll={resetFilters} />}
            />
            <AdminResultLine
                summary={summary}
                sort={
                    <AdminSortSelect
                        value={filters.order === "asc" ? "asc" : "desc"}
                        options={[
                            { value: "desc", label: t("adminContentNotices.sort.newest") },
                            { value: "asc", label: t("adminContentNotices.sort.oldest") },
                        ]}
                        onChange={(value) => update({ order: value === "asc" ? "asc" : undefined })}
                    />
                }
            />
            {content}
            <AdminContentNoticeDialog
                noticeId={search.notice}
                summary={selected}
                language={language}
                onClose={() => openNotice()}
            />
        </>
    );
}

function NoticeRow({
    notice,
    selected,
    onOpen,
}: {
    readonly notice: AdminContentNoticeSummary;
    readonly selected: boolean;
    readonly onOpen: () => void;
}) {
    const { t, i18n } = useTranslation();
    const title = adminContentNoticeTitle(notice);
    const shownTitle = title ?? t("adminContentNotices.list.untitled");
    const origin = [
        notice.target.type === "LISTING_SOURCE"
            ? t("adminContentNotices.list.sourceAll")
            : t("adminContentNotices.list.listingFrom", { source: notice.listingSourceName }),
        ...(notice.partner ? [t("adminContentNotices.list.partner")] : []),
    ].join(" · ");
    const reason = t(CONTENT_NOTICE_REASON_KEY[notice.reason]);
    const role = t(CONTENT_NOTICE_ROLE_KEY[notice.role]);
    const who = notice.submitterName ?? notice.submitterEmail;
    const whoLabel = who ?? t("adminContentNotices.list.anonymous");
    const received = formatReceived(notice.created, i18n.language);

    const titleNode = (
        <span
            className={cn(
                "font-medium",
                title ? "text-[15px]" : "text-[15px] font-normal text-ink-muted italic",
            )}
        >
            {shownTitle}
        </span>
    );
    const whoNode = (
        <span className={cn(who ? "text-ink-secondary" : "text-ink-muted italic")}>{whoLabel}</span>
    );

    return (
        <AdminLedgerRow
            selected={selected}
            onClick={onOpen}
            aria-label={t("adminContentNotices.list.open", { name: shownTitle })}
        >
            {/* Phones: a card without column labels (reason and date, content, notifier). */}
            <span className="flex min-w-0 basis-full flex-col gap-1.5 lg:hidden">
                <span className="flex items-center justify-between gap-3">
                    <span className={ADMIN_TAG_CLASS}>{reason}</span>
                    <span className="font-mono text-[10px] tracking-[0.12em] whitespace-nowrap text-ink-muted uppercase">
                        <time dateTime={notice.created.toISOString()}>{received}</time>
                    </span>
                </span>
                <span className="mt-1 leading-snug">{titleNode}</span>
                <span className="text-meta text-ink-secondary">{origin}</span>
                <span className="text-meta text-ink-secondary">
                    {role} · {whoNode}
                </span>
            </span>

            {/* From 1024px: the ledger columns. */}
            <span className="hidden min-w-0 flex-col gap-0.5 lg:flex">
                <span className="truncate">{titleNode}</span>
                <span className="truncate text-meta text-ink-secondary">{origin}</span>
            </span>
            <AdminCell head={t("adminContentNotices.columns.reason")} className="hidden lg:flex">
                <span className={ADMIN_TAG_CLASS}>{reason}</span>
            </AdminCell>
            <AdminCell head={t("adminContentNotices.columns.notifier")} className="hidden lg:flex">
                <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate">{role}</span>
                    <span className="truncate text-xs">{whoNode}</span>
                </span>
            </AdminCell>
            <AdminCell head={t("adminContentNotices.columns.received")} className="hidden lg:flex">
                <time
                    dateTime={notice.created.toISOString()}
                    className="tabular-nums"
                    title={formatAdminTimestamp(notice.created, i18n.language)}
                >
                    {received}
                </time>
            </AdminCell>
            <AdminRowChevron />
        </AdminLedgerRow>
    );
}

function NoticeFilterPanel({
    filters,
    onApply,
    onReset,
}: {
    readonly filters: AdminContentNoticeFilters;
    readonly onApply: (draft: PanelDraft) => void;
    readonly onReset: () => void;
}) {
    const { t } = useTranslation();
    const [draft, setDraft] = useState<PanelDraft>(() =>
        Object.fromEntries(PANEL_KEYS.map((key) => [key, filters[key]])),
    );
    const set = (key: keyof PanelDraft) => (value: string) =>
        setDraft((current) => ({ ...current, [key]: value }));
    const any = { value: "", label: t("adminCommon.filters.any") };
    return (
        <AdminFilterPanel
            onApply={() => {
                onApply(
                    Object.fromEntries(
                        PANEL_KEYS.map((key) => [key, draft[key]?.trim() || undefined]),
                    ),
                );
                return undefined;
            }}
            onReset={onReset}
        >
            <AdminSelectField
                label={t("adminContentNotices.filters.target")}
                value={draft.targetType ?? ""}
                onChange={set("targetType")}
                options={[
                    { value: "", label: t("adminContentNotices.filters.targetAny") },
                    ...CONTENT_NOTICE_TARGET_TYPES.map((type: ContentNoticeTargetType) => ({
                        value: type,
                        label: t(CONTENT_NOTICE_TARGET_KEY[type]),
                    })),
                ]}
            />
            <AdminSelectField
                label={t("adminContentNotices.filters.reason")}
                value={draft.reason ?? ""}
                onChange={set("reason")}
                options={[
                    any,
                    ...CONTENT_NOTICE_REASONS.map((reason) => ({
                        value: reason,
                        label: t(CONTENT_NOTICE_REASON_KEY[reason]),
                    })),
                ]}
            />
            <AdminSelectField
                label={t("adminContentNotices.filters.role")}
                value={draft.role ?? ""}
                onChange={set("role")}
                options={[
                    any,
                    ...CONTENT_NOTICE_ROLES.map((role) => ({
                        value: role,
                        label: t(CONTENT_NOTICE_ROLE_KEY[role]),
                    })),
                ]}
            />
            <AdminTextField
                label={t("adminContentNotices.filters.listingSourceId")}
                value={draft.sourceId ?? ""}
                onChange={set("sourceId")}
                maxLength={128}
                mono
            />
            <AdminTextField
                label={t("adminContentNotices.filters.productListingId")}
                value={draft.productListingId ?? ""}
                onChange={set("productListingId")}
                maxLength={128}
                mono
            />
            <AdminDateRangeField
                legend={t("adminContentNotices.filters.received")}
                from={draft.receivedFrom ?? ""}
                until={draft.receivedTo ?? ""}
                onFromChange={set("receivedFrom")}
                onUntilChange={set("receivedTo")}
            />
        </AdminFilterPanel>
    );
}

type Translate = ReturnType<typeof useTranslation>["t"];

/** One removable chip per active filter. */
function noticeChips(
    filters: AdminContentNoticeFilters,
    t: Translate,
    update: (patch: Partial<AdminContentNoticeFilters>) => void,
): AdminChip[] {
    const chip = (
        key: string,
        label: string,
        value: string,
        patch: Partial<AdminContentNoticeFilters>,
    ) => ({
        key,
        label: `${label}: ${value}`,
        onRemove: () => update(patch),
    });
    return [
        ...(filters.targetType
            ? [
                  chip(
                      "target",
                      t("adminContentNotices.filters.target"),
                      t(CONTENT_NOTICE_TARGET_KEY[filters.targetType]),
                      { targetType: undefined },
                  ),
              ]
            : []),
        ...(filters.reason
            ? [
                  chip(
                      "reason",
                      t("adminContentNotices.filters.reason"),
                      t(CONTENT_NOTICE_REASON_KEY[filters.reason]),
                      { reason: undefined },
                  ),
              ]
            : []),
        ...(filters.role
            ? [
                  chip(
                      "role",
                      t("adminContentNotices.filters.role"),
                      t(CONTENT_NOTICE_ROLE_KEY[filters.role]),
                      { role: undefined },
                  ),
              ]
            : []),
        ...(filters.sourceId
            ? [
                  chip(
                      "source",
                      t("adminContentNotices.filters.listingSourceId"),
                      filters.sourceId,
                      {
                          sourceId: undefined,
                      },
                  ),
              ]
            : []),
        ...(filters.productListingId
            ? [
                  chip(
                      "listing",
                      t("adminContentNotices.filters.productListingId"),
                      filters.productListingId,
                      { productListingId: undefined },
                  ),
              ]
            : []),
        ...(filters.receivedFrom || filters.receivedTo
            ? [
                  chip(
                      "received",
                      t("adminContentNotices.filters.received"),
                      `${filters.receivedFrom ?? "…"} – ${filters.receivedTo ?? "…"}`,
                      { receivedFrom: undefined, receivedTo: undefined },
                  ),
              ]
            : []),
    ];
}

/** Active filters that live only in the panel (reason and role also have quick pills). */
function noticePanelCount(filters: AdminContentNoticeFilters): number {
    return [
        filters.targetType,
        filters.sourceId,
        filters.productListingId,
        filters.receivedFrom || filters.receivedTo,
    ].filter(Boolean).length;
}
