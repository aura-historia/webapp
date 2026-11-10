import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ADMIN_PARTY_SORT_FIELDS,
    ADMIN_PARTY_SORT_ORDERS,
    type AdminPartyFilters,
    type AdminPartySortField,
    type AdminPartySortOrder,
    type Party,
} from "@/data/internal/party/Party.ts";
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
    AdminResultLine,
    AdminRowChevron,
    AdminSortSelect,
    AdminTextField,
    AdminToolbar,
} from "@/features/admin/common/components/AdminDirectory.tsx";
import { AdminPageHeader } from "@/features/admin/common/components/AdminPageHeader.tsx";
import { AdminStatePanel } from "@/features/admin/common/components/AdminStatePanel.tsx";
import {
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";
import { useAdminParties } from "../api/useAdminParties.ts";
import { AdminPartyFormDialog } from "../components/AdminPartyFormDialog.tsx";
import { formatAdminDay } from "../lib/adminDates.ts";

const COLUMNS = "minmax(0, 2fr) minmax(0, 1.6fr) minmax(0, 0.8fr) minmax(0, 0.8fr) 16px";
const DEFAULT_SORT = "name:asc";
const SORT_OPTIONS = ADMIN_PARTY_SORT_FIELDS.flatMap((field) =>
    ADMIN_PARTY_SORT_ORDERS.map((order) => `${field}:${order}` as const),
);
const PANEL_KEYS = [
    "name",
    "phone",
    "email",
    "createdFrom",
    "createdTo",
    "updatedFrom",
    "updatedTo",
] as const satisfies readonly (keyof AdminPartyFilters)[];
type PanelKey = (typeof PANEL_KEYS)[number];
type PanelDraft = Partial<Record<PanelKey, string>>;

function clean(filters: AdminPartyFilters): AdminPartyFilters {
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => typeof value === "string" && value.trim()),
    ) as AdminPartyFilters;
}

