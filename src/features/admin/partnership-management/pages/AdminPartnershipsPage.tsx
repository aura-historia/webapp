import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
    AdminPartnershipFilters,
    AdminPartnershipSummary,
} from "@/data/internal/partnership/AdminPartnership.ts";
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
    AdminResultLine,
    AdminRowChevron,
    AdminTextField,
    AdminToolbar,
} from "@/features/admin/common/components/AdminDirectory.tsx";
import { AdminPageHeader } from "@/features/admin/common/components/AdminPageHeader.tsx";
import { AdminStatePanel } from "@/features/admin/common/components/AdminStatePanel.tsx";
import { SECONDARY_PILL_CLASS } from "@/features/admin/common/lib/adminStyles.ts";
import { formatAdminDay } from "@/features/admin/party-management/lib/adminDates.ts";
import { useAdminPartnerships } from "../api/useAdminPartnerships.ts";
import { AdminPartnershipDetailDialog } from "../components/AdminPartnershipDetailDialog.tsx";
import {
    type AdminPartnershipRouteSearch,
    adminPartnershipFiltersOf,
} from "../lib/adminPartnershipSearch.ts";

const COLUMNS =
    "minmax(0, 2.4fr) minmax(0, 0.7fr) minmax(0, 0.8fr) minmax(0, 0.8fr) minmax(0, 0.8fr) 16px";
const ID_FILTERS = ["partyId", "memberUserId", "listingSourceId"] as const;
type IdFilter = (typeof ID_FILTERS)[number];
const FILTER_LABEL_KEY: Record<IdFilter, string> = {
    partyId: "adminPartnerships.filters.organizationId",
    memberUserId: "adminPartnerships.filters.memberUserId",
    listingSourceId: "adminPartnerships.filters.listingSourceId",
};

function clean(search: AdminPartnershipRouteSearch): AdminPartnershipRouteSearch {
    return Object.fromEntries(
        Object.entries(search).filter(([, value]) => typeof value === "string" && value.trim()),
    ) as AdminPartnershipRouteSearch;
}

/** Partnerships by exact ID filters; rows open the partnership dialog (also by URL). */
export function AdminPartnershipsPage({
    search,
    onSearchChange,
}: {
    readonly search: AdminPartnershipRouteSearch;
    readonly onSearchChange: (search: AdminPartnershipRouteSearch) => void;
}) {
    const { t, i18n } = useTranslation();
    const filters = adminPartnershipFiltersOf(search);
    const query = useAdminPartnerships(filters);
    const partnerships = query.data?.pages.flatMap((page) => page.items) ?? [];
    const selected = partnerships.find(
        (partnership) => partnership.partnershipId === search.partnership,
    );
    const setFilters = (next: AdminPartnershipFilters) =>
        onSearchChange(clean({ ...next, partnership: search.partnership }));
    const openPartnership = (partnershipId?: string) =>
        onSearchChange(clean({ ...filters, partnership: partnershipId }));

    const chips: AdminChip[] = ID_FILTERS.flatMap((key) => {
        const value = filters[key];
        return value
            ? [
                  {
                      key,
                      label: `${t(FILTER_LABEL_KEY[key])}: ${value}`,
                      onRemove: () => setFilters({ ...filters, [key]: undefined }),
                  },
              ]
            : [];
    });
    const hasFilters = chips.length > 0;
    const number = new Intl.NumberFormat(i18n.language);

    let content: ReactNode;
    if (query.error && partnerships.length === 0) {
        content = (
            <AdminStatePanel tone="error" title={t("adminPartnerships.loadFailed")}>
                <button
                    type="button"
                    onClick={() => query.refetch()}
                    className={SECONDARY_PILL_CLASS}
                >
                    {t("adminCommon.retry")}
                </button>
            </AdminStatePanel>
        );
    } else if (query.isPending) {
        content = <AdminLedgerSkeleton label={t("adminPartnerships.loading")} />;
    } else if (partnerships.length === 0) {
        content = (
            <AdminStatePanel
                tone="empty"
                title={t(
                    hasFilters ? "adminPartnerships.noMatches" : "adminPartnerships.emptyTitle",
                )}
            >
                {hasFilters && (
                    <button
                        type="button"
                        onClick={() => setFilters({})}
                        className={SECONDARY_PILL_CLASS}
                    >
                        {t("adminCommon.filters.clearSearch")}
                    </button>
                )}
            </AdminStatePanel>
        );
    } else {
        content = (
            <>
                <AdminLedger
                    label={t("adminPartnerships.list.label")}
                    columns={COLUMNS}
                    headings={[
                        t("adminPartnerships.columns.organization"),
                        t("adminPartnerships.columns.members"),
                        t("adminPartnerships.columns.sourceGrants"),
                        t("adminPartnerships.columns.created"),
                        t("adminPartnerships.columns.updated"),
                    ]}
                >
                    {partnerships.map((partnership) => (
                        <PartnershipRow
                            key={partnership.partnershipId}
                            partnership={partnership}
                            selected={partnership.partnershipId === search.partnership}
                            onOpen={() => openPartnership(partnership.partnershipId)}
                        />
                    ))}
                </AdminLedger>
                <AdminLoadMore
                    hasNextPage={query.hasNextPage}
                    isFetchingNextPage={query.isFetchingNextPage}
                    isError={Boolean(query.error)}
                    onLoadMore={() => query.fetchNextPage()}
                    label={t("adminPartnerships.list.loadMorePartnerships")}
                />
            </>
        );
    }

    return (
        <>
            <AdminPageHeader title={t("adminPartnerships.pageTitle")} />
            <AdminToolbar
                label={t("adminPartnerships.filters.title")}
                panelLabel={t("adminPartnerships.filters.byId")}
                panelCount={chips.length}
                panel={(close) => (
                    <PartnershipFilterPanel
                        filters={filters}
                        onApply={(next) => {
                            setFilters(next);
                            close();
                        }}
                        onReset={() => {
                            setFilters({});
                            close();
                        }}
                    />
                )}
                chips={<AdminActiveChips chips={chips} onClearAll={() => setFilters({})} />}
            />
            <AdminResultLine
                summary={t("adminCommon.result.loaded", {
                    loaded: number.format(partnerships.length),
                })}
            />
            {content}
            <AdminPartnershipDetailDialog
                partnershipId={search.partnership}
                summary={selected}
                onClose={() => openPartnership(undefined)}
            />
        </>
    );
}

