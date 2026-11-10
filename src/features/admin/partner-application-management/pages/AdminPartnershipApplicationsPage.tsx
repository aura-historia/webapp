import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ADMIN_APPLICATION_SORT_FIELDS,
    ADMIN_APPLICATION_SORT_ORDERS,
    type AdminApplicationFilters,
    type AdminApplicationSortField,
    type AdminApplicationSortOrder,
    type AdminPartnershipApplicationSummary,
    adminApplicationName,
    PARTNERSHIP_PROPOSAL_TYPES,
} from "@/data/internal/partner-application/AdminPartnershipApplication.ts";
import { PARTNER_APPLICATION_STATES } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
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
    AdminPrimaryCell,
    AdminQuickMulti,
    AdminResultLine,
    AdminRowChevron,
    AdminSortSelect,
    AdminTextField,
    AdminToolbar,
} from "@/features/admin/common/components/AdminDirectory.tsx";
import { AdminPageHeader } from "@/features/admin/common/components/AdminPageHeader.tsx";
import { AdminStatePanel } from "@/features/admin/common/components/AdminStatePanel.tsx";
import { AdminStatusMark } from "@/features/admin/common/components/AdminStatusMark.tsx";
import { SECONDARY_PILL_CLASS } from "@/features/admin/common/lib/adminStyles.ts";
import { formatAdminDay } from "@/features/admin/party-management/lib/adminDates.ts";
import { useAdminPartnershipApplications } from "../api/useAdminPartnershipApplications.ts";
import { AdminApplicationDetailDialog } from "../components/AdminApplicationDetailDialog.tsx";
import {
    ADMIN_APPLICATION_STATE_TONE,
    ADMIN_APPLICATION_STATE_TRANSLATION_KEY,
    PROPOSAL_OPTION_TRANSLATION_KEY,
} from "../lib/adminApplicationPresentation.ts";
import {
    type AdminApplicationRouteSearch,
    adminApplicationFiltersOf,
} from "../lib/adminApplicationSearch.ts";

const COLUMNS =
    "minmax(0, 2.2fr) minmax(0, 1fr) minmax(0, 1.1fr) minmax(0, 0.8fr) minmax(0, 0.8fr) 16px";
const DEFAULT_SORT = "created:desc";
const SORT_OPTIONS = ADMIN_APPLICATION_SORT_FIELDS.flatMap((field) =>
    ADMIN_APPLICATION_SORT_ORDERS.map((order) => `${field}:${order}` as const),
);

type PanelDraft = Pick<
    AdminApplicationFilters,
    "applicantUserId" | "sourceId" | "createdFrom" | "createdTo" | "updatedFrom" | "updatedTo"
>;
const PANEL_KEYS = [
    "applicantUserId",
    "sourceId",
    "createdFrom",
    "createdTo",
    "updatedFrom",
    "updatedTo",
] as const satisfies readonly (keyof PanelDraft)[];

/** Drops empty values so the URL and the query key only hold active filters. */
function clean(search: AdminApplicationRouteSearch): AdminApplicationRouteSearch {
    return Object.fromEntries(
        Object.entries(search).filter(([, value]) =>
            Array.isArray(value) ? value.length > 0 : typeof value === "string" && value.trim(),
        ),
    ) as AdminApplicationRouteSearch;
}