/** The organization directory: filters in the URL, rows that open the organization page. */
export function AdminPartiesPage({
    filters,
    onFiltersChange,
}: {
    readonly filters: AdminPartyFilters;
    readonly onFiltersChange: (filters: AdminPartyFilters) => void;
}) {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate({ from: "/$lng" });
    const [formOpen, setFormOpen] = useState(false);
    const [searchText, setSearchText] = useState(filters.query ?? "");
    const [syncedQuery, setSyncedQuery] = useState(filters.query);
    if (syncedQuery !== filters.query) {
        // Keep the field in step with the URL (chips, Clear all, back and forward).
        setSyncedQuery(filters.query);
        setSearchText(filters.query ?? "");
    }
    const partiesQuery = useAdminParties(filters);
    const parties = partiesQuery.data?.pages.flatMap((page) => page.items) ?? [];
    const total = partiesQuery.data?.pages[0]?.total;

    const update = (patch: Partial<AdminPartyFilters>) =>
        onFiltersChange(clean({ ...filters, ...patch }));
    const resetFilters = () =>
        onFiltersChange(
            filters.sort && filters.order ? { sort: filters.sort, order: filters.order } : {},
        );

    const range = (from?: string, until?: string) => `${from ?? "…"} – ${until ?? "…"}`;
    const textChip = (key: "query" | "name" | "phone" | "email", labelKey: string) =>
        filters[key]
            ? [
                  {
                      key,
                      label: `${t(labelKey)}: ${filters[key]}`,
                      onRemove: () => update({ [key]: undefined }),
                  },
              ]
            : [];
    const chips: AdminChip[] = [
        ...textChip("query", "adminParties.filters.search"),
        ...textChip("name", "adminParties.filters.name"),
        ...textChip("phone", "adminParties.filters.phone"),
        ...textChip("email", "adminParties.filters.email"),
        ...(filters.createdFrom || filters.createdTo
            ? [
                  {
                      key: "created",
                      label: `${t("adminParties.filters.created")}: ${range(filters.createdFrom, filters.createdTo)}`,
                      onRemove: () => update({ createdFrom: undefined, createdTo: undefined }),
                  },
              ]
            : []),
        ...(filters.updatedFrom || filters.updatedTo
            ? [
                  {
                      key: "updated",
                      label: `${t("adminParties.filters.updated")}: ${range(filters.updatedFrom, filters.updatedTo)}`,
                      onRemove: () => update({ updatedFrom: undefined, updatedTo: undefined }),
                  },
              ]
            : []),
    ];
    const hasFilters = chips.length > 0;
    const panelCount = chips.filter((chip) => chip.key !== "query").length;
    const number = new Intl.NumberFormat(i18n.language);
    const summary =
        typeof total === "number"
            ? t("adminCommon.result.loadedOfTotal", {
                  loaded: number.format(parties.length),
                  total: number.format(total),
              })
            : t("adminCommon.result.loaded", { loaded: number.format(parties.length) });

    let content: ReactNode;
    if (partiesQuery.error && parties.length === 0) {
        content = (
            <AdminStatePanel tone="error" title={t("adminParties.loadFailed")}>
                <button
                    type="button"
                    onClick={() => partiesQuery.refetch()}
                    className={SECONDARY_PILL_CLASS}
                >
                    {t("adminCommon.retry")}
                </button>
            </AdminStatePanel>
        );
    } else if (partiesQuery.isPending) {
        content = <AdminLedgerSkeleton label={t("adminParties.loading")} />;
    } else if (parties.length === 0) {
        content = (
            <AdminStatePanel
                tone="empty"
                title={t(hasFilters ? "adminParties.noMatches" : "adminParties.emptyTitle")}
            >
                {hasFilters ? (
                    <button type="button" onClick={resetFilters} className={SECONDARY_PILL_CLASS}>
                        {t("adminCommon.filters.clearSearch")}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => setFormOpen(true)}
                        className={PRIMARY_PILL_CLASS}
                    >
                        {t("adminParties.actions.create")}
                    </button>
                )}
            </AdminStatePanel>
        );
    } else {
        content = (
            <>
                <AdminLedger
                    label={t("adminParties.list.label")}
                    columns={COLUMNS}
                    headings={[
                        t("adminParties.columns.organization"),
                        t("adminParties.columns.contact"),
                        t("adminParties.columns.created"),
                        t("adminParties.columns.updated"),
                    ]}
                >
                    {parties.map((party) => (
                        <PartyRow key={party.partyId} party={party} />
                    ))}
                </AdminLedger>
                <AdminLoadMore
                    hasNextPage={partiesQuery.hasNextPage}
                    isFetchingNextPage={partiesQuery.isFetchingNextPage}
                    isError={Boolean(partiesQuery.error)}
                    onLoadMore={() => partiesQuery.fetchNextPage()}
                    label={t("adminParties.list.loadMoreOrganizations")}
                />
            </>
        );
    }

    return (
        <>
            <AdminPageHeader
                title={t("adminParties.pageTitle")}
                action={
                    <button
                        type="button"
                        onClick={() => setFormOpen(true)}
                        className={cn(PRIMARY_PILL_CLASS, "pl-4")}
                    >
                        <Plus aria-hidden="true" className="size-4" strokeWidth={1.8} />
                        {t("adminParties.actions.create")}
                    </button>
                }
            />
            <AdminToolbar
                label={t("adminParties.filters.title")}
                search={{
                    label: t("adminParties.filters.query"),
                    value: searchText,
                    onChange: setSearchText,
                    onSubmit: () => update({ query: searchText.trim() || undefined }),
                }}
                panelCount={panelCount}
                panel={(close) => (
                    <PartyFilterPanel
                        filters={filters}
                        onApply={(draft) => {
                            update(draft);
                            close();
                        }}
                        onReset={() => {
                            update(Object.fromEntries(PANEL_KEYS.map((key) => [key, undefined])));
                            close();
                        }}
                    />
                )}
                chips={<AdminActiveChips chips={chips} onClearAll={resetFilters} />}
            />
            <AdminResultLine
                summary={summary}
                sort={
                    <AdminSortSelect
                        value={
                            filters.sort && filters.order
                                ? `${filters.sort}:${filters.order}`
                                : DEFAULT_SORT
                        }
                        options={SORT_OPTIONS.map((option) => ({
                            value: option,
                            label: t(`adminParties.sort.${option.replace(":", "_")}`),
                        }))}
                        onChange={(value) => {
                            const [sort, order] = value.split(":") as [
                                AdminPartySortField,
                                AdminPartySortOrder,
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
            <AdminPartyFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                onCreated={(partyId) =>
                    navigate({
                        to: "/$lng/admin/parties/$partyId",
                        params: (previous) => ({ ...previous, partyId }),
                    })
                }
            />
        </>
    );
}

function PartyRow({ party }: { readonly party: Party }) {
    const { t, i18n } = useTranslation();
    const contact = [party.contact.phone, party.contact.email].filter(Boolean).join(" · ");
    return (
        <AdminLedgerRow asChild>
            <Link
                to="/$lng/admin/parties/$partyId"
                from="/$lng"
                params={(previous) => ({ ...previous, partyId: party.partyId })}
                aria-label={t("adminParties.list.open", { name: party.name })}
            >
                <AdminPrimaryCell title={party.name} sub={party.partyId} subMono />
                <AdminCell head={t("adminParties.columns.contact")}>
                    <span className={cn("truncate", !contact && "text-ink-muted")}>
                        {contact || t("adminParties.fields.notProvided")}
                    </span>
                </AdminCell>
                <AdminCell head={t("adminParties.columns.created")}>
                    <span className="tabular-nums">
                        {formatAdminDay(party.created, i18n.language)}
                    </span>
                </AdminCell>
                <AdminCell head={t("adminParties.columns.updated")}>
                    <span className="tabular-nums">
                        {formatAdminDay(party.updated, i18n.language)}
                    </span>
                </AdminCell>
                <AdminRowChevron />
            </Link>
        </AdminLedgerRow>
    );
}

function PartyFilterPanel({
    filters,
    onApply,
    onReset,
}: {
    readonly filters: AdminPartyFilters;
    readonly onApply: (draft: PanelDraft) => void;
    readonly onReset: () => void;
}) {
    const { t } = useTranslation();
    const [draft, setDraft] = useState<PanelDraft>(() =>
        Object.fromEntries(PANEL_KEYS.map((key) => [key, filters[key]])),
    );
    const set = (key: PanelKey) => (value: string) =>
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
                label={t("adminParties.filters.name")}
                value={draft.name ?? ""}
                onChange={set("name")}
            />
            <AdminTextField
                label={t("adminParties.filters.phone")}
                value={draft.phone ?? ""}
                onChange={set("phone")}
                inputMode="tel"
            />
            <AdminTextField
                label={t("adminParties.filters.email")}
                value={draft.email ?? ""}
                onChange={set("email")}
                inputMode="email"
            />
            <AdminDateRangeField
                legend={t("adminParties.filters.created")}
                from={draft.createdFrom ?? ""}
                until={draft.createdTo ?? ""}
                onFromChange={set("createdFrom")}
                onUntilChange={set("createdTo")}
            />
            <AdminDateRangeField
                legend={t("adminParties.filters.updated")}
                from={draft.updatedFrom ?? ""}
                until={draft.updatedTo ?? ""}
                onFromChange={set("updatedFrom")}
                onUntilChange={set("updatedTo")}
            />
        </AdminFilterPanel>
    );
}