function PartnershipRow({
    partnership,
    selected,
    onOpen,
}: {
    readonly partnership: AdminPartnershipSummary;
    readonly selected: boolean;
    readonly onOpen: () => void;
}) {
    const { t, i18n } = useTranslation();
    const number = new Intl.NumberFormat(i18n.language);
    return (
        <AdminLedgerRow
            selected={selected}
            onClick={onOpen}
            aria-label={t("adminPartnerships.list.open", { name: partnership.party.name })}
        >
            <AdminPrimaryCell
                title={partnership.party.name}
                sub={`${partnership.party.partyId} · ${partnership.party.partySlugId}`}
                subMono
            />
            <AdminCell head={t("adminPartnerships.columns.members")}>
                <Count value={number.format(partnership.memberCount)} />
            </AdminCell>
            <AdminCell head={t("adminPartnerships.columns.sourceGrants")}>
                <Count value={number.format(partnership.listingSourceGrantCount)} />
            </AdminCell>
            <AdminCell head={t("adminPartnerships.columns.created")}>
                <span className="tabular-nums">
                    {formatAdminDay(partnership.created, i18n.language)}
                </span>
            </AdminCell>
            <AdminCell head={t("adminPartnerships.columns.updated")}>
                <span className="tabular-nums">
                    {formatAdminDay(partnership.updated, i18n.language)}
                </span>
            </AdminCell>
            <AdminRowChevron />
        </AdminLedgerRow>
    );
}

function Count({ value }: { readonly value: string }) {
    return (
        <span className="font-serif text-lg [font-variant-numeric:lining-nums_tabular-nums]">
            {value}
        </span>
    );
}

function PartnershipFilterPanel({
    filters,
    onApply,
    onReset,
}: {
    readonly filters: AdminPartnershipFilters;
    readonly onApply: (filters: AdminPartnershipFilters) => void;
    readonly onReset: () => void;
}) {
    const { t } = useTranslation();
    const [draft, setDraft] = useState<Record<IdFilter, string>>({
        partyId: filters.partyId ?? "",
        memberUserId: filters.memberUserId ?? "",
        listingSourceId: filters.listingSourceId ?? "",
    });
    const tooLong = (key: IdFilter) => draft[key].trim().length > 128;
    const invalid = ID_FILTERS.some(tooLong);
    return (
        <AdminFilterPanel
            onApply={() => {
                if (invalid) return;
                onApply(
                    Object.fromEntries(
                        ID_FILTERS.map((key) => [key, draft[key].trim() || undefined]),
                    ),
                );
            }}
            onReset={onReset}
        >
            {ID_FILTERS.map((key) => (
                <AdminTextField
                    key={key}
                    label={t(FILTER_LABEL_KEY[key])}
                    value={draft[key]}
                    onChange={(value) => setDraft((current) => ({ ...current, [key]: value }))}
                    error={tooLong(key) ? t("adminPartnerships.validation.idTooLong") : undefined}
                    mono
                />
            ))}
        </AdminFilterPanel>
    );
}