/** The review queue: filters in the URL, rows that open the review dialog (also by URL). */
export function AdminPartnershipApplicationsPage({
    search,
    onSearchChange,
}: {
    readonly search: AdminApplicationRouteSearch;
    readonly onSearchChange: (search: AdminApplicationRouteSearch) => void;
}) {
    const { t, i18n } = useTranslation();
    const filters = adminApplicationFiltersOf(search);
    const { data, isPending, error, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
        useAdminPartnershipApplications(filters);
    const applications = data?.pages.flatMap((page) => page.items) ?? [];
    const total = data?.pages[0]?.total;
    const selected = applications.find((application) => application.id === search.application);

    const setFilters = (next: AdminApplicationFilters) =>
        onSearchChange(clean({ ...next, application: search.application }));
    const update = (patch: Partial<AdminApplicationFilters>) =>
        setFilters({ ...filters, ...patch });
    const resetFilters = () =>
        setFilters({
            ...(filters.sort && filters.order ? { sort: filters.sort, order: filters.order } : {}),
        });
    const openApplication = (id?: string) => onSearchChange(clean({ ...filters, application: id }));

    const stateOptions = PARTNER_APPLICATION_STATES.map((state) => ({
        value: state,
        label: t(ADMIN_APPLICATION_STATE_TRANSLATION_KEY[state]),
    }));
    const proposalOptions = PARTNERSHIP_PROPOSAL_TYPES.map((type) => ({
        value: type,
        label: t(PROPOSAL_OPTION_TRANSLATION_KEY[type]),
    }));
    const chips = applicationChips(filters, t, update);
    const panelCount = applicationPanelCount(filters);
    const hasFilters = chips.length > 0;
    const sortValue =
        filters.sort && filters.order ? `${filters.sort}:${filters.order}` : DEFAULT_SORT;
    const number = new Intl.NumberFormat(i18n.language);
    const summary =
        typeof total === "number"
            ? t("adminCommon.result.loadedOfTotal", {
                  loaded: number.format(applications.length),
                  total: number.format(total),
              })
            : t("adminCommon.result.loaded", { loaded: number.format(applications.length) });

    let content: ReactNode;
    if (error && applications.length === 0) {
        content = (
            <AdminStatePanel tone="error" title={t("adminApplications.loadFailed")}>
                <button type="button" onClick={() => refetch()} className={SECONDARY_PILL_CLASS}>
                    {t("adminCommon.retry")}
                </button>
            </AdminStatePanel>
        );
    } else if (isPending) {
        content = <AdminLedgerSkeleton label={t("adminApplications.loading")} />;
    } else if (applications.length === 0) {
        content = (
            <AdminStatePanel
                tone="empty"
                title={t(
                    hasFilters ? "adminApplications.noMatches" : "adminApplications.emptyTitle",
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
                    label={t("adminApplications.list.label")}
                    columns={COLUMNS}
                    headings={[
                        t("adminApplications.columns.provider"),
                        t("adminApplications.columns.status"),
                        t("adminApplications.columns.applicant"),
                        t("adminApplications.columns.created"),
                        t("adminApplications.columns.updated"),
                    ]}
                >
                    {applications.map((application) => (
                        <ApplicationRow
                            key={application.id}
                            application={application}
                            selected={application.id === search.application}
                            onOpen={() => openApplication(application.id)}
                        />
                    ))}
                </AdminLedger>
                <AdminLoadMore
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    isError={Boolean(error)}
                    onLoadMore={() => fetchNextPage()}
                    label={t("adminApplications.list.loadMoreApplications")}
                />
            </>
        );
    }

    return (
        <>
            <AdminPageHeader title={t("adminApplications.pageTitle")} />
            <AdminToolbar
                label={t("adminApplications.filters.title")}
                quickFilters={
                    <>
                        <AdminQuickMulti
                            label={t("adminApplications.filters.states")}
                            values={filters.states ?? []}
                            options={stateOptions}
                            onChange={(states) =>
                                update({
                                    states: PARTNER_APPLICATION_STATES.filter((state) =>
                                        states.includes(state),
                                    ),
                                })
                            }
                        />
                        <AdminQuickMulti
                            label={t("adminApplications.filters.proposal")}
                            values={filters.proposalTypes ?? []}
                            options={proposalOptions}
                            onChange={(types) =>
                                update({
                                    proposalTypes: PARTNERSHIP_PROPOSAL_TYPES.filter((type) =>
                                        types.includes(type),
                                    ),
                                })
                            }
                        />
                    </>
                }
                panelCount={panelCount}
                panel={
                    <ApplicationFilterPanel
                        filters={filters}
                        onApply={(draft) => {
                            update(draft);
                        }}
                        onReset={() => {
                            update(Object.fromEntries(PANEL_KEYS.map((key) => [key, undefined])));
                        }}
                    />
                }
                chips={<AdminActiveChips chips={chips} onClearAll={resetFilters} />}
            />
            <AdminResultLine
                summary={summary}
                sort={
                    <AdminSortSelect
                        value={sortValue}
                        options={SORT_OPTIONS.map((option) => ({
                            value: option,
                            label: t(`adminApplications.sort.${option.replace(":", "_")}`),
                        }))}
                        onChange={(value) => {
                            const [sort, order] = value.split(":") as [
                                AdminApplicationSortField,
                                AdminApplicationSortOrder,
                            ];
                            update(
                                value === DEFAULT_SORT
                                    ? { sort: undefined, order: undefined }
                                    : { sort, order },
                            );
                        }}
                    />
                }
            />
            {content}
            <AdminApplicationDetailDialog
                applicationId={search.application}
                summary={selected}
                onClose={() => openApplication()}
            />
        </>
    );
}

function ApplicationRow({
    application,
    selected,
    onOpen,
}: {
    readonly application: AdminPartnershipApplicationSummary;
    readonly selected: boolean;
    readonly onOpen: () => void;
}) {
    const { t, i18n } = useTranslation();
    const name = adminApplicationName(application);
    const proposal = application.proposal;
    const sub =
        proposal.type === "EXISTING_LISTING_SOURCE"
            ? t("adminApplications.list.existing")
            : t("adminApplications.list.proposed", {
                  type: t(`listingSourceTypes.${proposal.listingSource.listingSourceType}`),
              });
    return (
        <AdminLedgerRow
            selected={selected}
            onClick={onOpen}
            aria-label={t("adminApplications.list.open", { name })}
        >
            <AdminPrimaryCell
                title={name}
                titleMono={proposal.type === "EXISTING_LISTING_SOURCE"}
                sub={sub.toLocaleUpperCase(i18n.language)}
                subMono
            />
            <AdminCell head={t("adminApplications.columns.status")}>
                <AdminStatusMark
                    tone={ADMIN_APPLICATION_STATE_TONE[application.state]}
                    label={t(ADMIN_APPLICATION_STATE_TRANSLATION_KEY[application.state])}
                />
            </AdminCell>
            <AdminCell head={t("adminApplications.columns.applicant")}>
                <code className="truncate font-mono text-xs text-ink-secondary">
                    {application.applicantUserId}
                </code>
            </AdminCell>
            <AdminCell head={t("adminApplications.columns.created")}>
                <span className="tabular-nums">
                    {formatAdminDay(application.created, i18n.language)}
                </span>
            </AdminCell>
            <AdminCell head={t("adminApplications.columns.updated")}>
                <span className="tabular-nums">
                    {formatAdminDay(application.updated, i18n.language)}
                </span>
            </AdminCell>
            <AdminRowChevron />
        </AdminLedgerRow>
    );
}

function ApplicationFilterPanel({
    filters,
    onApply,
    onReset,
}: {
    readonly filters: AdminApplicationFilters;
    readonly onApply: (draft: PanelDraft) => void;
    readonly onReset: () => void;
}) {
    const { t } = useTranslation();
    const [draft, setDraft] = useState<PanelDraft>(() =>
        Object.fromEntries(PANEL_KEYS.map((key) => [key, filters[key]])),
    );
    const set = (key: keyof PanelDraft) => (value: string) =>
        setDraft((current) => ({ ...current, [key]: value }));
    return (
        <AdminFilterPanel
            onApply={() =>
                onApply(
                    Object.fromEntries(
                        PANEL_KEYS.map((key) => [key, draft[key]?.trim() || undefined]),
                    ),
                )
            }
            onReset={onReset}
        >
            <AdminTextField
                label={t("adminApplications.filters.applicantUserId")}
                value={draft.applicantUserId ?? ""}
                onChange={set("applicantUserId")}
                maxLength={128}
                mono
            />
            <AdminTextField
                label={t("adminApplications.filters.listingSourceId")}
                value={draft.sourceId ?? ""}
                onChange={set("sourceId")}
                maxLength={128}
                mono
            />
            <AdminDateRangeField
                legend={t("adminApplications.filters.created")}
                from={draft.createdFrom ?? ""}
                until={draft.createdTo ?? ""}
                onFromChange={set("createdFrom")}
                onUntilChange={set("createdTo")}
            />
            <AdminDateRangeField
                legend={t("adminApplications.filters.updated")}
                from={draft.updatedFrom ?? ""}
                until={draft.updatedTo ?? ""}
                onFromChange={set("updatedFrom")}
                onUntilChange={set("updatedTo")}
            />
        </AdminFilterPanel>
    );
}

type Translate = ReturnType<typeof useTranslation>["t"];

function dateRange(from?: string, until?: string): string {
    return `${from ?? "…"} – ${until ?? "…"}`;
}

/** One removable chip per active filter. */
function applicationChips(
    filters: AdminApplicationFilters,
    t: Translate,
    update: (patch: Partial<AdminApplicationFilters>) => void,
): AdminChip[] {
    return [
        ...(filters.states ?? []).map((state) => ({
            key: `state-${state}`,
            label: `${t("adminApplications.filters.states")}: ${t(ADMIN_APPLICATION_STATE_TRANSLATION_KEY[state])}`,
            onRemove: () => update({ states: filters.states?.filter((value) => value !== state) }),
        })),
        ...(filters.proposalTypes ?? []).map((type) => ({
            key: `proposal-${type}`,
            label: `${t("adminApplications.filters.proposal")}: ${t(PROPOSAL_OPTION_TRANSLATION_KEY[type])}`,
            onRemove: () =>
                update({
                    proposalTypes: filters.proposalTypes?.filter((value) => value !== type),
                }),
        })),
        ...(filters.applicantUserId
            ? [
                  {
                      key: "applicant",
                      label: `${t("adminApplications.filters.applicantUserId")}: ${filters.applicantUserId}`,
                      onRemove: () => update({ applicantUserId: undefined }),
                  },
              ]
            : []),
        ...(filters.sourceId
            ? [
                  {
                      key: "source",
                      label: `${t("adminApplications.filters.listingSourceId")}: ${filters.sourceId}`,
                      onRemove: () => update({ sourceId: undefined }),
                  },
              ]
            : []),
        ...(filters.createdFrom || filters.createdTo
            ? [
                  {
                      key: "created",
                      label: `${t("adminApplications.filters.created")}: ${dateRange(filters.createdFrom, filters.createdTo)}`,
                      onRemove: () => update({ createdFrom: undefined, createdTo: undefined }),
                  },
              ]
            : []),
        ...(filters.updatedFrom || filters.updatedTo
            ? [
                  {
                      key: "updated",
                      label: `${t("adminApplications.filters.updated")}: ${dateRange(filters.updatedFrom, filters.updatedTo)}`,
                      onRemove: () => update({ updatedFrom: undefined, updatedTo: undefined }),
                  },
              ]
            : []),
    ];
}

/** Active filters that live only in the panel. */
function applicationPanelCount(filters: AdminApplicationFilters): number {
    return [
        filters.applicantUserId,
        filters.sourceId,
        filters.createdFrom || filters.createdTo,
        filters.updatedFrom || filters.updatedTo,
    ].filter(Boolean).length;
}
